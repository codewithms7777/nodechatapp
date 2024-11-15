const WebSocket = require('ws');

const PORT = process.env.PORT || 8080; // Use environment variable or default to 8080

// Create the WebSocket server
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('New client connected');

    // Handle incoming messages from the client
    socket.on('message', (message) => {
        try {
            let decodedMessage;

            // Check if the message is a Buffer (binary data) and decode it
            if (Buffer.isBuffer(message)) {
                decodedMessage = message.toString('utf-8');
                console.log('Received (as string):', decodedMessage);
            } else {
                decodedMessage = message; // Handle text messages directly
                console.log('Received:', message);
            }

            // Broadcast the decoded message to all other connected clients
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(decodedMessage);
                }
            });
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });

    // Handle client disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle WebSocket errors
    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
