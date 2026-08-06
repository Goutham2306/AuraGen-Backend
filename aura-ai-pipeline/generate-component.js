const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates dynamic React JSX components using Gemini AI based on prompt and telemetry data.
 * @param {string} prompt - User request or component context
 * @param {Object} telemetry - User interaction metrics { hesitation, clicks }
 */
async function generateComponent(prompt = 'Generate adaptive component', telemetry = { hesitation: 0, clicks: 0 }) {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10) || 4096,
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
      },
    });

    const systemPrompt = `
      You are an AI Generative UI Engine. Generate modern React (JSX) component markup with Tailwind CSS styling based on the user prompt and user friction metrics.
      
      User Prompt: "${prompt}"
      Interaction Metrics -> Hesitation Delay: ${telemetry.hesitation}ms, Click Count: ${telemetry.clicks}
      
      CRITICAL INSTRUCTIONS:
      1. Return ONLY valid raw JSX code inside a single parent standard element (e.g., <div>).
      2. Do NOT use markdown code fences (no \`\`\`jsx or \`\`\`).
      3. Do NOT include import or export statements.
      4. Ensure pure Tailwind CSS class names are used for styling.
    `;

    const result = await model.generateContent(systemPrompt);
    const rawText = result.response.text();

    // Clean up code fences if model includes them
    const cleanJsx = rawText
      .replace(/```(jsx|javascript|html)?/gi, '')
      .replace(/```/g, '')
      .trim();

    return {
      success: true,
      jsx: cleanJsx,
      explanation: `Simplified UI layout adapted for ${telemetry.hesitation}ms hesitation delay and ${telemetry.clicks} user interactions.`,
      cognitiveLoad: telemetry.hesitation > 3000 ? 75 : 40,
      stressLevel: telemetry.clicks > 5 ? 'Medium' : 'Low',
      focusScore: 85,
    };
  } catch (err) {
    console.error('❌ Gemini AI Pipeline Error:', err.message);

    // Fallback card structure if API Key is rate-limited / quota exhausted
    return {
      success: false,
      jsx: `<div className="p-6 bg-slate-900 text-white rounded-xl border border-indigo-500 shadow-xl">
              <h3 className="text-lg font-bold text-indigo-400">Adaptive Component (Fallback Mode)</h3>
              <p className="mt-2 text-sm text-slate-300">Generated fallback interface due to API rate limit.</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 text-xs bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                  Hesitation: ${telemetry.hesitation || 0}ms
                </span>
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Clicks: ${telemetry.clicks || 0}
                </span>
              </div>
            </div>`,
      explanation: 'Fallback component served during API rate limiting.',
      cognitiveLoad: telemetry.hesitation > 3000 ? 70 : 35,
      stressLevel: telemetry.clicks > 5 ? 'Medium' : 'Low',
      focusScore: 80,
    };
  }
}

module.exports = { generateComponent };