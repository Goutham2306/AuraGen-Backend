require("dotenv").config();

// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { generateComponent } = require("./ai-pipeline/generate-component");

// Create Express application
const app = express();

// Enable CORS
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

// Home route
app.get("/", (req, res) => {
    res.send("🚀 AuraGen Backend is Running!");
});

// Health route
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        socket: true,
        server: "AuraGen Backend"
    });
});

// Socket.IO Connection
io.on("connection", (socket) => {
    
    // Connection error logging
    socket.on("error", (err) => {
        console.error("Socket Error:", err);
    });

    console.log("================================");
    console.log("✅ User Connected");
    console.log("Socket ID:", socket.id);
    console.log("================================");

    // Receive telemetry data from frontend
    socket.on("telemetry", async (data) => {

        console.log("📊 Telemetry Received");
        console.log(data);

        // Send acknowledgement back to client
        socket.emit("response", {
            status: "success",
            message: "Telemetry received successfully",
            receivedData: data
        });

        try {
            // Check if user appears frustrated
            if (data.hesitation > 2 || data.clicks > 4) {

                console.log("🧠 Calling AI pipeline...");
                console.log("Prompt:", data.prompt);

                const result = await generateComponent(
                    data.prompt || "Simplify the current form to reduce user friction"
                );

                // Emit component correctly
                socket.emit("component", {
                    success: true,
                    jsx: result.jsx || "",
                    explanation: result.explanation || ""
                });

                console.log("✅ Component generated and sent");
            }

        } catch (error) {

            console.error("❌ AI Pipeline Error:", error);

            socket.emit("component", {
                success: false,
                error: error.message
            });
        }
    });

    // Receive normal message
    socket.on("message", (msg) => {

        console.log("📩 Message Received:");
        console.log(msg);

        socket.emit("reply", {
            message: "Server received your message."
        });
    });

    // Handle disconnect (with reason)
    socket.on("disconnect", (reason) => {
        console.log("================================");
        console.log("❌ User Disconnected");
        console.log("Socket ID:", socket.id);
        console.log("Reason:", reason);
        console.log("================================");
    });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
    console.log("================================");
    console.log("🚀 AuraGen Backend Started");
    console.log(`🌐 Server URL : http://localhost:${PORT}`);
    console.log("================================");
});