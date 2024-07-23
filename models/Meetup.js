const mongoose = require("mongoose");

const MeetupSchema = new mongoose.Schema({
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

//MongoDB Collection named here - will give lowercase plural of name 
module.exports = mongoose.model("Meetup", MeetupSchema);
