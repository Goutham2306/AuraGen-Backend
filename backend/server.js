require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// STEP 6: Import Ayush's AI Pipeline
let generateComponent;
try {
  const aiPipeline = require('../aura-ai-pipeline/generate-component');
  generateComponent = aiPipeline.generateComponent;
  console.log('✅ AI Pipeline module loaded successfully.');
} catch (err) {
  console.warn('⚠️ Warning: AI Pipeline module path not found or failed to load. Ensure path is correct.');
  console.error(err.message);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors());
app.use(express.json());

// STEP 13: Keep Existing Healthcheck Route
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'AuraGen Backend' });
});

const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to frontend domain in production
    methods: ['GET', 'POST'],
  },
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);

  // Listening for frontend telemetry requests
  socket.on('telemetry', async (data) => {
    try {
      console.log(`📥 Received generation request from ${socket.id}:`, data);
      
      const { prompt, hesitation, clicks } = data || {};

      const telemetry = {
        hesitation,
        clicks,
      };

      if (!prompt) {
        socket.emit('component', {
          success: false,
          error: 'Prompt is required to generate UI.',
        });
        return;
      }

      if (typeof generateComponent !== 'function') {
        throw new Error('AI Pipeline generateComponent function is not available.');
      }

      // STEP 8: Call AI Pipeline
      console.log(`🤖 Generating component for prompt: "${prompt}"...`);

      console.log("🚀 Calling generateComponent...");

      const aiResponse = await generateComponent(prompt, telemetry);

      console.log("✅ AI Response:");
      console.log(aiResponse);

      console.log("📤 Sending component to frontend...");

      socket.emit("component", aiResponse);

      console.log(`✅ Generation complete for ${socket.id}`);

    } catch (error) {
      // STEP 11: Error handling
      console.error(`❌ Generation error for ${socket.id}:`, error.message);
      
      socket.emit('component', {
        success: false,
        title: 'Generation Failed',
        description: 'Failed to process request through AI Pipeline.',
        jsx: null,
        error: error.message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`📡 Socket disconnected: ${socket.id}`);
  });
});

// Start Express Server
server.listen(PORT, () => {
  console.log(`🚀 AuraGen Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO listener initialized and waiting for connections.`);
});