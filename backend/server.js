const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// 1. Import Database Connection
const connectDB = require("./config/db");

// 2. Connect to MongoDB
connectDB();

// 3. Import API Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// 4. Configure Middleware & CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json()); // Body parser for JSON payload support

// 5. API Routes Setup
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// 6. HTTP Server & Socket.IO Setup
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 7. Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle live code/editor sync events
  socket.on("code-change", (data) => {
    socket.broadcast.emit("code-update", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 8. Start Express Server
httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});