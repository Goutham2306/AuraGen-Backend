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
 * @returns {Promise<{ success: boolean, jsx?: string, explanation?: string, error?: string }>}
 */
async function generateComponent(userPrompt) {
  try {
    const response = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    let raw = response.content;
    raw = raw.replace(/```jsx?/g, '').replace(/```/g, '').trim();

    const jsxMarker = '---JSX---';
    const explanationMarker = '---EXPLANATION---';

    const jsxIndex = raw.indexOf(jsxMarker);
    const explanationIndex = raw.indexOf(explanationMarker);

    if (jsxIndex === -1 || explanationIndex === -1) {
      console.error('AI response missing expected markers.');
      return {
        success: false,
        error: 'AI response was not in the expected format (missing markers).',
      };
    }

    const explanation = raw
      .slice(explanationIndex + explanationMarker.length, jsxIndex)
      .trim();

    const jsx = raw
      .slice(jsxIndex + jsxMarker.length)
      .trim();

    if (!jsx) {
      return {
        success: false,
        error: 'AI response had an empty JSX section.',
      };
    }

    const cleanedJsx = jsx.replace(/^import\s+.*?;?\s*\n+/gm, '').trim();

    const validation = validateComponent(cleanedJsx);

    if (!validation.isValid) {
      console.warn('Validation issues found:', validation.errors);
      return {
        success: false,
        error: `Generated component failed validation: ${validation.errors.join(' ')}`,
      };
    }

    return {
      success: true,
      jsx: cleanedJsx,
      explanation: explanation || 'Component generated successfully.',
    };
  } catch (err) {
    console.error('AI generation failed:', err.message);
    return {
      success: false,
      error: `AI generation failed: ${err.message}`,
    };
  }
}

module.exports = { generateComponent };