const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Locate and load .env from local backend folder or root folder
const localEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

// 2. Map variable aliases to GOOGLE_API_KEY if needed
process.env.GOOGLE_API_KEY = 
  process.env.GOOGLE_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_GEMINI_API_KEY;

// 3. Validate API key existence before requiring AI modules
if (!process.env.GOOGLE_API_KEY) {
  console.error('\n❌ ERROR: GOOGLE_API_KEY is not defined in your .env file!');
  console.error('Please open your .env file and ensure it contains standard key formatting:');
  console.error('GOOGLE_API_KEY=AIzaSy...\n');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 4. Import root generator module safely AFTER key is mapped
const { generateComponent } = require('../generate-component');

// 5. Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 6. Connect to MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auragen';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('[MongoDB] Database connected successfully');
  })
  .catch((err) => {
    console.error('[MongoDB] Connection error:', err.message);
  });

// 7. Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 8. Socket.IO Connections & Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('generate_component', async (data) => {
    console.log('[Socket] Request received:', data);

    try {
      const prompt = typeof data === 'string' ? data : data.prompt;
      
      // Execute pipeline generation
      const result = await generateComponent(prompt);

      // Return complete 6-key response payload
      socket.emit('component_response', {
        success: true,
        jsx: result.jsx || result.code || '',
        explanation: result.explanation || 'Component generated successfully.',
        cognitiveLoad: result.cognitiveLoad ?? 0,
        stressLevel: result.stressLevel ?? 0,
        focusScore: result.focusScore ?? 0
      });

    } catch (error) {
      console.error('[Socket] Generation error:', error);

      // Return fallback error payload preserving exact schema
      socket.emit('component_response', {
        success: false,
        jsx: '',
        explanation: `Generation failed: ${error.message}`,
        cognitiveLoad: 0,
        stressLevel: 0,
        focusScore: 0
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// 9. Launch Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});