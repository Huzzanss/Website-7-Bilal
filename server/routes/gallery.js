const express = require("express");
const multer = require("multer");
const { db, bucket, admin } = require("../config/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Files are held in memory only long enough to stream them to Firebase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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

router.post("/upload", requireAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File tidak ditemukan." });
  }
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ success: false, message: "File harus berupa gambar." });
  }

  const filePath = `gallery/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
  const fileRef = bucket.file(filePath);

  try {
    await fileRef.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
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
