// root\OAuth.js

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();

// Initialize the Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL, // Adjust the port if necessary
      passReqToCallback: process.env.BOOL,
    },
    (request, accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Export middleware for use in server.js
module.exports = passport;
