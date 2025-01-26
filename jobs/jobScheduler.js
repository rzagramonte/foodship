// jobScheduler.js
const dbManager = require("../config/database");
const { HfInference } = require("@huggingface/inference");

const fetchQuestionsFromAPI = async () => {
  const SYSTEM_PROMPT = "You are a psychotherapist with extensive experience in fostering deep interpersonal connections. Your task is to generate 4 thought-provoking and emotionally intelligent questions designed to help participants build a profound sense of trust, understanding, and connection. The questions should evoke vulnerability, curiosity, and shared humanity, encouraging participants to reflect on their experiences, values, and dreams.";

  console.log("Fetching questions from Hugging Face API...");

  try {
    // Get the API key from environment variables
    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      console.error("Hugging Face API key not configured");
      throw new Error("Hugging Face API key not configured");
    }

    // Initialize Hugging Face Inference Client
    const hf = new HfInference(HF_API_KEY);

    // Prepare the system prompt and user input
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Generate 4 questions for a meetup." },
    ];

    // Call the Hugging Face API
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-Nemo-Instruct-2407", // Use an appropriate model
      messages: messages,
      max_tokens: 1024,
    });

    console.log("Response from Hugging Face API:", response);

    // Extract the questions from the response (modify this according to API structure)
    const questions = response.choices[0].message.content.split("\n").map((question) => question.trim());

    // Return the questions
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Error fetching questions from Hugging Face API");
  }
};

const scheduleJobs = async (event) => {
  try {
    const agenda = dbManager.agenda;

    if (!agenda) {
      throw new Error("Agenda is not initialized. Ensure connectDB has been called.");
    }

    // Define the job
    agenda.define("test job", async (job) => {
      // Access the passed event object
      const { event } = job.attrs.data;
      console.log("Event data:", event); // This will log the event data
      try {
        // Fetch questions from the Hugging Face API
        const questions = await fetchQuestionsFromAPI();

        // Simulate sending questions to the chat
        for (let i = 0; i < questions.length; i++) {
          console.log(`Sending question ${i + 1} to chat ${event.chatId}:`, questions[i]);

          // Convert eventDate string to Date object
          const eventDate = new Date(event.eventDate);

          // Add a 15-minute delay for each question
          const scheduledDate = new Date(eventDate.getTime() + i * 15 * 60 * 1000); // Delay by i * 15 mins

          // Add a 15-minute delay between each question
          await agenda.schedule(scheduledDate, "send single question", {
            chatId: event.chatId,
            eventId: event.eventId,
            eventDate: event.eventDate,
            question: questions[i],
          });
        }

        console.log(`All questions sent for event ${event.eventId}`);
      } catch (err) {
        console.error("Error while sending meetup questions:", err);
        throw err; // Mark as failed so Agenda can retry
      }
    });

    // Start Agenda
    await agenda.start();
    console.log("Agenda started successfully.");

    // Schedule the test job
    await agenda.now("test job", { event });
    console.log("Test job scheduled to run immediately.");
  } catch (err) {
    console.error("Error scheduling test job:", err);
  }
};

module.exports = scheduleJobs;
