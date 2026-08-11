// DEPRECATED — file ini TIDAK DIPAKAI LAGI.
// Login admin sekarang lewat server/routes/auth.js (endpoint /api/auth/login),
// yang punya rate limiting & lockout yang benar. Endpoint lama ini sengaja
// dibuat tidak berfungsi apa pun supaya tidak jadi celah backdoor kalau
// suatu saat vercel.json rewrite berubah dan endpoint ini jadi bisa diakses lagi.
//
// Aman dihapus manual kapan saja (tinggal hapus file ini dari file explorer/Git).
module.exports = function handler(req, res) {
  return res.status(410).json({
    success: false,
    message: "Endpoint ini sudah tidak digunakan. Gunakan /api/auth/login.",
  });
}
