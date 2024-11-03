const WebSocket = require('ws');
const mongoose = require('mongoose');
const express = require('express');


// Connect to MongoDB without deprecated options
mongoose.connect('mongodb://localhost:27017/chatApp')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const messageSchema = new mongoose.Schema({
    user: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Set up Express and WebSocket
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection
// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send message history when a client connects
    Message.find().then(messages => {
        messages.forEach(msg => {
            ws.send(JSON.stringify({ user: msg.user, message: msg.message }));
        });
    });

    // Handle incoming messages
    ws.on('message', async (data) => {
        try {
            const parsedData = JSON.parse(data.toString());
            console.log('Received message:', parsedData);

            // Create and save a new message document
            const newMessage = new Message({
                user: parsedData.user,
                message: parsedData.message,
            });

            await newMessage.save();

            // Broadcast the new message to all connected clients
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        user: newMessage.user,
                        message: newMessage.message,
                    }));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
