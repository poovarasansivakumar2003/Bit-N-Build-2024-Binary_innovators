const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chat_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema for messages
const messageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
});
l
const Message = mongoose.model('Message', messageSchema);


let users = {};

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Register user
    socket.on('register', (username) => {
        socket.username = username;
        users[username] = socket.id; // Map username to socket ID
        io.emit('user list', Object.keys(users)); 
    });

    // Handle sending text messages
    socket.on('send message', (data) => {
        const { message, receiver } = data;

        const newMessage = new Message({
            sender: socket.username,
            receiver: receiver,
            content: message,
        });

        newMessage.save()
            .then(() => {
                // If the message is to "Everyone", broadcast it to all users
                if (receiver === 'Everyone') {
                    io.emit('chat message', {
                        sender: socket.username,
                        message,
                        receiver: 'Everyone',
                        timestamp: new Date(),
                    });
                } else {
                    // If the message is to a specific user, send it only to that user
                    const receiverSocketId = users[receiver];
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('chat message', {
                            sender: socket.username,
                            message,
                            receiver,
                            timestamp: new Date(),
                        });

                        // Also show the message to the sender
                        socket.emit('chat message', {
                            sender: socket.username,
                            message,
                            receiver,
                            timestamp: new Date(),
                        });
                    }
                }
            })
            .catch(err => {
                console.error('Error saving message:', err);
                socket.emit('error', 'Message could not be sent.');
            });
    });

    // Handle sending image messages
    socket.on('send image', (data) => {
        const { imageData, receiver } = data;

        const newMessage = new Message({
            sender: socket.username,
            receiver: receiver,
            content: imageData,
        });

        newMessage.save()
            .then(() => {
                if (receiver === 'Everyone') {
                    io.emit('chat image', {
                        sender: socket.username,
                        imageData,
                        receiver: 'Everyone',
                        timestamp: new Date(),
                    });
                } else {
                    const receiverSocketId = users[receiver];
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('chat image', {
                            sender: socket.username,
                            imageData,
                            receiver,
                            timestamp: new Date(),
                        });

                        // Also show the image to the sender
                        socket.emit('chat image', {
                            sender: socket.username,
                            imageData,
                            receiver,
                            timestamp: new Date(),
                        });
                    }
                }
            })
            .catch(err => {
                console.error('Error saving image message:', err);
                socket.emit('error', 'Image could not be sent.');
            });
    });

    // Fetch message history
    socket.on('fetch messages', async (data) => {
        const { receiver } = data;
        try {
            const messages = await Message.find({
                $or: [
                    { sender: socket.username, receiver },
                    { sender: receiver, receiver: socket.username },
                ],
            }).sort({ timestamp: 1 });
            socket.emit('message history', messages);
        } catch (err) {
            console.error('Error fetching messages:', err);
            socket.emit('error', 'Could not retrieve messages.');
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.username]; // Remove user from active users
        io.emit('user list', Object.keys(users)); // Update user list for everyone
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
