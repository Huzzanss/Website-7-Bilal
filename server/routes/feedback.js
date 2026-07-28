const express = require("express");
const jwt = require("jsonwebtoken");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ===== Rate limiting (in-memory, per IP) =====
// Not perfectly consistent across Vercel's serverless instances (each may
// have its own memory), but it stops the common case: someone mashing
// submit from one browser tab. Good enough for a small class site.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3; // max 3 submissions per window per IP
const submissionLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (submissionLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  submissionLog.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}
function recordSubmission(ip) {
  const recent = submissionLog.get(ip) || [];
  recent.push(Date.now());
  submissionLog.set(ip, recent);
}

// Public: anyone visiting the site can submit feedback — no auth required.
// New submissions start unapproved; they only appear on the public site
// once an admin approves them (see PATCH /:id/approve below).
router.post("/", async (req, res) => {
  const { name, message } = req.body || {};

  if (isRateLimited(req.ip)) {
    return res.status(429).json({
      success: false,
      message: "Terlalu banyak masukan dikirim. Coba lagi beberapa menit lagi.",
    });
  }

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
      approved: false,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    recordSubmission(req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengirim masukan." });
  }
});

// Public visitors only ever see APPROVED feedback. Admins (valid JWT in the
// Authorization header) see everything, including entries awaiting approval,
// so they have something to review.
router.get("/", async (req, res) => {
  try {
    const snap = await db.ref("feedback").once("value");
    const val = snap.val() || {};
    let list = Object.entries(val).map(([id, data]) => ({ id, ...data }));

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    let isAdmin = false;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (err) {
        isAdmin = false; // expired/invalid token -> treat request as public
      }
    }

    if (!isAdmin) {
      list = list.filter(f => f.approved === true);
    }

    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat masukan." });
  }
});

router.patch("/:id/approve", requireAuth, async (req, res) => {
  try {
    const snap = await db.ref(`feedback/${req.params.id}`).once("value");
    const data = snap.val();
    if (!data) return res.status(404).json({ success: false, message: "Masukan tidak ditemukan." });
    const newApproved = !data.approved;
    await db.ref(`feedback/${req.params.id}`).update({ approved: newApproved });
    await db.ref("activityLog").push({
      action: "update",
      label: newApproved ? "Menyetujui masukan untuk tayang publik" : "Menyembunyikan masukan dari publik",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, approved: newApproved });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status persetujuan." });
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
