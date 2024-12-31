const mongoose = require("mongoose");
const User = require("./User");

const ChatSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  }],
  groupName: { 
    type: String,
  },
  groupNameSet: {
    type: Boolean,
    default: false,
  },
  groupImage: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
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
