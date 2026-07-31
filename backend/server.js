const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Enable CORS for all incoming connections across your local network
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to Local MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auragen';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('🍃 Local MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io with open CORS for cross-PC testing
const io = new Server(server, {
  cors: {
    origin: '*', // Allows your teammate's PC to connect over Wi-Fi/LAN
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.send('AuraGen API Backend Server is running');
});

// Start Server listening on 0.0.0.0 (all network interfaces)
const PORT = process.env.PORT || 4000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});