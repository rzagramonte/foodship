const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  date: { 
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group", 
  },
  status: [{ 
    type: String,
    enum: ['scheduled', 'completed', 'canceled'],
    default: 'scheduled',
  }],
});

module.exports = mongoose.model("Event", EventSchema);
