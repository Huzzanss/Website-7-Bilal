// Admin login endpoint. Issues a JWT that the frontend stores and sends back
// as a Bearer token on every protected request.
const express = require("express");
const jwt = require("jsonwebtoken");
const { db, admin } = require("../config/firebaseAdmin");

const router = express.Router();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;
// In-memory brute-force guard, keyed by IP. Resets on server restart —
// good enough for a small class site, not a substitute for a real WAF.
const loginAttempts = new Map();

router.post("/login", async (req, res) => {
  const { password } = req.body || {};
  const ip = req.ip;
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  if (record.lockedUntil > now) {
    const secondsLeft = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${secondsLeft} detik.`,
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, message: "Password wajib diisi." });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });

    try {
      await db.ref("activityLog").push({
        action: "login",
        label: "Admin berhasil login",
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });
    } catch (err) {
      // Don't block login just because logging failed.
      console.error("Gagal mencatat log aktivitas login:", err.message);
    }

    return res.json({ success: true, token, expiresIn: "2h" });
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    record.count = 0;
  }
  loginAttempts.set(ip, record);

  return res.status(401).json({ success: false, message: "Password salah." });
});

module.exports = router;
