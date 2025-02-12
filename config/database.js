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
      this.agenda = new Agenda({
        db: { address: process.env.DB_STRING, collection: "agendajobs" },
      });
      console.log("Agenda initialized.");

      // Define Agenda jobs
      this.defineJobs();

      // Start Agenda
      await this.startAgenda();

      this.agenda.on("ready", async () => {
        await pingServer(this.agenda);
      });

      // Graceful shutdown for Agenda
      this.setupShutdownHandlers();
    } catch (err) {
      console.error("Error connecting to DB or initializing Agenda:", err);
      process.exit(1); // Exit process with failure
    }
  },

  // Define all Agenda jobs
  defineJobs() {
    // Ping server job
    this.agenda.define("ping server", async () => {
      await fetch("https://foodship-app.onrender.com/");
      console.log("Server pinged successfully.");
    });

    // Send question job
    this.agenda.define("send question", async (job) => {
      const { postEventQuestion } = require("../controllers/events");
      const { event, question } = job.attrs.data; // Extracts individual question
      const chatId = event.chatId;
      await postEventQuestion({ chatId, question }); // Use `await` if `postEventQuestion` is async
      console.log(`Sent question to chat ${chatId}:`, question);
    });

    console.log("Agenda jobs defined.");
  },

  // Start Agenda
  async startAgenda() {
    this.agenda.on("ready", async () => {
      await this.agenda.start(); // Start Agenda
      console.log("Agenda is ready to process jobs.");
    });

    // Handle Agenda errors
    this.agenda.on("error", (err) => {
      console.error("Agenda error:", err);
    });
  },

  // Graceful shutdown handlers
  setupShutdownHandlers() {
    const stop = async () => {
      await this.agenda.stop();
      console.log("Agenda stopped on SIGTERM/SIGINT.");
      process.exit(0);
    };

    process.on("SIGTERM", stop);
    process.on("SIGINT", stop);
  },
};

module.exports = dbManager;
