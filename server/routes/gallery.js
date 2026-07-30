const express = require("express");
const { db, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Max size for the ORIGINAL image file (before base64 encoding). Kept small
// on purpose: photos are stored as base64 text directly inside Realtime
// Database (no Firebase Storage — that now requires the paid Blaze plan),
// and every visit to the gallery downloads the whole "gallery" node in one
// shot. Bigger/more photos = slower page loads and more of the free quota
// used up, so this stays conservative.
const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

router.get("/", async (req, res) => {
  try {
    const snap = await db.ref("gallery").once("value");
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat galeri." });
  }
});

// Photos are sent as base64 inside a normal JSON body and stored as a data
// URI directly in Realtime Database — no Firebase Storage bucket involved
// at all, since Storage now requires the paid Blaze plan.
router.post("/upload", requireAuth, async (req, res) => {
  const { contentType, dataBase64 } = req.body || {};

  if (!dataBase64 || !contentType) {
    return res.status(400).json({ success: false, message: "File tidak ditemukan." });
  }
  if (!contentType.startsWith("image/")) {
    return res.status(400).json({ success: false, message: "File harus berupa gambar." });
  }

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, "base64");
  } catch (err) {
    return res.status(400).json({ success: false, message: "Data foto tidak valid." });
  }

  if (buffer.length > MAX_FILE_BYTES) {
    return res.status(400).json({ success: false, message: "Ukuran gambar maksimal 1.5MB." });
  }

  const dataUri = `data:${contentType};base64,${dataBase64}`;

  try {
    const ref = await db.ref("gallery").push({
      url: dataUri,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    await db.ref("activityLog").push({
      action: "create",
      label: "Menambahkan foto ke galeri",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, id: ref.key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal menyimpan foto: " + err.message });
  }
});

router.post("/url", requireAuth, async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ success: false, message: "URL wajib diisi." });
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ success: false, message: "URL tidak valid." });
  }

  try {
    const ref = await db.ref("gallery").push({
      url,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    await db.ref("activityLog").push({
      action: "create",
      label: "Menambahkan foto ke galeri (URL)",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, id: ref.key });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan foto." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await db.ref(`gallery/${req.params.id}`).remove();
    await db.ref("activityLog").push({
      action: "delete",
      label: "Menghapus foto galeri",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus foto." });
  }
});

module.exports = router;
