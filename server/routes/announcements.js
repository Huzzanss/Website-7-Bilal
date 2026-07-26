const express = require("express");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: anyone visiting the site can read announcements.
router.get("/", async (req, res) => {
  try {
    const snap = await db.ref("announcements").once("value");
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat pengumuman." });
  }
});

// Admin only from here down.
router.post("/", requireAuth, async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Judul wajib diisi." });
  }

  const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  try {
    const ref = await db.ref("announcements").push({
      title: title.trim(),
      body: (body || "").trim(),
      date: dateStr,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    await db.ref("activityLog").push({
      action: "create",
      label: `Membuat pengumuman "${title.trim()}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, id: ref.key });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan pengumuman." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Judul wajib diisi." });
  }

  try {
    await db.ref(`announcements/${req.params.id}`).update({
      title: title.trim(),
      body: (body || "").trim(),
    });
    await db.ref("activityLog").push({
      action: "update",
      label: `Mengubah pengumuman "${title.trim()}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memperbarui pengumuman." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref(`announcements/${req.params.id}`).once("value");
    const data = snap.val();
    await db.ref(`announcements/${req.params.id}`).remove();
    await db.ref("activityLog").push({
      action: "delete",
      label: `Menghapus pengumuman "${data ? data.title : req.params.id}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus pengumuman." });
  }
});

module.exports = router;
