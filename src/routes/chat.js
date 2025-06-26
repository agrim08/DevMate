const express = require("express");
const chatRouter = express.Router();
const { Chat } = require("../models/chat.js");
const { userAuth } = require("../middlewares/auth.js");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({ error: "User ID not found in request" });
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path:"messages.senderId",
      select:"firstName lastName"
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in chat retrieval or creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = chatRouter;