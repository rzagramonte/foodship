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
  group: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group",
    required: true,
  },
});

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Connection", ConnectionSchema);
