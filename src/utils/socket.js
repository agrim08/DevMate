const socket = require("socket.io");
const crypto = require("crypto");

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

    socket.on("sendMessage", ({ firstName, userId, targetUserId, content }) => {
      const room = getRoomId(userId, targetUserId);
      console.log(`${firstName} ${content}`);
      io.to(room).emit("messageRecieved", { firstName, content });
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
