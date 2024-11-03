const WebSocket = require('ws');

const PORT = process.env.PORT || 8080; // Use the environment variable or fall back to 8080
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        // Check if the message is a Buffer (binary data)
        if (Buffer.isBuffer(message)) {
            // Convert the Buffer to a string for text data
            const decodedMessage = message.toString('utf-8');
            console.log('Received (as string):', decodedMessage);

            // Broadcast the decoded message to all clients
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(decodedMessage);
                }
            });
        } else {
            // Log and send text messages directly
            console.log('Received:', message);
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
