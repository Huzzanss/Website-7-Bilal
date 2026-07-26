require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const taskRoutes = require("./routes/tasks");
const galleryRoutes = require("./routes/gallery");
const activityLogRoutes = require("./routes/activityLog");

const app = express();

app.set("trust proxy", 1); // needed so req.ip is accurate behind a host's reverse proxy
app.use(cors());
app.use(express.json());

// ===== API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activity-log", activityLogRoutes);

// ===== SERVE FRONTEND (STATIC FILES) =====
// The whole project root (one level up from /server) is the static site.
const ROOT_DIR = path.join(__dirname, "..");
app.use(express.static(ROOT_DIR));

// Anything that isn't an API route and isn't a real static file falls back
// to the homepage (keeps direct links like /page/adminpanel/ working via
// express.static's own index.html resolution above; this is just a safety net).
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
