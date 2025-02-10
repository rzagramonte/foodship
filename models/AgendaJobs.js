const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventDate: { type: Date, required: true }
});

const AgendaJobSchema = new mongoose.Schema({
    name: { type: String, required: true },
    data: {
      event: { type: eventSchema, required: true },
      question: { type: String, required: true }
    },
    priority: { type: Number, default: 0 },
    shouldSaveResult: { type: Boolean, default: false },
    type: { type: String, default: 'normal' },
    nextRunAt: { type: Date, default: null },
    lastModifiedBy: { type: mongoose.Schema.Types.Mixed, default: null },
    lockedAt: { type: Date, default: null },
    lastRunAt: { type: Date, default: null },
    lastFinishedAt: { type: Date, default: null }
});

module.exports = mongoose.model("AgendaJob", AgendaJobSchema);
