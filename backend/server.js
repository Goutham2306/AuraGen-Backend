const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Enable CORS for Express REST API routes
app.use(cors({
  origin: '*', // Allows requests from any frontend origin during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Middleware to parse incoming JSON payloads
app.use(express.json());

// 2. HTTP Server & Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allows WebSocket connections from any frontend origin
    methods: ['GET', 'POST']
  }
});

// 3. Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.status(200).send('🚀 AuraGen Backend Server is Active!');
});

// 4. Sample API Endpoint Route (Replace/add your actual API routes here)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'AuraGen API is fully operational',
    timestamp: new Date()
  });
});

// 5. Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`⚡ Client connected with ID: ${socket.id}`);

  // Example event handlers
  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    // Broadcast message to all connected clients
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});

// 6. Start Server
server.listen(PORT, () => {
  console.log(`🚀 AuraGen Backend running on http://localhost:${PORT}`);
});