const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  date: { 
    type: Date,
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", 
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat", 
  },
  status: [{ 
    type: String,
    enum: ['scheduled', 'completed', 'canceled'],
    default: 'scheduled',
  }],
});

module.exports = mongoose.model("Event", EventSchema);
