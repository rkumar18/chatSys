const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String  
    },
    chatId: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ["TEXT", "IMAGE"],
        required: true
    },
    isRead:{
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
