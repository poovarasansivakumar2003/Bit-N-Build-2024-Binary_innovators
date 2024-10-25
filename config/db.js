// root\config\db.js
const dotenv = require('dotenv')
const firebase = require('firebase/app');
require('firebase/firestore');


const admin = require('firebase-admin');
dotenv.config()

// service account key file
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, 'base64').toString('utf8'));

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

module.exports = db;