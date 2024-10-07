const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  groupName: { 
    type: String,
    required: true,
  },
  groupImage: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  }],
  preferences: [{ 
    type: String 
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message", 
  }],
  event: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
