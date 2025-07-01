const express = require("express");
const path = require("path");
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

const PORT = process.env.PORT || 3001;
const app = express();

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub(); // Ensure this instance is used in the resolvers

// Middleware to handle file uploads
app.use(graphqlUploadExpress());

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// // Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// // Define routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });
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

// In-memory set to track online users
// const onlineUsers = new Set();

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
  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      origin: "*", // or specify your frontend's domain
      credentials: true,
    },
  });

  // Start the Express server
  db.once("open", () => {
    httpServer.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer();
