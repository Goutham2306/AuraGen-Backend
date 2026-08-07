// test-frustration-prompt.js
const { generateComponent } = require('./generate-component');

async function main() {
  const prompts = [
    'Simplify the current form to reduce user friction',
    'The user is struggling with this signup form, make it clearer and add helper text',
    'Reduce the number of fields in this checkout form to lower confusion',
  ];

  for (const prompt of prompts) {
    console.log('\n=== PROMPT:', prompt, '===\n');
    const result = await generateComponent(prompt);

    if (result.success) {
      console.log('--- GENERATED COMPONENT ---\n');
      console.log(result.jsx);
    } else {
      console.log('--- GENERATION FAILED ---\n');
      console.log(result.error);
    }
  }
}

main().catch((err) => {
  console.error('Something went wrong:', err.message);
});