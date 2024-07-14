const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group",
    required: true,
  },
},{timestamps: true});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Chat", ChatSchema);
