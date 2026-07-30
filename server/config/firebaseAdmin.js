// Firebase Admin SDK — the ONLY place in this project allowed to talk to Firebase.
// The browser never sees these credentials; only the Express server does.
//
// Storage is intentionally NOT initialized here: Firebase Storage now
// requires the paid Blaze plan, so photos are stored as base64 text inside
// Realtime Database instead (see routes/gallery.js). Calling
// admin.storage().bucket() when no Storage bucket is provisioned throws
// immediately and would crash every route that imports this file — so we
// just never touch it.
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
  });
}

const db = admin.database();

module.exports = { admin, db };
