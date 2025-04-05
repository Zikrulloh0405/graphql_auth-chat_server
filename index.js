import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { messageMethods, userMethods } from "./db.js";
import jwt from "jsonwebtoken";

const typeDefs = `#graphql
  type Query {
    messages: [Message]
    protectedData: [Message]
  }

  type Message {
    message: String,
    senderID: ID,
    senderEmail: String,
    recieverID: ID,
    recieverEmail: String,
  }

  type User {
    userID: ID,
    email: String,
    password: String,
    token: String,
  }

  type Mutation {
    login(email: String, password: String): User
  }
`;

const resolvers = {
  Query: {
    messages: () => messageMethods.getAllMessages(), 
    protectedData: (_, __, context) => {
      if (!context.user) {
        throw new Error("Access denied: Unauthorized");
      }
      return messageMethods.getAllMessages();
    },
  },

  Mutation: {
    login: (_, { email, password }) => {
      const result = userMethods.login(email, password);
      if (!result) {
        throw new Error("Invalid email or password");
      }
  
      // Generate a JWT token
      const token = jwt.sign({ userID: result.userID, email: result.email }, "MY_SECRET_KEY", {
        expiresIn: "1h", // Token expires in 1 hour
      });
  
      // Return the user object along with the token
      return { ...result, token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ req, res }) => {
    const token = req.headers.authorization || "";

    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, "MY_SECRET_KEY"); 
      } catch (err) {
        console.error("Invalid token:", err.message);
      }
    }

    return { user };
  },
});

console.log(`🚀  Server ready at: ${url}`);