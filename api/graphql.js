// api/graphql.js - Vercel Serverless Function for GraphQL
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const cors = require("cors");
const { authMiddleware } = require("../server/utils/auth");
const { typeDefs, resolvers } = require("../server/schemas");
const { graphqlUploadExpress } = require("graphql-upload");
const db = require("../server/config/connection");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  "https://roster-hub-v2-y6j2.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
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

// Middleware
app.use(graphqlUploadExpress());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  uploads: false,
  context: ({ req }) => authMiddleware({ req, pubsub }),
  introspection: true,
  playground: true,
});

let serverStarted = false;

// Export handler for Vercel
module.exports = async (req, res) => {
  // Ensure database is connected
  if (db.readyState !== 1) {
    await new Promise((resolve) => {
      db.once("open", resolve);
    });
  }

  // Start Apollo Server once
  if (!serverStarted) {
    await server.start();
    server.applyMiddleware({ 
      app, 
      path: "/api/graphql",
      cors: false // CORS is handled above
    });
    serverStarted = true;
  }

  // Handle the request
  return app(req, res);
};
