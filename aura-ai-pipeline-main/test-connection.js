require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

async function main() {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-flash-latest',
    temperature: 0.7,
  });

  const response = await model.invoke('Say "AuraGen pipeline connected!" and nothing else.');

  console.log('--- AI RESPONSE ---');
  console.log(response.content);
}

main().catch((err) => {
  console.error('Something went wrong:', err.message);
});