const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
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
  meetup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meetup", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Group", GroupSchema);
