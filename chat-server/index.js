const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });


const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    ws.send(
        JSON.stringify({
            type: 'info',
            content: 'Welcome to the chat!',
        })
    );


    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            broadcastMessage(parsedMessage, ws);
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(
                JSON.stringify({
                    type: 'error',
                    content: 'Invalid message format. Please send a valid JSON.',
                })
            );
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

  
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
function broadcastMessage(message, sender) {
    const outgoingMessage = JSON.stringify(message);
    clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(outgoingMessage);
        }
    });
}
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
