const express = require("express");
const path = require("path");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { createServer } = require("http");
const { useServer } = require("graphql-ws/lib/use/ws");
const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const { graphqlUploadExpress } = require("graphql-upload");
const db = require("./config/connection");
const onlineUsers = require("./utils/onlineUsers");

// RosterHub Server v2.1 - Build: Jan 16, 2026 - Force Cache Clear
console.log('🚀 Starting RosterHub Server...');
console.log('📝 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 3001);
console.log('🗄️  MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('🔑 JWT Secret exists:', !!process.env.JWT_SECRET);

const PORT = process.env.PORT || 3001;
const app = express();

//system for real-time GraphQL subscriptions
const pubsub = require("./pubsub"); // Use shared PubSub instance

// CORS configuration - Allow requests from your Vercel frontend
const allowedOrigins = [
  "https://roster-hub-v2-y6j2.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware to handle file uploads
app.use(graphqlUploadExpress());

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    mongodb: db.readyState === 1 ? 'connected' : 'disconnected',
  };
  res.status(200).json(healthcheck);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RosterHub API Server',
    status: 'running',
    graphql: '/graphql',
    health: '/health',
  });
});

// In production, serve the Vite build output from client/dist
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");

  // Serve JS/CSS/images, etc.
  app.use(express.static(clientDist));

  // All other GET requests should return index.html so React Router can handle them
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Create an executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create a WebSocket server
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Use graphql-ws server with onConnect/onDisconnect for online status
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx, msg, args) => {
      // ctx.connectionParams contains the params sent from the client
      const token = ctx.connectionParams?.token;
      let userId = null;
      if (token) {
        try {
          const { data } = jwt.verify(token, process.env.JWT_SECRET);
          userId = data?._id;
          if (userId) {
            onlineUsers.add(String(userId));
            pubsub.publish("ONLINE_STATUS_CHANGED", {
              onlineStatusChanged: { _id: userId, online: true },
            });
          }
        } catch (e) {
          // Invalid token
        }
      }
      return { userId };
    },
    onDisconnect: (ctx, code, reason) => {
      const token = ctx.connectionParams?.token;
      let userId = null;
      if (token) {
        try {
          const { data } = jwt.verify(token, process.env.JWT_SECRET);
          userId = data?._id;
          if (userId) {
            onlineUsers.delete(String(userId));
            pubsub.publish("ONLINE_STATUS_CHANGED", {
              onlineStatusChanged: { _id: userId, online: false },
            });
          }
        } catch (e) {}
      }
    },
  },
  wsServer
);

// Create a new instance of an Apollo server with the GraphQL schema
const server = new ApolloServer({
  schema,
  uploads: false,
  context: ({ req }) => authMiddleware({ req, pubsub }),
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// Start the Apollo server
const startApolloServer = async () => {
  try {
    console.log('⚙️  Starting Apollo Server...');
    await server.start();
    console.log('✅ Apollo Server started');
    
    server.applyMiddleware({
      app,
      path: "/graphql",
      cors: false, // CORS is handled by Express middleware above
    });
    console.log('✅ GraphQL middleware applied');

    // Add error handler for database connection
    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    // Start the Express server immediately
    // Don't wait for MongoDB - let it connect in the background
    httpServer.listen(PORT, () => {
      console.log(`✅ HTTP server running on port ${PORT}!`);
      console.log(`🔗 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/graphql`);
      
      // Check if DB is already connected
      if (db.readyState === 1) {
        console.log('✅ MongoDB already connected');
      } else {
        console.log('⏳ Waiting for MongoDB connection...');
        db.once("open", () => {
          console.log('✅ MongoDB connected');
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Call the async function to start the server
startApolloServer().catch(err => {
  console.error('❌ Fatal error starting server:', err);
  process.exit(1);
});
