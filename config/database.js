const mongoose = require("mongoose");
const Agenda = require("agenda");
const pingServer = require("../jobs/server");

const dbManager = {
  conn: null, // MongoDB connection
  agenda: null, // Agenda instance
  async connectDB() {
    try {
      // Connect to MongoDB
      this.conn = await mongoose.connect(process.env.DB_STRING);
      console.log(`MongoDB Connected: ${this.conn.connection.host}`);

      // Initialize Agenda
      this.agenda = new Agenda({ db: { address: process.env.DB_STRING, collection: 'agendajobs' } });
      console.log("Agenda initialized.");

      //Ping server
      await pingServer(this.agenda);

      // Graceful shutdown for Agenda
      const stop = async () => {
        await this.agenda.stop();
        console.log("Agenda stopped on SIGTERM.");
        process.exit(0);
      };
      process.on("SIGTERM", stop);
      process.on("SIGINT", stop);
    } catch (err) {
      console.error("Error connecting to DB or initializing Agenda:", err);
      process.exit(1); // Exit process with failure
    }
  },
};

module.exports = dbManager;
