const WebSocket = require('ws');
// Load the environment variables from the .env file
require('dotenv').config(); 
// Import Ayush's component generation logic
const { generateComponent } = require('./generate-component.js'); 

// Start the WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('🚀 AuraGen Backend WebSocket Server running on ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('🤝 New frontend tracker client connected!');

    ws.on('message', async (rawData) => {
        try {
            // Parse the incoming string into a JavaScript object
            const payload = JSON.parse(rawData);
            console.log('\n📊 Received Telemetry Data:', payload);
            
            // 1. Evaluate the exact condition requested: event type must be telemetry 
            // AND (hesitation must be greater than 2 OR clicks must be greater than 4)
            if (payload.event === 'telemetry' && (payload.hesitation > 2 || payload.clicks > 4)) {
                console.log('⚠️ High friction threshold met! Activating AI Pipeline...');
                
                // Call Ayush's code generation function passing the prompt
                const generatedJsx = await generateComponent(payload.prompt);
                
                // 2. Wrap the result explicitly in a "component" event channel response layout
                const response = {
                    status: 'success',
                    event: 'component', // Returned on the "component" event explicitly
                    jsx: generatedJsx
                };
                
                ws.send(JSON.stringify(response));
                console.log('✅ AI Component generated and sent via "component" event channel successfully!');
            } else {
                // If thresholds are not breached, acknowledge without triggering Gemini
                ws.send(JSON.stringify({ 
                    status: 'ack', 
                    message: 'Telemetry received, but friction thresholds were not met.' 
                }));
                console.log('ℹ️ Telemetry logged. Thresholds not met.');
            }
        } catch (error) {
            // 3. Catch block handles errors cleanly without throwing unhandled exceptions or crashing
            console.error('❌ Error in the pipeline catch block:', error.message);
            ws.send(JSON.stringify({ 
                status: 'error', 
                message: 'Internal server error processing the AI pipeline.',
                error: error.message 
            }));
        }
    });

    ws.on('close', () => {
        console.log('🔌 Client disconnected.');
    });
});