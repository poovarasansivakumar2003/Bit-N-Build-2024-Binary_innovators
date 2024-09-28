
const socket = io();
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('m');
const imageInput = document.getElementById('imageInput');
const messagesList = document.getElementById('messages');
const sendToSelect = document.getElementById('sendTo');

// Function to escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Prompt for username when a user connects
const username = prompt("Enter your username:") || "Guest";
socket.emit('register', username);

// Handle form submission for text messages
messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = messageInput.value;
    const receiver = sendToSelect.value;

    // Send the message to the server
    if (message) {
        socket.emit('send message', { message, receiver });
        messageInput.value = ''; // Clear input field after sending
    }
});

// Handle image upload
imageInput.addEventListener('change', function() {
    const file = imageInput.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result; // Get the base64 image data
            const receiver = sendToSelect.value;

            // Send the image to the server
            socket.emit('send image', { imageData, receiver });
            imageInput.value = ''; // Clear image input after sending
        };
        reader.readAsDataURL(file); // Convert image to base64
    } else {
        alert("Please select a valid image file.");
    }
});

// Listen for chat messages from the server
socket.on('chat message', (data) => {
    const { sender, message, timestamp, receiver } = data;
    const time = new Date(timestamp).toLocaleTimeString();

    let displayMessage = `<strong>${escapeHtml(sender)} [${time}]</strong>: ${escapeHtml(message)}`;
    if (receiver && receiver !== 'Everyone') {
        displayMessage += ` (to ${escapeHtml(receiver)})`;
    }

    const item = document.createElement('li');
    item.innerHTML = displayMessage;
    messagesList.appendChild(item);
});

// Listen for image messages from the server
socket.on('chat image', (data) => {
    const { sender, imageData, timestamp, receiver } = data;
    const time = new Date(timestamp).toLocaleTimeString();

    let displayMessage = `<strong>${escapeHtml(sender)} [${time}]</strong>: <br><img src="${imageData}" class="chat-image"/>`;
    if (receiver && receiver !== 'Everyone') {
        displayMessage += ` (to ${escapeHtml(receiver)})`;
    }

    const item = document.createElement('li');
    item.innerHTML = displayMessage;
    messagesList.appendChild(item);
});

// Update user list dynamically
const existingUsers = new Set();
socket.on('user list', (usernames) => {
    sendToSelect.innerHTML = ''; // Clear current options

    // Add "Everyone" option
    const everyoneOption = document.createElement('option');
    everyoneOption.value = 'Everyone';
    everyoneOption.textContent = 'Everyone';
    sendToSelect.appendChild(everyoneOption);

    // Add other users
    usernames.forEach((user) => {
        if (!existingUsers.has(user)) {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            sendToSelect.appendChild(option);
            existingUsers.add(user);
        }
    });
});

// Error handling for socket events
socket.on('connect_error', (err) => {
    console.error(`Connection error: ${err.message}`);
});

socket.on('send message error', (error) => {
    alert(`Error sending message: ${error}`);
});

socket.on('send image error', (error) => {
    alert(`Error sending image: ${error}`);
});
