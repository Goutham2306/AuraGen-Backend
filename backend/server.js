require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { generateComponent } = require('./ai-pipeline/generate-component');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
});

app.get('/health', (req, res) => {
    res.status(200).send('AuraGen Backend is running.');
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('telemetry', async (data) => {
        console.log('Telemetry received:', data);
        
        try {
            // Call the pipeline
            const result = await generateComponent(data.prompt);

            // Logging for verification
            console.log("========== AI RESULT ==========");
            console.log(result);
            console.log("===============================");

            // Standardized emit shape
            socket.emit("component", {
                success: result.success,
                jsx: result.jsx || "",
                explanation: result.explanation || "",
                error: result.error || "",
            });

        } catch (error) {
            console.error("Backend Pipeline Error:", error);
            
            // Standardized error emit
            socket.emit("component", {
                success: false,
                jsx: "",
                explanation: "",
                error: error.message || "Unknown backend error",
            });
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});