require('dotenv').config();

async function checkGoogleModels() {
  console.log("🔍 Asking Google for available embedding models...");
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("❌ Error: GEMINI_API_KEY is missing from your .env file!");
      return;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    // Filter the list to ONLY show models that support text embeddings
    const embeddingModels = data.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent')
    );
    
    console.log("\n✅ Google says your API key has access to these EXACT embedding models:");
    embeddingModels.forEach(m => {
      // The API returns "models/name", so we strip "models/" for your Node code
      console.log(`👉 "${m.name.replace('models/', '')}"`);
    });
    
  } catch (err) {
    console.error("❌ Failed to fetch:", err.message);
  }
}

checkGoogleModels();