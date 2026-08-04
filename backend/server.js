const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import Ayush's updated AI pipeline function
const { generateComponent } = require('../aura-ai-pipeline/generate-component');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Initialize Express app & HTTP Server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB Database
connectDB();

// ================= CORS CONFIGURATION =================
app.use(
  cors({
    origin: '*', // Allows requests from local, Vercel, and Ngrok origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  })
);

// Middleware
app.use(express.json());

// ================= ROUTES =================

// 1. Base Test Route
app.get('/', (req, res) => {
  res.send('AuraGen Backend Running...');
});

// 2. Health Check Route (For Ullas / Frontend Verification)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AuraGen Backend is healthy and running!',
    timestamp: new Date().toISOString(),
  });
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 4. Catch-all 404 handler for missing routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// ================= SOCKET.IO ENGINE =================

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Telemetry event sent from Ullas's frontend
  socket.on('user-telemetry', async (data) => {
    console.log('📊 Received Telemetry Signal:', data);

    try {
      // Call Ayush's pipeline directly with prompt & telemetry data
      const aiResponse = await generateComponent(
        data?.prompt || 'Generate adaptive dashboard card',
        {
          hesitation: data?.hesitation || 0,
          clicks: data?.clicks || 0,
        }
      );

      // Emit real AI-generated component & metrics back to frontend UI
      socket.emit('component', aiResponse);
      console.log('⚡ Sent real AI Component response to client');
    } catch (err) {
      console.error('❌ Socket AI Processing Error:', err);
      socket.emit('error', { message: 'Failed to generate adaptive component' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});