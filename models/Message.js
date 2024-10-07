const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  cloudinaryId: { 
    type: String, 
    required: true,
  },
  contentType: {
    type: String, 
    enum: ['text', 'image'], 
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});

module.exports = mongoose.model("Message", MessageSchema);
