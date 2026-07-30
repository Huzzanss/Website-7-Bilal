const express = require("express");
const { db } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Admin only: dump every collection as one JSON file for a manual backup.
// (Piket/Piket Kelas aren't included — that data lives as static constants in
// app.js now, not in the database.)
router.get("/", requireAuth, async (req, res) => {
  try {
    const [announcements, tasks, gallery, feedback, activityLog] = await Promise.all([
      db.ref("announcements").once("value"),
      db.ref("tasks").once("value"),
      db.ref("gallery").once("value"),
      db.ref("feedback").once("value"),
      db.ref("activityLog").once("value"),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      announcements: announcements.val() || {},
      tasks: tasks.val() || {},
      gallery: gallery.val() || {},
      feedback: feedback.val() || {},
      activityLog: activityLog.val() || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal membuat backup." });
  }
});

module.exports = router;
