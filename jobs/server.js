const pingServer = async (agenda) => {
  try {
    if (!agenda) {
      throw new Error("Agenda is not initialized. Ensure connectDB has been called.");
    }

    //schedule for every 10 minutes
    agenda.every("15 minutes", "ping server");
  } catch (err) {
    console.error("Error scheduling test job:", err);
  }
};

module.exports = pingServer;
