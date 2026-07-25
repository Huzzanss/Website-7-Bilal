/* =========================================================
   Admin Panel Script — Full Compatible with app.js
   ========================================================= */

// 1. CEK AUTHENTICATION (Storage Session Check)
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("adminAuth") || localStorage.getItem("adminAuth");
  if (!isLoggedIn || isLoggedIn !== "true") {
    alert("Silakan login sebagai admin terlebih dahulu.");
    window.location.href = "../../index.html";
    return false;
  }
  return true;
}

// Jalankan Pengecekan
checkAuth();

// 2. INITIALIZE FIREBASE DATABASE (Wajib agar tidak Error)
let db;
try {
  db = firebase.database();
} catch (e) {
  console.error("Firebase Database gagal diinisialisasi:", e);
}

// 3. HELPER UTILS (Persis seperti app.js)
function escapeHTML(str = ""){
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function escapeAttr(str = ""){ return escapeHTML(str); }

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function logoutAdmin(message) {
  sessionStorage.removeItem("adminAuth");
  localStorage.removeItem("adminAuth");
  if (message) alert(message);
  window.location.href = "../../index.html";
}

// 4. REALTIME DATABASE LISTENERS
let announcements = [];
let tasks = [];
let gallery = [];

if (db) {
  /* REALTIME READ PENGUMUMAN */
  db.ref("announcements").on("value", (snap) => {
    const val = snap.val() || {};
    announcements = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderAnnouncements();
  });

  /* REALTIME READ TUGAS */
  db.ref("tasks").on("value", (snap) => {
    const val = snap.val() || {};
    tasks = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
    renderTasks();
  });

  /* REALTIME READ GALERI */
  db.ref("gallery").on("value", (snap) => {
    const val = snap.val() || {};
    gallery = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderGallery();
  });
}

// 5. RENDER FUNCTIONS
function renderAnnouncements(){
  const list = document.getElementById("adminAnnouncementList");
  if (!list) return;
  if (!announcements.length){
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }
  list.innerHTML = announcements.map(a => `
    <div class="admin-card">
      <div>
        <strong style="font-family: var(--font-display, sans-serif); font-size: 1rem; color: var(--on-surface, #000); display: block; margin-bottom: 0.3rem;">${escapeHTML(a.title)}</strong>
        <p style="color: var(--on-surface-variant, #555); font-size: 0.9rem; margin-bottom: 0.5rem;">${escapeHTML(a.body || "")}</p>
        <span style="font-size: 0.75rem; color: var(--on-surface-variant, #777); font-weight: 600;">${escapeHTML(a.date || "")}</span>
      </div>
      <button class="btn-danger-sm" onclick="deleteAnnouncement('${a.id}')">Hapus</button>
    </div>
  `).join("");
}

function renderTasks(){
  const list = document.getElementById("adminTaskList");
  if (!list) return;
  if (!tasks.length){
    list.innerHTML = `<p class="empty-note">Belum ada tugas/ujian.</p>`;
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-card">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc || "")}</div>
      <div class="task-foot">
        <span class="deadline">Tenggat: ${escapeHTML(t.deadline || "")}</span>
        <div class="action-group">
          <button class="btn btn-secondary" style="min-height:32px; padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
            ${t.status === "selesai" ? "Buka Lagi" : "Tandai Selesai"}
          </button>
          <button class="btn-danger-sm" onclick="deleteTask('${t.id}')">Hapus</button>
        </div>
      </div>
    </div>
  `).join("");
}

function renderGallery(){
  const grid = document.getElementById("adminGalleryGrid");
  if (!grid) return;
  if (!gallery.length){
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    return;
  }
  grid.innerHTML = gallery.map(g => `
    <div class="admin-gallery-card">
      <img src="${escapeAttr(g.url)}" alt="Dokumentasi kelas" loading="lazy">
      <button class="btn-delete-img" onclick="deleteGalleryItem('${g.id}')">&times;</button>
    </div>
  `).join("");
}

// 6. CRUD ACTIONS
function deleteAnnouncement(id) {
  if (confirm("Hapus pengumuman ini?") && db) {
    db.ref("announcements/" + id).remove()
      .then(() => showToast("Pengumuman berhasil dihapus"));
  }
}

function deleteTask(id) {
  if (confirm("Hapus tugas ini?") && db) {
    db.ref("tasks/" + id).remove()
      .then(() => showToast("Tugas berhasil dihapus"));
  }
}

function toggleTaskStatus(id, currentStatus) {
  if (!db) return;
  const newStatus = currentStatus === "selesai" ? "berjalan" : "selesai";
  db.ref("tasks/" + id).update({ status: newStatus })
    .then(() => showToast("Status tugas diperbarui"));
}

function deleteGalleryItem(id) {
  if (confirm("Hapus foto ini dari galeri?") && db) {
    db.ref("gallery/" + id).remove()
      .then(() => showToast("Foto berhasil dihapus"));
  }
}

// 7. EVENT LISTENERS TOMBOL (Memastikan Element Sudah Loaded)
document.addEventListener("DOMContentLoaded", () => {
  // Tombol Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => logoutAdmin("Berhasil keluar dari Admin Panel.");
  }

  // Tombol Buat Pengumuman
  const addAnnBtn = document.getElementById("addAnnouncementBtn");
  if (addAnnBtn) {
    addAnnBtn.onclick = () => {
      const title = prompt("Masukkan Judul Pengumuman:");
      if (!title) return;
      const body = prompt("Masukkan Isi Pengumuman:");
      const date = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });

      if (db) {
        db.ref("announcements").push({
          title,
          body,
          date,
          createdAt: Date.now()
        }).then(() => showToast("Pengumuman berhasil dibuat!"));
      }
    };
  }

  // Tombol Tambah Tugas
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.onclick = () => {
      const subject = prompt("Mata Pelajaran (contoh: PKN, MTK):");
      if (!subject) return;
      const title = prompt("Judul Tugas/Ujian:");
      const desc = prompt("Deskripsi Ringkas:");
      const deadline = prompt("Tenggat Waktu YYYY-MM-DD (contoh: 2026-07-31):");

      if (db) {
        db.ref("tasks").push({
          subject,
          title,
          desc,
          deadline: deadline || new Date().toISOString().split('T')[0],
          status: "berjalan",
          createdAt: Date.now()
        }).then(() => showToast("Tugas berhasil ditambahkan!"));
      }
    };
  }

  // Tombol Tambah Foto Galeri
  const addGalBtn = document.getElementById("addGalleryBtn");
  if (addGalBtn) {
    addGalBtn.onclick = () => {
      const url = prompt("Masukkan URL Gambar/Foto:");
      if (!url) return;

      if (db) {
        db.ref("gallery").push({
          url,
          createdAt: Date.now()
        }).then(() => showToast("Foto berhasil ditambahkan!"));
      }
    };
  }
});
