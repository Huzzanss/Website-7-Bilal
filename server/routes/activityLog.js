const express = require("express");
const { db } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref("activityLog").limitToLast(30).once("value");
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat log aktivitas." });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    await db.ref("activityLog").remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus log aktivitas." });
  }
});

module.exports = router;
