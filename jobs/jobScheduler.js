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
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: messages,
      max_tokens: 1024,
    });

    console.log("Response from Hugging Face API:", response);

    // Extract the raw content from the response
    const rawContent = response.choices[0].message.content;

    // Regex pattern to capture just the questions
    const questionPattern = /\*\*"([^"]+)"\*\*/g;

    // Find all questions using the regex pattern
    const questions = [];
    let match;
    while ((match = questionPattern.exec(rawContent)) !== null) {
      questions.push(match[1].trim());
    }

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

    const questions = await fetchQuestionsFromAPI();

    // Defines the job for sending a single question
    agenda.define("send single question", async (job) => {
      const { postEventQuestion } = require("../controllers/events");
      const { event, question } = job.attrs.data; // Extracts individual question
      const chatId = event.chatId;
      postEventQuestion({ chatId, question });
      console.log(`Sending question to chat ${chatId}:`, question);
    });

    // Schedule each question with a 15-minute delay
    for (let i = 0; i < questions.length; i++) {
      const baseDate = new Date(event.eventDate); // local time
      const utcDate = new Date(baseDate.toISOString()); // Convert it to UTC
      const scheduledDate = new Date(utcDate.getTime() + i * 15 * 60 * 1000).toISOString();

      // Schedules a separate job for each question
      await agenda.schedule(scheduledDate, "send single question", {
        event,
        question: questions[i],
      });

      console.log(`Scheduled question ${i + 1} at ${scheduledDate}`);
    }
    // Start Agenda
    await agenda.start();
    console.log("Agenda started successfully.");
  } catch (err) {
    console.error("Error scheduling test job:", err);
  }
};

module.exports = scheduleJobs;
