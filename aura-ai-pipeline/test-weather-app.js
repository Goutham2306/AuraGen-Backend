// test-weather-app.js
const { generateComponent } = require('./generate-component');

async function main() {
  console.log('Sending prompt to AI...\n');

  const prompt = 'Build a weather app showing current temperature, city name, and weather condition, with Tailwind CSS';
  const result = await generateComponent(prompt);

  if (result.success) {
    console.log('--- GENERATED COMPONENT ---\n');
    console.log(result.jsx);
  } else {
    console.log('--- GENERATION FAILED ---\n');
    console.log(result.error);
  }
}

main().catch((err) => {
  console.error('Something went wrong:', err.message);
});