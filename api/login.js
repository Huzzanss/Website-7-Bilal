export default function handler(req, res) {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { password } = req.body || {};
  const correctPassword = process.env.ADMIN_PASSWORD;

  // Cek apakah password dari user sama dengan password di .env
  if (password === correctPassword) {
    return res.status(200).json({ success: true, message: 'Login berhasil!' });
  } else {
    return res.status(401).json({ success: false, message: 'Password salah!' });
  }
}
