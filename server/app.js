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
const piketRoutes = require("./routes/piket");
const piketKelasRoutes = require("./routes/piketKelas");
const backupRoutes = require("./routes/backup");

const app = express();

app.set("trust proxy", 1); // accurate req.ip behind Vercel/Render's proxy
app.use(cors());
// Raised from Express's 100kb default so base64-encoded photo uploads fit
// (see routes/gallery.js — this avoids multer/multipart, which hangs on
// Vercel's serverless functions).
app.use(express.json({ limit: "8mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activity-log", activityLogRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/piket", piketRoutes);
app.use("/api/piket-kelas", piketKelasRoutes);
app.use("/api/backup", backupRoutes);

module.exports = app;
