const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const room = getRoomId(userId, targetUserId);
      console.log(`${firstName} joined room ${room}`);
      socket.join(room);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, content }) => {
        const room = getRoomId(userId, targetUserId);
        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
    
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          const newMessage = {
            senderId: userId,
            content,
            createdAt: new Date(), // Add createdAt field
          };
    
          chat.messages.push(newMessage);
    
          await chat.save();
    
          io.to(room).emit("messageReceived", { 
            firstName, 
            content, 
            senderId: userId,
            createdAt:newMessage.createdAtnpm 
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
