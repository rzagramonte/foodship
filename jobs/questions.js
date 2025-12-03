const dbManager = require("../config/database");
const { InferenceClient } = require("@huggingface/inference");
const { DateTime } = require("luxon");

const fetchQuestionsFromAPI = async () => {
  const SYSTEM_PROMPT = `
You are a psychotherapist with extensive experience in fostering deep interpersonal connections.

Your task is to generate 4 thought-provoking and emotionally intelligent questions designed to help participants build a profound sense of trust, understanding, and connection. The questions should evoke vulnerability, curiosity, and shared humanity, encouraging participants to reflect on their experiences, values, and dreams.

These questions are strictly personal and human-focused. They must not be about business, industry, technology, economics, or market trends.

Questions should explore:
- identity
- emotions or values
- formative memories
- fears or hopes
- relationships
- personal growth

Rules:
- No bolding, no quotes, no numbering, no special characters.
- No lists, no explanations or commentary.
- Only output the four questions, each ending with a question mark.

Respond ONLY with valid JSON in the following shape:

{
  "questions": [
    "Question 1 here?",
    "Question 2 here?",
    "Question 3 here?",
    "Question 4 here?"
  ]
}
`;

  console.log("Fetching questions from Hugging Face API...");

  try {
    // Get the API key from environment variables
    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      console.error("Hugging Face API key not configured");
      throw new Error("Hugging Face API key not configured");
    }

    // Initialize Hugging Face Inference Client
    const client = new InferenceClient(HF_API_KEY);

    // Prepare the system prompt and user input
    const messages = [
      { role: "user", content: SYSTEM_PROMPT },
      //{ role: "user", content: "Generate 4 questions for a meetup." },
    ];

    // Call the Hugging Face API
    const response = await client.chatCompletion({
      model: "katanemo/Arch-Router-1.5B",
      messages: messages,
      max_tokens: 1024,
    });

    console.log("Response from Hugging Face API:", response);

    // Extract the raw content from the response
    const rawContent = response.choices[0].message.content;
    console.log(rawContent);

    const jsonText = rawContent.replace(/```json|```/g, "").trim();

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (err) {
      console.error("Failed to parse JSON from model:", err, jsonText);
    }

    const questions = Array.isArray(data?.questions) ? data.questions : [];
    // Return the questions
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Error fetching questions from Hugging Face API");
  }
};

const scheduleQuestions = async (event) => {
  try {
    const agenda = dbManager.agenda;

    if (!agenda) {
      throw new Error("Agenda is not initialized. Ensure connectDB has been called.");
    }

    // Fetch questions from Hugging Face API
    const questions = await fetchQuestionsFromAPI();
    console.log("Fetched questions:", questions);

    // Schedule each question with a 15-minute delay
    for (let i = 0; i < questions.length; i++) {
      const eventDate = new Date(event.eventDate);
      const localDate = DateTime.fromJSDate(eventDate);
      const utcDate = localDate.toUTC();
      const scheduledDate = utcDate.plus({ minutes: i * 15 }).toISO();

      // Schedule the job
      await agenda.schedule(scheduledDate, "send question", {
        event,
        question: questions[i],
      });

      console.log(`Scheduled question ${i + 1} at ${scheduledDate}`);
    }
  } catch (err) {
    console.error("Error scheduling questions:", err);
    throw err; // Re-throw to handle the error upstream
  }
};

module.exports = scheduleQuestions;
