import { Server } from "socket.io";
import crypto from "crypto";
import mongoose from "mongoose";
import { Chat } from "../models/chat.js";
import ConnectionRequest from "../models/connectionRequest.js";
import config from "../config/index.js";

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
      origin: ["http://localhost:5173", config.frontendUrl].filter(Boolean),
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
          return;
        }

        const room = getRoomId(userId, targetUserId);

        // Explicitly cast to ObjectId for robust querying
        const userOId = new mongoose.Types.ObjectId(userId);
        const targetOId = new mongoose.Types.ObjectId(targetUserId);

        // Validate connection status
        const checkConnected = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userOId, toUserId: targetOId, status: "accepted" },
            { fromUserId: targetOId, toUserId: userOId, status: "accepted" },
          ],
        });

        if (!checkConnected) {
          socket.emit("error", { message: "Security Protocol: Active connection required to transmit data." });
          return;
        }

        let chat = await Chat.findOne({
          participants: { $all: [userOId, targetOId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userOId, targetOId],
            messages: [],
          });
        }

        const newMessage = {
          senderId: userOId,
          content: content.trim(),
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Transmit to the secure room
        io.to(room).emit("messageReceived", {
          firstName,
          content: newMessage.content,
          senderId: userId, // Keep as string for frontend comparison
          targetUserId: targetUserId, // Added for frontend relevance verification
          createdAt: newMessage.createdAt,
        });
      } catch (error) {
        socket.emit("error", { message: "Transmission failed. Neural link unstable." });
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