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
  meetupDetails: {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Group", GroupSchema);
