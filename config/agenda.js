const Agenda = require('agenda');
const mongoose = require('mongoose');

// Connect to your MongoDB
const agenda = new Agenda({
  db: { address: process.env.DB_STRING, collection: 'jobs' },
  processEvery: '30 seconds', // Polling interval
});

// Start Agenda.js
mongoose.connection.once('open', async () => {
  try {
    await agenda.start();
    console.log('Agenda started');
  } catch (err) {
    console.error('Error starting Agenda:', err);
  }
});

// Graceful shutdown
(async () => {
  process.on('SIGTERM', async () => {
    await agenda.stop();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await agenda.stop();
    process.exit(0);
  });
})();

module.exports = agenda;
