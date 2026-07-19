const { io } = require("socket.io-client");

// Connect to backend
const socket = io("http://localhost:5000");

// Connected
socket.on("connect", () => {

    console.log("✅ Connected to Server");
    console.log("Socket ID:", socket.id);

    // Send telemetry data
    socket.emit("telemetry", {
        mouseSpeed: 210,
        clicks: 6,
        hesitation: 3.5,
        prompt: "Simplify the current form to reduce user friction"
    });

    // Send a normal message
    socket.emit("message", "Hello AuraGen Server!");

});

// Receive telemetry acknowledgement
socket.on("response", (data) => {

    console.log("📩 Server Response");
    console.log(data);

});

// Receive generated component from AI
socket.on("component", (data) => {

    console.log("🧠 Component Received:");
    console.log(data);

});

// Receive normal reply
socket.on("reply", (data) => {

    console.log("💬 Reply From Server");
    console.log(data);

});

// Disconnect
socket.on("disconnect", () => {

    console.log("❌ Disconnected");

});