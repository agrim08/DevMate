import { Server } from "socket.io";
import crypto from "crypto";
import { Chat } from "../models/chat.js";
import ConnectionRequest from "../models/connectionRequest.js";

const getRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

/**
 * Initializes Socket.io for real-time communication.
 * @param {http.Server} server - The HTTP server instance.
 */
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      try {
        if (!userId || !targetUserId) {
          socket.emit("error", { message: "Invalid user IDs" });
          console.error("Join chat failed: Missing userId or targetUserId");
          return;
        }
        const room = getRoomId(userId, targetUserId);
        socket.join(room);
        console.log(`${firstName || "Unknown"} joined room ${room}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join chat" });
        console.error("Join chat error:", error.message);
      }
    });

    socket.on("sendMessage", async ({ firstName, userId, targetUserId, content }) => {
      try {
        if (!userId || !targetUserId || !content || !content.trim()) {
          socket.emit("error", { message: "Invalid message data" });
          console.error("Send message failed: Invalid data", { userId, targetUserId, content });
          return;
        }

        const room = getRoomId(userId, targetUserId);

        // Validate connection
        const checkConnected = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
            { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
          ],
        });

        if (!checkConnected) {
          socket.emit("error", { message: "You cannot chat with this user" });
          console.error("Send message failed: Users not connected", { userId, targetUserId });
          return;
        }

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
          content: content.trim(),
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        io.to(room).emit("messageReceived", {
          firstName,
          content: newMessage.content,
          senderId: userId,
          createdAt: newMessage.createdAt,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
        console.error("Send message error:", error.message);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default initializeSocket;