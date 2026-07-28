const express = require("express");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: anyone visiting the site can submit feedback — no auth required.
router.post("/", async (req, res) => {
  const { name, message } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Pesan wajib diisi." });
  }
  if (message.length > 2000) {
    return res.status(400).json({ success: false, message: "Pesan terlalu panjang (maks. 2000 karakter)." });
  }

  try {
    await db.ref("feedback").push({
      name: (name || "").trim().slice(0, 100) || "Anonim",
      message: message.trim(),
      read: false,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengirim masukan." });
  }
});

// Admin only from here down.
router.get("/", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref("feedback").once("value");
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat masukan." });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref(`feedback/${req.params.id}`).once("value");
    const data = snap.val();
    if (!data) return res.status(404).json({ success: false, message: "Masukan tidak ditemukan." });
    await db.ref(`feedback/${req.params.id}`).update({ read: !data.read });
    res.json({ success: true, read: !data.read });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await db.ref(`feedback/${req.params.id}`).remove();
    await db.ref("activityLog").push({
      action: "delete",
      label: "Menghapus masukan dari kotak saran",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus masukan." });
  }
});

module.exports = router;
