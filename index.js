// index.js // index.js
//
// NOTE: This Express server is NOT currently used in the live AuraGen system.
// Gautham's backend calls generateComponent() directly via require(), not over HTTP.
// This file is kept only as an optional manual-testing tool (e.g. via Postman/curl).
// Do not assume this is part of the real request flow unless the team
// explicitly switches to the HTTP-proxy architecture (Option B).
require('dotenv').config();
const express = require('express');
const { generateComponent } = require('./generate-component');
const { validateComponent } = require('./validate-component');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

// POST /generate — takes { userPrompt } and returns the AI result
app.post('/generate', async (req, res) => {
  const { userPrompt } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ success: false, error: 'userPrompt is required' });
  }
  const result = await generateComponent(userPrompt);
  res.json(result);
});

// POST /validate — takes whatever validateComponent needs
app.post('/validate', async (req, res) => {
  const result = await validateComponent(req.body);
  res.json(result);
});

app.get('/', (req, res) => {
  res.send('AuraGen AI Pipeline is running ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 AI Pipeline running at http://localhost:${PORT}`);
});