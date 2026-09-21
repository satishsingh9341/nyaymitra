const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('[AI Service] Initialization error:', err.message);
  }
}

async function generateAIContent(systemPrompt, userContent) {
  if (!genAI) {
    throw new Error('Gemini AI is not initialized. Please verify GEMINI_API_KEY in server/.env');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userContent);
    const text = result.response.text();
    return text;
  } catch (err) {
    console.error('[AI Service Error]', err.message);
    throw err;
  }
}

module.exports = {
  generateAIContent,
};
