const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  groupName: { 
    type: String,
  },
  groupImage: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  }],
  foodPreferences: [{
    type: String,
  }],
  interests: [{ 
    type: String, 
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
