// root\server.js

//third-party module express from npm
const express = require('express');
const app = express();
//third-party module body-parser from npm
const bodyParser = require('body-parser');
//core module path from npm
const path = require('path');
//dotenv module to store all the confidential info
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./OAuth');

//configure dotenv
dotenv.config();

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));


// Setting the view engine to ejs
app.set('view engine', 'ejs');

// Setting the directory where ejs templates are located
app.set('views', path.join(__dirname, 'views'));

//middleware-1 for parsing url-encoded data
app.use(bodyParser.urlencoded({ extended: false }));

//middleware-2 for parsing json data
app.use(bodyParser.json());

//middleware-3 to tell Express to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    })
);

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());

// Route handlers middleware
app.use("/", require("./routes/routeHandlers"));

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
