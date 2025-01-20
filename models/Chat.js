const mongoose = require("mongoose");

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
  cuisines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cuisine", 
  }],
  interests: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interest", 
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message", 
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
