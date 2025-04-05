import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";
import { typeDefs } from "./schema/typedefs.js";
import { resolvers } from "./schema/resolvers.js";

const pubsub = new PubSub();
const MESSAGE_CREATED = "MESSAGE_CREATED";

// Create the schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app
const app = express();
const httpServer = http.createServer(app);

// Create a WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Use the WebSocket server for subscriptions
useServer({
    schema,
    context: (ctx) => {
      const token = ctx.connectionParams?.authorization?.split(" ")[1] || "";
      console.log("WebSocket token:", token);
      let user = null;
      if (token) {
        try {
          user = jwt.verify(token, "MY_SECRET_KEY");
        } catch (err) {
          console.error("Invalid WebSocket token:", err.message);
        }
      }
      return { user };
    },
  }, wsServer);

// Create the Apollo Server
const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1] || "";
      console.log("Raw authorization header:", req.headers.authorization);
      let user = null;
  
      if (token) {
        try {
          user = jwt.verify(token, "MY_SECRET_KEY");
        } catch (err) {
          console.error("Invalid token:", err.message);
        }
      }
  
      console.log("User from token:", user);
      return { user };
    },
  });

await server.start();
app.use("/graphql", cors({ origin: "*", credentials: true }), express.json(), expressMiddleware(server));

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is now running on http://localhost:${PORT}/graphql`);
});