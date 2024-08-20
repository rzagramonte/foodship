const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  connection: {
    type: String,
    required: true,
  },
  sendTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupChat: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "GroupChat",
    required: true,
  },
});

module.exports = mongoose.model("Connection", ConnectionSchema);
