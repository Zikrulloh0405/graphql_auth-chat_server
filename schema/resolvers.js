import { messageMethods, userMethods } from "./db.js";

export const resolvers = {
    Query: {
      messages: () => messageMethods.getAllMessages(),
      protectedDataMessages: (_, __, context) => {
        if (!context.user) throw new Error("Access denied: Unauthorized");
        return messageMethods.getAllMessages();
      },
    },
  
    Mutation: {
      login: (_, { email, password }) => {
        const result = userMethods.login(email, password);
        if (!result) throw new Error("Invalid email or password");
        const token = jwt.sign(
          { userID: result.userID, email: result.email },
          "MY_SECRET_KEY",
          { expiresIn: "1h" }
        );
        return { ...result, token };
      },
  
      sendMessage: (_, { message, senderID, recieverID }, context) => {
        if (!context.user) throw new Error("Access denied: Unauthorized");
        if (!recieverID) throw new Error("You must provide a recieverID.");
  
        const newMessage = {
          message,
          senderID: senderID,
          senderEmail: userMethods.getUserEmailByID(senderID),
          recieverID: recieverID,
          recieverEmail: userMethods.getUserEmailByID(recieverID),
        };

        console.log("New message:", newMessage);
  
        messageMethods.addMessage(newMessage);
  
        // Publish the new message
        pubsub.publish(MESSAGE_CREATED, {
          msgs: newMessage,
        });
  
        return newMessage;
      },
    },
  
    Subscription: {
      msgs: {
        subscribe: async (_, __, context) => {
            if (!context.user) throw new Error("Access denied: Unauthorized");
            console.log("Client subscribed, publishing existing messages...");
            const allMessages = messageMethods.getAllMessages();
            for (const msg of allMessages) {
              console.log("Publishing:", msg);
              await pubsub.publish(MESSAGE_CREATED, { msgs: msg });
            }
            console.log("Returning async iterator...");
            return pubsub.asyncIterator([MESSAGE_CREATED]);
          },
      },
    },
  };