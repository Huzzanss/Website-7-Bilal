const express = require("express");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snap = await db.ref("tasks").once("value");
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat tugas." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { subject, title, desc, deadline, status } = req.body || {};
  if (!subject || !subject.trim() || !title || !title.trim() || !deadline) {
    return res.status(400).json({ success: false, message: "Mata pelajaran, judul, dan tenggat wajib diisi." });
  }

  try {
    const ref = await db.ref("tasks").push({
      subject: subject.trim(),
      title: title.trim(),
      desc: (desc || "").trim(),
      deadline,
      status: status === "selesai" ? "selesai" : "berjalan",
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    await db.ref("activityLog").push({
      action: "create",
      label: `Menambah tugas "${title.trim()}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, id: ref.key });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan tugas." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const { subject, title, desc, deadline, status } = req.body || {};
  if (!subject || !subject.trim() || !title || !title.trim() || !deadline) {
    return res.status(400).json({ success: false, message: "Mata pelajaran, judul, dan tenggat wajib diisi." });
  }

  try {
    await db.ref(`tasks/${req.params.id}`).update({
      subject: subject.trim(),
      title: title.trim(),
      desc: (desc || "").trim(),
      deadline,
      status: status === "selesai" ? "selesai" : "berjalan",
    });
    await db.ref("activityLog").push({
      action: "update",
      label: `Mengubah tugas "${title.trim()}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memperbarui tugas." });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref(`tasks/${req.params.id}`).once("value");
    const data = snap.val();
    if (!data) return res.status(404).json({ success: false, message: "Tugas tidak ditemukan." });

    const newStatus = data.status === "selesai" ? "berjalan" : "selesai";
    await db.ref(`tasks/${req.params.id}`).update({ status: newStatus });
    await db.ref("activityLog").push({
      action: "update",
      label: `Menandai tugas "${data.title}" sebagai ${newStatus}`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengubah status tugas." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref(`tasks/${req.params.id}`).once("value");
    const data = snap.val();
    await db.ref(`tasks/${req.params.id}`).remove();
    await db.ref("activityLog").push({
      action: "delete",
      label: `Menghapus tugas "${data ? data.title : req.params.id}"`,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus tugas." });
  }
});

module.exports = router;
