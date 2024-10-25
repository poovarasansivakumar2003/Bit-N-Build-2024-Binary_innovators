// Importing third-party and core modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');  // Keep only this line
const session = require('express-session');
const passport = require('./OAuth'); // Assuming you have a passport configuration in OAuth.js
const multer = require('multer');
const fs = require('fs');
const { storeCategoryCount, getCategoryCount, deleteImage } = require('./controlers/routeControlers'); // Corrected import path
const http = require('http'); // Importing the http module
const socketIo = require('socket.io');
const cors = require('cors');
const firebase = require('firebase/app');
require('firebase/firestore');

const admin = require('firebase-admin');

// Your service account key file
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, 'base64').toString('utf8'));

// Configure dotenv for environment variables
dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL
    });
}

const firebaseConfig = process.env.FIREBASE_CONFIG

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// Initialize Express app
const app = express();

// Create HTTP server using the Express app
const server = http.createServer(app); // <-- You need to define the server

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Directory for EJS templates

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());

// Middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: async (req, file, cb) => {
        try {
            const category = req.body.category; // Get the selected category
            console.log('Selected Category:', category); // Log the selected category

            // Fetch the category count
            let count = await getCategoryCount(req, category);
            count += 1; // Increment the count
            console.log(`Updated count for category "${category}": ${count}`);

            // Store the category count in Firestore
            await storeCategoryCount(req, category, count); // Pass req to access the session

            // Generate the unique suffix and file name
            const uniqueSuffix = '-' + Date.now() + '-' + Math.round(Math.random() * 1000);
            const fileName = `${category}-${count}${uniqueSuffix}${path.extname(file.originalname)}`; // Append category count and random suffix

            cb(null, fileName); // Pass the filename to the callback
        } catch (error) {
            cb(error); // Pass any error to the callback
        }
    },
});

// Create 'uploads' folder if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Initialize multer for file uploads
const upload = multer({ storage: storage });

// Route for file upload
app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ message: 'File uploaded successfully!', file: req.file });
});

// Route for image deletion
app.delete('/api/images/:imageName', deleteImage);

// Route handlers middleware
app.use("/", require("./routes/routeHandlers")); // Assuming routeHandlers is a file that handles your routes

// Start the server
const port = process.env.PORT || 8000;
server.listen(port, () => { // Use 'server' here
    console.log(`Server is running on port ${port}`);
});
