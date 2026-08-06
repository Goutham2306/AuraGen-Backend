const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import AI pipeline from aura-ai-pipeline directory
const { generateComponent } = require('../aura-ai-pipeline/generate-component');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// CORS Middleware Setup
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  })
);

app.use(express.json());

// Base & Healthcheck Routes
app.get('/', (req, res) => res.send('AuraGen Backend Running...'));
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AuraGen Backend is healthy!',
    timestamp: new Date().toISOString(),
  });
});

// Auth and Project Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Socket.IO Server Engine
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Telemetry processor function
  const handleTelemetry = async (data) => {
    console.log('📊 Received Telemetry Signal:', data);

    try {
      // Execute AI Pipeline
      const aiResponse = await generateComponent(
        data?.prompt || 'Build dynamic UI card',
        {
          hesitation: data?.hesitation || 0,
          clicks: data?.clicks || 0,
        }
      );

      // Emit complete payload back to Frontend Dynamic Renderer
      socket.emit('component', aiResponse);
      console.log('⚡ Sent AI Component response to client');
    } catch (err) {
      console.error('❌ Socket Processing Error:', err);
      socket.emit('error', { message: 'Failed to generate adaptive component' });
    }
  };

  // Handle both event names for seamless sync
  socket.on('user-telemetry', handleTelemetry);
  socket.on('telemetry', handleTelemetry);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});