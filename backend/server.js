require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateComponent } = require('./ai-pipeline/generate-component');

const app = express();
app.use(cors()); // Enabled CORS for frontend communication

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to your frontend URL if needed
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"]
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('Backend is running');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('telemetry', (data) => {
    console.log('Telemetry received:', data);
  });

  socket.on('message', async (data) => {
    try {
      console.log('Generating component for:', data.prompt);
      
      const result = await generateComponent(data.prompt);

      // Logging for verification
      console.log("========== AI RESULT ==========");
      console.log(result);
      console.log("===============================");

      // Standardized response
      socket.emit("component", {
        success: result.success,
        jsx: result.jsx || "",
        explanation: result.explanation || "",
        error: result.error || "",
      });

    } catch (error) {
      console.error('Pipeline Error:', error);
      
      // Robust error handling
      socket.emit("component", {
        success: false,
        error: error.message || "Unknown backend error",
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});