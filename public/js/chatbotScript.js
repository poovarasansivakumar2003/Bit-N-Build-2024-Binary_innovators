let chatVisible = false;

function toggleChat() {
    const chatCard = document.getElementById('chatCard');
    const messageIcon = document.querySelector('.message-icon');

    chatVisible = !chatVisible;

    if (chatVisible) {
        chatCard.classList.add('show');
        chatCard.classList.remove('hide');
        messageIcon.classList.add('hide');
        messageIcon.classList.remove('show');
    } else {
        chatCard.classList.add('hide');
        chatCard.classList.remove('show');
        messageIcon.classList.add('show');
        messageIcon.classList.remove('hide');
    }
}

async function sendMessage() {
    const input = document.getElementById('input');
    const messageSection = document.getElementById('message-section');
    const loadingIcon = document.getElementById('loading'); // Get the loading icon

    if (input.value.trim() === '') return;

    // Add user message to the chat
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<span class="message-text">${input.value}</span>`;
    messageSection.appendChild(userMessage);

    // Show loading icon
    loadingIcon.style.display = 'block';

    // Send message to server
    const response = await fetch('/chat-bot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.value }),
    });

    // Hide loading icon
    loadingIcon.style.display = 'none';

    if (response.ok) {
        const data = await response.text();

        // Add bot reply to the chat
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.innerHTML = `<span class="message-text">${data}</span>`;
        messageSection.appendChild(botMessage);
    } else {
        // Handle error response from server
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message bot';
        errorMessage.innerHTML = `<span class="message-text">Error: Unable to get response.</span>`;
        messageSection.appendChild(errorMessage);
    }

    // Clear input
    input.value = '';

    // Scroll to bottom
    messageSection.scrollTop = messageSection.scrollHeight;
}

// Add an event listener to handle Enter key press
document.getElementById('input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default action (like new line)
        sendMessage(); // Call sendMessage function
    }
});
