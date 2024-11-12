const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  }],
  groupName: { 
    type: String,
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

// Middleware to set a default groupName if not provided
ChatSchema.pre("save", function () {
  if (!this.groupName && this.members.length > 0) this.groupName = `${this.members.join(", ")}`;
});

module.exports = mongoose.model("Chat", ChatSchema);
