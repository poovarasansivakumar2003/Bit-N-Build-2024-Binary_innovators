// root\controlers\routeControlers.js
const admin = require('firebase-admin');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
const { GoogleGenerativeAI } = require('@google/generative-ai');
const markdownToText = require('markdown-to-text').default; // Use .default to access the function
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Initialize the Gemini API client using the API key from the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

dotenv.config()
// renders Home page
const getHomePage = (req, res) => {
    res.render('home.ejs')
}

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is logged in, proceed to the next middleware
    } else {
        res.redirect('/auth'); // Redirect to auth page if not logged in
    }
};

// renders login/signup page
const getAuthenticationPage = (req, res) => {
    const message = req.query.message || null;
    res.render('auth.ejs', { message });
};


// Handle Login
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch the user document from Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (!userSnapshot.empty) {
            // User exists
            const userDoc = userSnapshot.docs[0].data();
            const hashedPassword = userDoc.password; // Assuming password is stored in Firestore as hashed

            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (passwordMatch) {
                // Passwords match, redirect to home page
                res.redirect('/main');
            } else {
                // Invalid password, redirect to auth page with an error message
                res.render('auth.ejs', { errorMessage: 'Invalid credentials. Please try again', message: null });
            }
        } else {
            // User not found, redirect to auth page with an error message
            res.render('auth.ejs', { errorMessage: 'Invalid credentials. Please try again or register if you are a new user.', message: null });
        }
    } catch (error) {
        // Handle error
        console.error('Error logging in:', error);
        res.render('auth.ejs', { errorMessage: 'An error occurred. Please try again.', message: null });
    }
};

// Register user
const registerUser = async (req, res) => {
    const { email, password, confirm_password } = req.body;

    // Simple validation: check if passwords match
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match.');
    }

    try {
        const result = await saveUserData(email, password);

        if (result.errorMessage) {
            res.render('auth.ejs', { errorMessage: result.errorMessage, message: null });
        } else {
            res.render('auth.ejs', { errorMessage: 'User data saved successfully.', message: null }); // Render auth page or another page as needed
        }
    } catch (error) {
        res.status(500).send('Error saving user data');
    }
}

// Handle Registration
const saveUserData = async (email, password = null) => { // Password is optional
    try {
        // Check if the user already exists
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (!userSnapshot.empty) {
            // User already exists
            return { errorMessage: 'User already exists. Try logging in' };
        } else {
            // New user - only hash password if provided (manual registration)
            if (password) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await db.collection('users').add({
                    email: email,
                    password: hashedPassword
                });
            } else {
                // Google authentication - save email without a password
                await db.collection('users').add({
                    email: email,
                    // No password field
                });
            }
            console.log('User data saved successfully.');
            return { success: true };
        }
    } catch (error) {
        console.error('Error saving user data: ', error);
        throw new Error('Error saving user data');
    }
};


// Verify Email
const verifyEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists in Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (!userSnapshot.empty) {
            // User exists, redirect to the changePassword page
            res.render('changePassword.ejs', { email });
        } else {
            // User does not exist
            res.render('auth.ejs', { errorMessage: "User Doesn't exist", message: null })
        }
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).send('Error verifying email');
    }
};

// Change Password
const changePassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Hash the new password using bcrypt
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0].ref;
            await userDoc.update({ password: hashedPassword });

            // Redirect to /auth with a success message
            res.redirect('/auth?message=passwordChanged');
        } else {
            res.status(404).send('User does not exist');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Error changing password');
    }
};
// chatbot
const chatbotControler = async (req, res) => {
    const general = "just give in 2 lines";
    const message = req.body.message || "what is javascript"; // Get the message from the request body

    try {
        // Start a new chat and send the message
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: message + general }],
                },
            ],
        });

        // Count tokens before sending the message
        const countResult = await model.countTokens({
            generateContentRequest: { contents: await chat.getHistory() },
        });

        if (countResult.totalTokens > 20) {
            return res.status(400).send('Token limit exceeded. Please modify your input.');
        }

        const result = await chat.sendMessage(message, { maxTokens: 20 }); // Limit response to 20 tokens
        const markdownResponse = result.response.text(); // Get the response in markdown
        const plainTextResponse = markdownToText(markdownResponse); // Convert markdown to plain text
        console.log(plainTextResponse); // Print the plain text response to the console
        res.send(plainTextResponse); // Send the plain text response back to the client
    } catch (error) {
        console.error('Error communicating with Gemini API:', error);
        res.status(500).send('Failed to get response from Gemini API');
    }
}

// feedbackSender
const feedbackControler = async (req, res) => {
    const { name, email, message } = req.body;

    // Create a Nodemailer transporter using Ethereal email service
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail as the email service
        auth: {
            user: process.env.USER,  // Your Gmail email address
            pass: process.env.PASS,      // App password generated in your Google account
        },
    });


    try {
        // Send mail with the defined transport object
        const info = await transporter.sendMail({
            from: `"${name}" <${email}>`, // Sender address (using user-provided name and email)
            to: process.env.MAILS, // List of receivers (adjust as needed)
            subject: `Feedback from ${name}`, // Subject line
            text: message, // Plain text body
            html: `<p>${message}</p>`, // HTML body (optional, for formatting)
        });

        console.log("Message sent: %s", info.messageId);
        res.send('Thank you for your feedback!');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred. Please try again.');
    }
}

// Function to create a profile in Firestore
const createUserProfile = async (profileData) => {
    const profileRef = db.collection('profile').doc(profileData.email); // Use email as document ID

    try {
        await profileRef.set(profileData);
        console.log('Profile created successfully for:', profileData.email);
    } catch (error) {
        console.error('Error creating profile:', error);
    }
};

const profileCreationController = async (req, res) => {
    const profileData = req.body; // Get the profile data from the request body
    const email = profileData.email; // Extract the email from profile data

    try {
        // Check if the user exists in the 'users' collection
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            // User does not exist, send error response
            return res.status(400).send('Use the email which was used to login');
        }

        // User exists, proceed to create the profile
        await createUserProfile(profileData);
        res.status(201).send('Profile created successfully');
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).send('An error occurred while creating the profile.');
    }

}

//Oauth controller
const OauthControllerFunction = async (req, res) => {
    // Store the user's email in the session
    if (req.user && req.user.emails && req.user.emails.length > 0) {
        const email = req.user.emails[0].value; // Get the first email from the profile

        // Save the user's email in the Firestore 'users' collection
        const result = await saveUserData(email); // Use the saveUserData function

        if (result.errorMessage) {
            // Handle existing user case, redirect to login or show a message
            req.session.user = {
                email: email,
                name: req.user.displayName       // Optionally store the user's name
            };
        } else {
            // New user created successfully, store user info in session
            req.session.user = {
                email: email,
                name: req.user.displayName       // Optionally store the user's name
            };
        }
    }
    // Redirect to /main or wherever you want
    res.redirect('/main');
}

//getDashboard
const getDashboardPage = async (req, res) => {
    if (req.session && req.session.user) {
        const email = req.session.user.email;

        // Check if the profile exists in Firestore
        const profileSnapshot = await db.collection('profile').where('email', '==', email).get();

        let profileExists = !profileSnapshot.empty; // true if profile exists

        // Render your EJS template with the profile existence flag
        res.render('main.ejs', { profileExists });
    } else {
        res.redirect('/auth'); // Redirect if the user is not authenticated
    }
};

//get userProfileDetails
const getUserProfileDetails = async (req, res) => {

    const email = req.session.user.email; // Get the logged-in user's email

    try {
        // Query Firestore for the user's profile
        const profileSnapshot = await db.collection('profile').where('email', '==', email).get();

        if (!profileSnapshot.empty) {
            const profileData = profileSnapshot.docs[0].data(); // Get profile data
            res.json({
                name: profileData.name,
                email: profileData.email,
                clothesCount: 66, // Example static data (replace with dynamic if needed)
                gadgetsCount: 19, // Example static data
                miscCount: 9      // Example static data
            });
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const imagesFetcher = (req, res) => {
    const imagesDir = path.join(__dirname, '..', 'uploads');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error('Error reading images directory:', err); // Log the error
            return res.status(500).json({ message: 'Unable to scan directory: ' + err });
        }
        // Filter and map files to full URLs
        const images = files
            .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) // Adjust based on your needs
            .map(file => ({ name: file, url: `/uploads/${file}` }));

        res.json(images); // Respond with the list of images
    });
}

// Function to store the category and count in Firestore
const storeCategoryCount = async (req, category, count) => {
    try {
        if (!req.session || !req.session.user || !req.session.user.email) {
            throw new Error('Session or user email is undefined');
        }

        const userEmail = req.session.user.email; // Get user email from session
        console.log('User Email:', userEmail);

        // Create a reference to the user's category document
        const docRef = db.collection('Accessories').doc(userEmail).collection('categories').doc(category);

        // Set or update the document with the category and count
        await docRef.set({
            category: category,
            count: count
        });

        console.log(`Data for category "${category}" successfully stored in Firestore for user ${userEmail}`);
    } catch (error) {
        console.error('Error storing data in Firestore:', error.message);
    }
};

const getCategoryCount = async (req, category) => {
    try {
        if (!req.session || !req.session.user || !req.session.user.email) {
            throw new Error('Session or user email is undefined');
        }

        const userEmail = req.session.user.email; // Get user email from session
        console.log(`Fetching count for category: ${category} for user: ${userEmail}`);

        // Reference the specific category document for the user
        const docRef = db.collection('Accessories').doc(userEmail).collection('categories').doc(category);

        // Fetch the document for the specified category
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log(`No document found for category "${category}".`);
            return 0; // Return 0 if no document found, indicating the count starts from 0
        }

        // Return the count stored in the document
        const data = doc.data();
        console.log(`Count for category "${category}": ${data.count}`);
        return data.count || 0; // Return the count, or 0 if undefined
    } catch (error) {
        console.error('Error fetching category count:', error.message);
        return -1; // Return -1 if an error occurs to indicate failure
    }
};

//deletion function
const deleteImage = async (req, res) => {
    const imageName = req.params.imageName;
    const userEmail = req.session.user.email; // Get the user email from the session

    try {
        // Construct the file path for deletion
        const filePath = path.join(__dirname, '..', 'uploads', imageName); // Adjust path if needed
        console.log('File path to delete:', filePath); // Debugging line to confirm the file path

        // Delete the image file from the storage
        fs.unlinkSync(filePath); // Synchronously remove the image file

        // Retrieve the category from the image name (assuming the format is 'category-count-uniqueSuffix.extension')
        const category = imageName.split('-')[0]; // Extract category from the filename

        // Get the current count from Firestore
        const docRef = db.collection('Accessories').doc(userEmail).collection('categories').doc(category);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.error(`No document found for category "${category}".`);
            return res.status(404).send('Category not found.');
        }

        const currentCount = doc.data().count;

        // Decrease the count in Firestore
        await docRef.update({
            count: admin.firestore.FieldValue.increment(-1) // Decrement the count by 1
        });

        console.log(`Updated count for category "${category}": ${currentCount - 1}`);

        res.status(200).json({ message: 'Image deleted successfully and count updated.' });
    } catch (error) {
        console.error('Error deleting image:', error);
        if (error.code === 'ENOENT') {
            return res.status(404).send('Image file not found.'); // Handle file not found error
        }
        res.status(500).send('Error deleting image');
    }
}




module.exports = {
    getAuthenticationPage,
    registerUser,
    saveUserData,
    handleLogin,
    getHomePage,
    verifyEmail,
    changePassword,
    chatbotControler,
    feedbackControler,
    isAuthenticated,
    profileCreationController,
    OauthControllerFunction,
    getDashboardPage,
    getUserProfileDetails,
    imagesFetcher,
    storeCategoryCount,
    getCategoryCount,
    deleteImage
}