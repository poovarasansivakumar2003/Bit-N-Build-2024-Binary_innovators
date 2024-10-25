// root\routes\routeHandlers.js

const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const { getAuthenticationPage, saveUserData, handleLogin, getHomePage, verifyEmail, changePassword, registerUser, chatbotControler, feedbackControler, isAuthenticated, profileCreation, profileCreationController, OauthControllerFunction, getDashboardPage, getUserProfileDetails, imagesFetcher } = require('../controlers/routeControlers')

//routes object
const router = express.Router()

const passport = require('../OAuth');
const upload = require('../multer');

// route-1 show home page
router.get('/home', getHomePage)

// route-2 show auth page
router.get('/auth', getAuthenticationPage)

// route-3 handle register
router.post('/register', registerUser)

// route-4 handle login
router.post('/login', handleLogin);

// routes for forgot password
// route-5 Show verify page
router.get('/verify', (req, res) => res.render('verify.ejs'));

// route-6 Handle email verification
router.post('/verify', verifyEmail);

// route-7 Show change password page
router.get('/changePassword', (req, res) => res.render('changePassword.ejs'));

// route-9 Handle password change
router.post('/changePassword', changePassword);

//OAuth route handlers
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
})
);

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth', // If authentication fails
}), OauthControllerFunction);

//chatBot
router.post('/chat-bot', chatbotControler)

// Route to handle form submission and send email
router.post('/send-email', feedbackControler);

//user profile creation
router.post('/api/createProfile', profileCreationController)

// route for get main.ejs
router.get('/main', isAuthenticated, getDashboardPage)

//userProfile Details
router.get('/api/profile', getUserProfileDetails);

// Endpoint to handle image upload
router.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file); // Log the uploaded file details
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.json({ message: 'Image uploaded successfully!', file: req.file });
});

// images viewer from uploads dir
router.get('/images', imagesFetcher);

router.get('/scroll', (req, res) => {
    res.render('scroll.ejs')
})

router.get('/RealChat', (req, res) => {
    res.render('RealTimeChat.ejs')
})

module.exports = router
