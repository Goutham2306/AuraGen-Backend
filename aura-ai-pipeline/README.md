// test-connection.js
require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL,
  maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS),
  temperature: Number(process.env.GEMINI_TEMPERATURE),
});

async function testConnection() {
  try {
    console.log('Testing connection to Gemini model...');
    const response = await model.invoke('Hello! Confirm connection.');
    console.log('Response received successfully:');
    console.log(response.content);
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
}

testConnection();