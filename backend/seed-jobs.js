const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');
require('dotenv').config();
console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "Key is loaded!" : "KEY IS MISSING!");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateJobEmbeddings() {
  console.log("🚀 Starting Job Embedding Script with Gemini...");

  try {
    const result = await pool.query('SELECT id, title, company, description FROM jobs WHERE embedding IS NULL');
    const jobs = result.rows;

    if (jobs.length === 0) {
      console.log("✅ All jobs already have embeddings.");
      return process.exit(0);
    }

    console.log(`Found ${jobs.length} jobs to process...`);

    // Load the Gemini embedding model
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    for (const job of jobs) {
      const textToEmbed = `Role: ${job.title}. Company: ${job.company}. Details: ${job.description || 'No description'}`;
      console.log(`Processing: ${job.title}...`);

      const response = await model.embedContent(textToEmbed);
      const vectorArray = response.embedding.values;
      const formatVector = `[${vectorArray.join(',')}]`;

      await pool.query('UPDATE jobs SET embedding = $1 WHERE id = $2', [formatVector, job.id]);
    }
    console.log("🎉 All jobs successfully embedded!");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await pool.end();
  }
}
generateJobEmbeddings();