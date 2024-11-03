const ws = new WebSocket('ws://localhost:8080'); // Replace with your server URL
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const fileInput = document.getElementById('fileInput');
let userName = prompt("Please enter your name:") || "Anonymous";


function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(message, isSelf = false, isImage = false) {
    const timestamp = getCurrentTime(); // Get current time
    const formattedMessage = `${message} <span style="color: white; font-size: 10px;">${timestamp}</span>`;
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSelf ? 'self' : 'other');

    // Use innerHTML to preserve formatting for timestamp
    messageElement.innerHTML = formattedMessage;

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Save message to history
    messageHistory.push(formattedMessage);
}
// Check WebSocket connection before sending
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        console.warn('WebSocket is not open. Message not sent.');
    }
}


// Send text message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        const formattedMessage = `${userName}: ${message}`;
        ws.send(formattedMessage);
        appendMessage(formattedMessage, true); // Mark as own message
        messageInput.value = '';
    }
});


/*
// Handle file sending
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            sendMessage(e.target.result);
            appendMessage('File sent: ' + file.name, true); // Indicate file sent
            fileInput.value = '';
        };
        reader.readAsArrayBuffer(file);
    }
});*/

// Handle incoming messages
ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
        appendMessage(event.data, false); // Mark as other user's message
    } else if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        appendMessage(url, false, true);
    }
};

// Log connection events
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onclose = () => {
    console.log('WebSocket connection closed.');
    setTimeout(() => {
        console.log('Reconnecting...');
        ws = new WebSocket('ws://localhost:8080');
    }, 3000);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};


