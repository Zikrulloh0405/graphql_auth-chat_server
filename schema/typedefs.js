export const typeDefs = `#graphql
  type Query {
    messages: [Message]
    protectedDataMessages: [Message]
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
    sendMessage(message: String, senderID: ID, recieverID: ID): Message
  }

  type Subscription {
    msgs: [Message]
  }
`;
