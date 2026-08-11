// Express app WITHOUT app.listen(). This file is shared by two entry points:
//   - server/server.js -> for local dev / Render (adds static file serving + app.listen)
//   - /api/index.js     -> for Vercel (Vercel handles static files itself; this
//                          file only needs to expose the API routes)
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const taskRoutes = require("./routes/tasks");
const galleryRoutes = require("./routes/gallery");
const activityLogRoutes = require("./routes/activityLog");
const feedbackRoutes = require("./routes/feedback");
const backupRoutes = require("./routes/backup");
// Catatan: piket & piket-kelas TIDAK dipasang di sini secara sengaja —
// jadwalnya sekarang data tetap di app.js (frontend), bukan lewat database/admin panel.
// File route-nya (routes/piket.js, routes/piketKelas.js) masih ada tapi tidak dipakai.

const app = express();

app.set("trust proxy", 1); // accurate req.ip behind Vercel/Render's proxy

// CORS: only allow the site's own domain(s) to call this API from a browser,
// instead of the wide-open default (any origin). Server-to-server requests
// (no Origin header at all — curl, health checks, etc.) are still allowed
// through, since they can't be spoofed by a malicious webpage anyway.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:4000")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origin tidak diizinkan oleh CORS."));
    }
  },
}));
// Raised from Express's 100kb default so base64-encoded photo uploads fit
// (see routes/gallery.js — this avoids multer/multipart, which hangs on
// Vercel's serverless functions).
app.use(express.json({ limit: "8mb" }));

// Basic security headers (kept manual/lightweight instead of adding the
// `helmet` dependency, since this is a small API and we only need a few).
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activity-log", activityLogRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/backup", backupRoutes);

module.exports = app;
