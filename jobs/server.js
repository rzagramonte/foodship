const pingServer = async (agenda) => {
  try {
    if (!agenda) {
      throw new Error("Agenda is not initialized. Ensure connectDB has been called.");
    }
    agenda.on("ready", async () => {
      agenda.define("ping server", async () => {
        await fetch("https://foodship-app.onrender.com/");
      });

      agenda.every("10 minutes", "ping server");

      // Start Agenda
      await agenda.start();
      console.log("Agenda started successfully.");
    });
  } catch (err) {
    console.error("Error scheduling test job:", err);
  }
};

module.exports = pingServer;
