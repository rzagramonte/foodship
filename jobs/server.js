const pingServer = async (agenda) => {
  try {
    if (!agenda) {
      throw new Error("Agenda is not initialized. Ensure connectDB has been called.");
    }
    agenda.on("ready", async () => {
      //define job to ping server
      agenda.define("ping server", async () => {
        await fetch("https://foodship-app.onrender.com/");
        console.log("Server pinged successfully");
      });

      // Start Agenda
      await agenda.start();
      console.log("Agenda started successfully.");

      //schedule for every 10 minutes
      agenda.every("10 minutes", "ping server");
    });
  } catch (err) {
    console.error("Error scheduling test job:", err);
  }
};

module.exports = pingServer;
