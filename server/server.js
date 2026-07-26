// Local dev / Render entry point: takes the shared Express app, adds static
// file serving for the frontend, and actually starts listening on a port.
// (Not used on Vercel — see /api/index.js for that.)
const path = require("path");
const express = require("express");
const app = require("./app");

const ROOT_DIR = path.join(__dirname, "..");
app.use(express.static(ROOT_DIR));

// Anything that isn't an API route and isn't a real static file falls back
// to the homepage (keeps direct links working).
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
