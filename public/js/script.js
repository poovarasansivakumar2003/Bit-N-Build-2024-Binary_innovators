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




// poooooooooooooooooooooo

var darkMode = document.querySelector(".darkMode");
var lightMode = document.querySelector(".lightMode");
var section4 = document.querySelector(".section4");
var section3Text = document.querySelector(".section3Text");

darkMode.onclick = function () {
    document.body.style.backgroundColor = "#323232";
    document.body.style.color = "white";
    lightMode.style.display = "block";
    darkMode.style.display = "none";
    section3Text.style.color = "#d1d5db";
    section4.style.backgroundColor= "#292929";
}

lightMode.onclick = function () {
    document.body.style.backgroundColor = "#f9f9f9";
    document.body.style.color = "#1f2937";
    lightMode.style.display = "none";
    darkMode.style.display = "block";
    section3Text.style.color = "#4b5563";
    section4.style.backgroundColor= "#f3f4f6";
}





//code for push notification

let interval;
let notification; // Declare `notification` globally to avoid issues with reassignment

// Request permission for notifications
Notification.requestPermission().then(perm => {
  if (perm === "granted") {
    try {
      notification = new Notification("Example notification", {
        body: "Welcome to the website",
        data: { hello: "world" },
        tag: "Welcome Message", // Use a unique tag to avoid stacking
        icon: "/public/images/favicon.jpg",
      });

      notification.addEventListener("error", e => {
        console.error("Notification error event:", e);
      });
    } catch (e) {
      console.error("Failed to create notification: " + e.message);
    }
  } else {
    console.warn("Notification permissions were denied.");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const leaveDate = new Date();

    // Use a throttle mechanism to limit notifications to every 5 seconds (or another reasonable time)
    interval = setInterval(() => {
      try {
        new Notification("Come back please", {
          body: `You have been gone for ${Math.round((new Date() - leaveDate) / 1000)} seconds`,
          tag: "Come Back", // Use a tag to ensure notifications don't stack
          renotify: true,   // Ensure only the most recent notification shows up
        });
      } catch (e) {
        clearInterval(interval); // Stop the interval if there is an error
        console.error("Notification error during interval: " + e);
      }
    }, 5000); // Notify every 5 seconds to avoid excessive notifications
  } else {
    // Stop sending notifications when the page is visible
    if (interval) clearInterval(interval);

    // Close the "Welcome" notification if it's still active
    if (notification) notification.close();
  }
});
