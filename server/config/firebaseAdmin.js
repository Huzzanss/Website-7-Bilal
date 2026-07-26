// Firebase Admin SDK — the ONLY place in this project allowed to talk to Firebase.
// The browser never sees these credentials; only the Express server does.
const admin = require("firebase-admin");
require("dotenv").config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Environment variables store literal "\n", so convert them back to real newlines.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.database();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
