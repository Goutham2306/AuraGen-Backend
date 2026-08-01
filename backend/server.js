const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ==========================================
// 1. Middlewares
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logs HTTP requests in terminal

// ==========================================
// 2. Database Connection
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auragen';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('🍃 Local MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// ==========================================
// 3. API Routes
// ==========================================

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AuraGen API Service is running smoothly 🚀',
  });
});

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Project Management Routes (Step 3 APIs)
app.use('/api/projects', require('./routes/projectRoutes'));

// ==========================================
// 4. Fallback Routes & Global Error Handler
// ==========================================

// Handle 404 (Route Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route Not Found',
    path: req.originalUrl,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// ==========================================
// 5. Start Server
// ==========================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});