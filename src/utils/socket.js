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

// Map to track online users: userId -> set of socketIds (handling multiple tabs)
const userSocketMap = new Map();

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
    // Authenticate user on connection
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
      
      // Notify everyone that this user is now online
      io.emit("userStatusUpdate", { userId, status: "online" });
      console.log(`User ${userId} connected. Total online: ${userSocketMap.size}`);
    }

    // New request notification
    socket.on("newConnectionRequest", ({ toUserId }) => {
      const targetSockets = userSocketMap.get(toUserId);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit("requestCountUpdate");
        });
      }
    });

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      try {
        if (!userId || !targetUserId) {
          socket.emit("error", { message: "Invalid user IDs" });
          return;
        }
        const room = getRoomId(userId, targetUserId);
        socket.join(room);
        console.log(`${firstName || "Unknown"} joined room ${room}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    socket.on("sendMessage", async ({ firstName, userId, targetUserId, content }) => {
      try {
        if (!userId || !targetUserId || !content || !content.trim()) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        const room = getRoomId(userId, targetUserId);
        const userOId = new mongoose.Types.ObjectId(userId);
        const targetOId = new mongoose.Types.ObjectId(targetUserId);

        const checkConnected = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userOId, toUserId: targetOId, status: "accepted" },
            { fromUserId: targetOId, toUserId: userOId, status: "accepted" },
          ],
        });

        if (!checkConnected) {
          socket.emit("error", { message: "Security Protocol: Active connection required." });
          return;
        }

        let chat = await Chat.findOne({
          participants: { $all: [userOId, targetOId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userOId, targetOId], messages: [] });
        }

        const newMessage = {
          senderId: userOId,
          content: content.trim(),
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Broadcast message to room
        io.to(room).emit("messageReceived", {
          firstName,
          content: newMessage.content,
          senderId: userId,
          targetUserId: targetUserId,
          createdAt: newMessage.createdAt,
        });

        // Notify target user globally (for unread count)
        const targetSockets = userSocketMap.get(targetUserId);
        if (targetSockets) {
          targetSockets.forEach(id => {
            // Only emit if they aren't in the specific room? 
            // Actually, frontend can decide to increment unread if they aren't active in that chat.
            io.to(id).emit("globalMessageReceived", {
              senderId: userId,
              content: newMessage.content,
              createdAt: newMessage.createdAt
            });
          });
        }

      } catch (error) {
        socket.emit("error", { message: "Transmission failed." });
      }
    });

    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsersList", Array.from(userSocketMap.keys()));
    });

    socket.on("disconnect", () => {
      if (userId && userSocketMap.has(userId)) {
        userSocketMap.get(userId).delete(socket.id);
        if (userSocketMap.get(userId).size === 0) {
          userSocketMap.delete(userId);
          io.emit("userStatusUpdate", { userId, status: "offline" });
          console.log(`User ${userId} fully disconnected.`);
        }
      }
    });
  });
};

export default initializeSocket;