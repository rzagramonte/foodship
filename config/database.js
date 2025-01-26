const mongoose = require("mongoose");
const Agenda = require("agenda");

const dbManager = {
  conn: null, // MongoDB connection
  agenda: null, // Agenda instance
  async connectDB() {
    try {
      // Connect to MongoDB
      this.conn = await mongoose.connect(process.env.DB_STRING);
      console.log(`MongoDB Connected: ${this.conn.connection.host}`);

      // Initialize Agenda
      this.agenda = new Agenda({ db: { address: process.env.DB_STRING } });
      console.log("Agenda initialized.");

      // Graceful shutdown for Agenda
      process.on("SIGTERM", async () => {
        await this.agenda.stop();
        console.log("Agenda stopped on SIGTERM.");
        process.exit(0);
      });
      process.on("SIGINT", async () => {
        await this.agenda.stop();
        console.log("Agenda stopped on SIGINT.");
        process.exit(0);
      });
    } catch (err) {
      console.error("Error connecting to DB or initializing Agenda:", err);
      process.exit(1); // Exit process with failure
    }
  },
};

module.exports = dbManager;
