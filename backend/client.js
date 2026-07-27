const { io } = require('socket.io-client');

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to backend with ID:', socket.id);

  // Test telemetry event
  socket.emit('telemetry_update', {
    clicks: 5,
    mouseSpeed: 120,
    errorCount: 0,
    timestamp: new Date().toISOString(),
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});