// root\public\js\script.js

// Get elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTitle = document.getElementById('login-title');
const signupTitle = document.getElementById('signup-title');
const showLoginBtn = document.getElementById('show-login');
const showSignupBtn = document.getElementById('show-signup');

// Show login form
showLoginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTitle.classList.remove('hidden');
    signupTitle.classList.add('hidden');
    showLoginBtn.classList.add('active');
    showSignupBtn.classList.remove('active');
});

// Show signup form
showSignupBtn.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupTitle.classList.remove('hidden');
    loginTitle.classList.add('hidden');
    showSignupBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
});

function validateForm1() {
    var password = document.getElementById('signup-password').value;
    var confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false; // Prevent form submission
    }
    return true; // Allow form submission
}

function validateForm2() {
    var password = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false; // Prevent form submission
    }
    return true; // Allow form submission
}

// JavaScript to handle message display 
document.addEventListener('DOMContentLoaded', function () {
    // Function to hide the message after a delay
    function hideMessage(selector, delay) {
        const element = document.querySelector(selector);
        if (element) {
            setTimeout(() => {
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 500); // Delay for opacity transition
            }, delay);
        }
    }

    // Show messages and then hide them after a delay
    hideMessage('.error-message', 3000); // 3 seconds delay for error message
    hideMessage('.alert.alert-success', 3000); // 3 seconds delay for success message
});
