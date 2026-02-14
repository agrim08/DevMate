import { Chat } from "../models/chat.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Retrieves a chat between the logged-in user and a target user.
 * If no chat exists, it creates one.
 */
const getChat = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] },
  }).populate({
    path: "messages.senderId",
    select: "firstName lastName",
  });

  if (!chat) {
    chat = new Chat({
      participants: [userId, targetUserId],
      messages: [],
    });
    await chat.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat retrieved successfully"));
});

export { getChat };
