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

const app = express();

app.set("trust proxy", 1); // accurate req.ip behind Vercel/Render's proxy
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activity-log", activityLogRoutes);

module.exports = app;
