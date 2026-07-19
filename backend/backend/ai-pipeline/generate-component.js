// generate-component.js
require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { SYSTEM_PROMPT } = require('./system-prompt');
const { validateComponent } = require('./validate-component');

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-flash-latest',
  temperature: 0.7,
});

/**
 * Generates a React component based on a user prompt, with validation
 * and error handling built in. This is the function Gautham will call.
 * @param {string} userPrompt
 * @returns {Promise<{ success: boolean, jsx?: string, error?: string }>}
 */
async function generateComponent(userPrompt) {
  try {
    const response = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    let code = response.content;
    code = code.replace(/```jsx?/g, '').replace(/```/g, '').trim();

    const validation = validateComponent(code);

    if (!validation.isValid) {
      console.warn('Validation issues found:', validation.errors);
      return {
        success: false,
        error: `Generated component failed validation: ${validation.errors.join(' ')}`,
      };
    }

    return {
      success: true,
      jsx: code,
    };
  } catch (err) {
    // Catches network errors, API failures, timeouts, etc.
    console.error('AI generation failed:', err.message);
    return {
      success: false,
      error: `AI generation failed: ${err.message}`,
    };
  }
}

module.exports = { generateComponent };