const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema({
  participants: [
    { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  ],
  messages: [messageSchema],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };
