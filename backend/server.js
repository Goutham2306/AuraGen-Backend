require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { generateComponent } = require("./ai-pipeline/generate-component");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// =========================
// Routes
// =========================

app.get("/", (req, res) => {
  res.send("🚀 AuraGen Backend is Running!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    socket: true,
    server: "AuraGen Backend",
  });
});

// =========================
// Socket.IO
// =========================

io.on("connection", (socket) => {
  console.log("================================");
  console.log("✅ User Connected");
  console.log("Socket ID:", socket.id);
  console.log("================================");

  socket.on("error", (err) => {
    console.error("❌ Socket Error:", err);
  });

  socket.on("telemetry", async (data) => {
    console.log("\n📊 Telemetry Received");
    console.log(data);

    socket.emit("response", {
      status: "success",
      message: "Telemetry received successfully",
      receivedData: data,
    });

    try {
      // Generate component whenever a prompt is provided
      if (!data.prompt || data.prompt.trim() === "") {
        socket.emit("component", {
          success: false,
          error: "Prompt is required.",
        });
        return;
      }

      console.log("\n🧠 Calling AI Pipeline...");
      console.log("Prompt:", data.prompt);

      const result = await generateComponent(data.prompt);

      console.log("\n========== AI RESULT ==========");
      console.log(result);
      console.log("================================");

      socket.emit("component", {
        success: result.success,
        jsx: result.jsx || "",
        explanation: result.explanation || "",
        error: result.error || "",
      });

      console.log("✅ Component sent to Frontend");
    } catch (error) {
      console.error("\n❌ AI Pipeline Error");
      console.error(error);

      socket.emit("component", {
        success: false,
        error: error.message || "Unknown server error",
      });
    }
  });

  socket.on("message", (msg) => {
    console.log("\n📩 Message Received");
    console.log(msg);

    socket.emit("reply", {
      message: "Server received your message.",
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("================================");
    console.log("❌ User Disconnected");
    console.log("Socket ID:", socket.id);
    console.log("Reason:", reason);
    console.log("================================");
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 AuraGen Backend Started");
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log("================================");
});