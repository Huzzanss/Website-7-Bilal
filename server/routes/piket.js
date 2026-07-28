const express = require("express");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const VALID_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

// Public: anyone can view the duty roster.
router.get("/", async (req, res) => {
  try {
    const snap = await db.ref("piket").once("value");
    res.json(snap.val() || {});
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat jadwal piket." });
  }
});

// Admin only: set who's on duty for a given day.
router.put("/:day", requireAuth, async (req, res) => {
  const day = req.params.day;
  if (!VALID_DAYS.includes(day)) {
    return res.status(400).json({ success: false, message: "Hari tidak valid." });
  }

  const { names, note } = req.body || {};

  try {
    await db.ref(`piket/${day}`).set({
      names: (names || "").trim(),
      note: (note || "").trim(),
    });
    await db.ref("activityLog").push({
      action: "update",
      label: `Mengubah jadwal piket gulung sajadah hari ${day}`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan jadwal piket." });
  }
});

module.exports = router;
