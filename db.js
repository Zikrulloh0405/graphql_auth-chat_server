const messages = [
  {
    message: "hello",
    senderID: 1,
    senderEmail: "test1@gmail.com",
    recieverID: 2,
    recieverEmail: "test2@gmail.com",
  },
  {
    message: "hi",
    senderID: 2,
    senderEmail: "test2@gmail.com",
    recieverID: 1,
    recieverEmail: "test1@gmail.com",
  },
];

const users = [
  {
    userID: 1,
    email: "test1@gmail.com",
    password: "test1",
  },
  {
    userID: 2,
    email: "test2@gmail.com",
    password: "test2",
  },
];

export const userMethods = {
  login: (email, password) => {
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (!user) {
      console.log("Invalid credentials");
      throw new Error("Invalid credentials");
    }
    console.log(`User ${user.email} logged in`);
    return user;
  },

  getAllUsers: () => {
    return users;
  },

  getUserEmailByID: (id) => {
    const user = users.find((u) => u.userID == id);
    return user ? user.email : "Unknown User";
  },
};

export const messageMethods = {
  getAllMessages: () => {
    return messages;
  },

  addMessage: (message) => {
    messages.push(message);
    return message;
  },
};
