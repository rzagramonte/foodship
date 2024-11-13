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
ChatSchema.pre("save", async function () {
  if (!this.groupName) {
    try {
      // Map through member IDs and fetch userNames
      const userNames = await Promise.all(
        this.members.map(async (userId) => {
          const user = await User.findById(userId);
          return user.userName;
        })
      );
      // Set groupName as a comma-separated list of user names
      this.groupName = userNames.join(", ");
    } catch (error) {
      console.error("Error setting groupName in pre-save hook:", error);
    }
  }
});

module.exports = mongoose.model("Chat", ChatSchema);
