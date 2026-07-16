const WebSocket = require('ws');

// Connect to your local running server
const clientSocket = new WebSocket('ws://localhost:8080');

clientSocket.on('open', () => {
    console.log('🔗 Connected to backend server successfully!');
    
    // 1. Emitting a fake "telemetry" event layout with values breaching the rules
    const mockPayload = {
        event: 'telemetry',
        hesitation: 3, // Meets threshold requirement: hesitation > 2
        clicks: 5,     // Meets threshold requirement: clicks > 4
        prompt: 'The user is trapped on a confusing checkout form. Transform it into a minimalist, multi-step React Wizard.'
    };

    console.log('📤 Sending conditional telemetry payload to server...');
    clientSocket.send(JSON.stringify(mockPayload));
});

// Listen for the response back from the server
clientSocket.on('message', (rawData) => {
    const serverResponse = JSON.parse(rawData);
    
    console.log('\n📥 [REPLY RECEIVED FROM BACKEND SERVER]:');
    console.log(serverResponse);
    
    // 2. Verify if the response returned explicitly on the "component" event channel field
    if (serverResponse.event === 'component') {
        console.log('\n🎉 SUCCESS: Response received correctly on the "component" event field path!');
    } else {
        console.log('\n⚠️ WARNING: Response came back on an alternate event channel.');
    }
    
    // Gracefully shut down the client connection
    clientSocket.close();
});