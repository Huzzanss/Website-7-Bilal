const express = require("express");
const { db, bucket, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Max size for the ORIGINAL image file (before base64 encoding). Base64
// inflates size by ~33%, and Vercel's serverless functions hard-cap request
// bodies at 4.5MB — so we keep this well under that after inflation.
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB

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

// Photos are sent as base64 inside a normal JSON body — NOT multipart/form-data.
// multer/busboy-style streaming multipart parsing is unreliable on Vercel's
// serverless functions (uploads hang indefinitely with no error), so we avoid
// it entirely and reuse the same JSON body-parsing path that already works
// fine for announcements/tasks.
router.post("/upload", requireAuth, async (req, res) => {
  const { filename, contentType, dataBase64 } = req.body || {};

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
    return res.status(400).json({ success: false, message: "Ukuran gambar maksimal 3MB." });
  }

  const safeName = (filename || "foto.jpg").replace(/\s+/g, "_");
  const filePath = `gallery/${Date.now()}_${safeName}`;
  const fileRef = bucket.file(filePath);

  try {
    await fileRef.save(buffer, { metadata: { contentType } });
    await fileRef.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    const ref = await db.ref("gallery").push({
      url,
      path: filePath,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    await db.ref("activityLog").push({
      action: "create",
      label: "Menambahkan foto ke galeri",
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ success: true, id: ref.key, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengunggah foto." });
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
    const snap = await db.ref(`gallery/${req.params.id}`).once("value");
    const data = snap.val();
    await db.ref(`gallery/${req.params.id}`).remove();
    if (data && data.path) {
      await bucket.file(data.path).delete().catch(() => {});
    }
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
