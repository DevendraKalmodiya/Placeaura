const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using the confirmed ID from your list
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent("Hello! I am testing the 2.5-flash model.");
    console.log("✅ Success! AI responded:", result.response.text());
  } catch (e) {
    console.error("❌ Still failing:", e.message);
  }
}
list();

vercel.app
