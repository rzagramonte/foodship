const Agenda = require('agenda');
const mongoose = require('mongoose');
const { HfInference } = require("@huggingface/inference");

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

async function fetchQuestionsFromAPI() {

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
            { role: "user", content: "Generate 4 questions for a meetup." }, // You can modify this to be more specific if needed
        ];

        // Call the Hugging Face API
        const response = await hf.chatCompletion({
            model: "mistralai/Mistral-Nemo-Instruct-2407", // Use an appropriate model
            messages: messages,
            max_tokens: 1024,
        });

        console.log("Response from Hugging Face API:", response);

        // Extract the questions from the response (modify this according to API structure)
        const questions = response.choices[0].message.content.split("\n").map(question => question.trim());

        // Return the questions
        return questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Error fetching questions from Hugging Face API");
    }
}



agenda.define('send meetup questions',  { lockLifetime: 10000, priority: 'high' }, async (job) => {
  const { chatId, eventId } = job.attrs.data; // Pass relevant data with the job
  try {
    // Fetch questions from the Hugging Face API
    const questions = await fetchQuestionsFromAPI();

    // Simulate sending questions to the chat
    for (let i = 0; i < questions.length; i++) {
      console.log(`Sending question ${i + 1} to chat ${chatId}:`, questions[i]);

      // Add a 15-minute delay between each question
      await agenda.schedule(new Date(Date.now() + i * 15 * 60 * 1000), 'send single question', {
        chatId,
        question: questions[i],
      });
    }

    console.log(`All questions sent for event ${eventId}`);
  } catch (err) {
    console.error('Error while sending meetup questions:', err);
    throw err; // Mark as failed so Agenda can retry
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