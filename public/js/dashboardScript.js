// root/public/js/dashboardScript.js
function validateForm(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    // Get the form element
    const form = event.target.closest('form');

    // Check if the form is valid
    if (form.checkValidity()) {
        // Collect form data
        const name = document.getElementById('first-name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value; // Assuming email is entered here
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const postcode = document.getElementById('postcode').value;
        const country = document.getElementById('country').value;

        const profileData = {
            name: name,
            phone: phone,
            email: email,  // Use the email from the logged-in user
            city: city,
            state: state,
            postcode: postcode,
            country: country
        };

        // Send profile data to the server
        fetch('/api/createProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to the next page if the profile was created successfully
                    window.location.href = "/html/afterLoginDashboard.html";
                } else {
                    // Handle error responses
                    response.text().then(text => alert(text));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while creating the profile.');
            });
    } else {
        // If not valid, trigger native validation UI
        form.reportValidity();
    }
}



// Fetch the user's profile data from the backend API
fetch('/api/profile')
    .then(response => response.json())
    .then(data => {
        // Update the HTML with the fetched data
        document.getElementById('user-name').textContent = data.name;
        document.getElementById('user-email').textContent = data.email;
        document.getElementById('clothes-count').textContent = data.clothesCount;
        document.getElementById('gadgets-count').textContent = data.gadgetsCount;
        document.getElementById('misc-count').textContent = data.miscCount;
        console.log('done')
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
    });

//to upload images
document.addEventListener('DOMContentLoaded', function () {
    fetchImages(); // Fetch images on page load

    function fetchImages() {
        fetch('/images') // Fetch the images from the server
            .then(response => response.json())
            .then(images => {
                const imageGrid = document.getElementById('image-grid');
                imageGrid.innerHTML = ''; // Clear the grid

                images.forEach(image => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'border border-gray-600 bg-gray-700 rounded-lg p-4';
                    imageElement.innerHTML = `
                        <img src="${image.url}" alt="${image.name}" class="w-full h-auto mb-2 rounded">
                        <p class="text-center text-orange-400 font-semibold">${image.name}</p>
                        <div class="flex justify-between mt-2">
                            <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" 
                                    data-image-name="${image.name}" onclick="deleteImage(event)">Delete</button>
                        </div>
                    `;
                    imageGrid.appendChild(imageElement); // Add the new image element to the grid
                });
            })
            .catch(error => console.error('Error fetching images:', error));
    }

    document.getElementById('upload-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        const fileInput = document.getElementById('image');
        if (!fileInput.files.length) {
            console.error('No file selected.');
            return; // Stop execution if no file is selected
        }

        const formData = new FormData(this); // Capture the form data
        // Get the selected category and append it to the FormData
        const category = document.getElementById('category').value;
        formData.append('category', category); // Ensure category is appended

        fetch('/upload', { // Send the form data to the server
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse JSON response
            })
            .then(data => {
                console.log(data); // Handle success response
                fetchImages(); // Refresh the image grid after upload
            })
            .catch(error => {
                console.error('Error:', error); // Handle error response
            });
    });
});

// Delete image function
function deleteImage(event) {
    const button = event.currentTarget; // Get the button that was clicked
    const imageName = button.getAttribute('data-image-name'); // Get the image name from the data attribute

    // Confirm deletion
    if (confirm(`Are you sure you want to delete ${imageName}?`)) {
        fetch(`/api/images/${imageName}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    // Successfully deleted, refresh the page
                    window.location.reload(); // Refresh the page
                } else {
                    // Handle error responses
                    response.text().then(text => {
                        console.error('Error:', text); // Log the error message
                        alert(`Error: ${text}`); // Show the alert with the error message
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting the image.');
            });
    }
}



