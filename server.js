const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

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
