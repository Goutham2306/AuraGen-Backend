// test-explanation.js
require('dotenv').config();
const { generateComponent } = require('./generate-component');

async function runTest() {
  console.log('Sending test prompt to generateComponent()...\n');

  const result = await generateComponent(
    'Create a pricing section with 3 tiers'
  );

  console.log('--- FULL RESULT ---');
  console.log(result);

  console.log('\n--- success ---');
  console.log(result.success);

  if (result.success) {
    console.log('\n--- explanation ---');
    console.log(result.explanation);

    console.log('\n--- jsx (first 300 chars) ---');
    console.log(result.jsx.slice(0, 300));
  } else {
    console.log('\n--- error ---');
    console.log(result.error);
  }
}

runTest();