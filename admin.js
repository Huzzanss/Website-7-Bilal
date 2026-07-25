/* ===== SCRIPT ADMIN PANEL (SECURE SERVER-SIDE AUTH) ===== */

const CLASS_ICON = "logo-kelas.png";

function renderBrandBadge() {
  const el = document.getElementById("brandBadge");
  if (CLASS_ICON && CLASS_ICON.trim()) {
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas" onerror="this.parentElement.textContent='VII'">`;
  }
}

let announcements = [];
let tasks = [];
let gallery = [];

/* ===== FUNCTION VERIFIKASI PASSWORD KE SERVERLESS API ===== */
async function checkAdminPassword(inputPassword) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: inputPassword })
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Gagal melakukan verifikasi ke server:", error);
    return false;
  }
}

/* ===== AUTHENTICATION & LOGIN GATE ===== */
async function requireAuth() {
  // Cek apakah admin sudah login di sesi ini
  if (sessionStorage.getItem("adminAuth") === "true") {
    showAdminContent();
    return;
  }

  hideAdminContent();

  const inputPassword = prompt("Masukkan Password Admin:");
  if (inputPassword === null) {
    window.location.href = "index.html";
    return;
  }

  // Kirim password ke API Vercel untuk dicek secara aman di server
  const isValid = await checkAdminPassword(inputPassword);

  if (isValid) {
    sessionStorage.setItem("adminAuth", "true");
    showAdminContent();
    showToast("Berhasil masuk sebagai Admin!");
  } else {
    alert("Password salah!");
    window.location.href = "index.html";
  }
}

function showAdminContent() {
  document.body.classList.remove("auth-pending");
  const mainEl = document.querySelector("main");
  if (mainEl) mainEl.style.display = "block";
}

function hideAdminContent() {
  document.body.classList.add("auth-pending");
  const mainEl = document.querySelector("main");
  if (mainEl) mainEl.style.display = "none";
}

function logoutAdmin() {
  sessionStorage.removeItem("adminAuth");
  window.location.href = "index.html";
}

/* ===== REALTIME DATA SYNC (FIREBASE) ===== */

// Load Pengumuman
db.ref("announcements").on("value", (snap) => {
  const val = snap.val() || {};
  announcements = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderAnnouncements();
});

// Load Tugas
db.ref("tasks").on("value", (snap) => {
  const val = snap.val() || {};
  tasks = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
  renderTasks();
});

// Load Galeri
db.ref("gallery").on("value", (snap) => {
  const val = snap.val() || {};
  gallery = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderGallery();
});

/* ===== RENDER FUNCTIONS ===== */

function renderAnnouncements() {
  const list = document.getElementById("adminAnnouncementList");
  if (!list) return;

  if (!announcements.length) {
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }

  list.innerHTML = announcements.map(a => `
    <div class="announcement-item admin-card-item">
      <div class="a-body">
        <strong>${escapeHTML(a.title)}</strong>
        <p>${escapeHTML(a.body || "")}</p>
        <span class="a-date">${escapeHTML(a.date || "")}</span>
      </div>
      <button class="btn-icon danger" onclick="deleteAnnouncement('${a.id}')" title="Hapus Pengumuman">&times;</button>
    </div>
  `).join("");
}

function renderTasks() {
  const list = document.getElementById("adminTaskList");
  if (!list) return;

  if (!tasks.length) {
    list.innerHTML = `<p class="empty-note">Belum ada tugas/ujian.</p>`;
    return;
  }

  list.innerHTML = tasks.map(t => `
    <div class="task-card admin-card-item">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc || "")}</div>
      <div class="task-foot">
        <span class="deadline">Tenggat: ${escapeHTML(t.deadline || "")}</span>
        <div class="action-btns">
          <button class="btn-sm" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
            ${t.status === "selesai" ? "Tandai Berjalan" : "Tandai Selesai"}
          </button>
          <button class="btn-icon danger" onclick="deleteTask('${t.id}')" title="Hapus Tugas">&times;</button>
        </div>
      </div>
    </div>
  `).join("");
}

function renderGallery() {
  const grid = document.getElementById("adminGalleryGrid");
  if (!grid) return;

  if (!gallery.length) {
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    return;
  }

  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item admin-gallery-item">
      <img src="${escapeAttr(g.url)}" alt="Dokumentasi kelas" loading="lazy">
      <button class="btn-icon danger delete-img-btn" onclick="deleteGalleryItem('${g.id}')" title="Hapus Foto">&times;</button>
    </div>
  `).join("");
}

/* ===== ACTIONS (CRUD) ===== */

// Pengumuman
function createAnnouncement() {
  const title = prompt("Judul Pengumuman:");
  if (!title) return;
  const body = prompt("Isi Pengumuman:");
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  db.ref("announcements").push({
    title,
    body: body || "",
    date: dateStr,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => showToast("Pengumuman berhasil ditambahkan!"));
}

function deleteAnnouncement(id) {
  if (confirm("Yakin ingin menghapus pengumuman ini?")) {
    db.ref("announcements/" + id).remove().then(() => showToast("Pengumuman dihapus!"));
  }
}

// Tugas
function createTask() {
  const subject = prompt("Mata Pelajaran (contoh: PKN, MTK, IPA):");
  if (!subject) return;
  const title = prompt("Judul Tugas/Ujian:");
  if (!title) return;
  const desc = prompt("Deskripsi/Keterangan Tugas:");
  const deadline = prompt("Tenggat Waktu (Format: YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

  db.ref("tasks").push({
    subject,
    title,
    desc: desc || "",
    deadline: deadline || "",
    status: "berjalan",
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => showToast("Tugas berhasil ditambahkan!"));
}

function toggleTaskStatus(id, currentStatus) {
  const newStatus = currentStatus === "selesai" ? "berjalan" : "selesai";
  db.ref("tasks/" + id).update({ status: newStatus })
    .then(() => showToast("Status tugas diperbarui!"));
}

function deleteTask(id) {
  if (confirm("Yakin ingin menghapus tugas ini?")) {
    db.ref("tasks/" + id).remove().then(() => showToast("Tugas dihapus!"));
  }
}

// Galeri
function createGalleryItem() {
  const url = prompt("Masukkan URL/Link Gambar (Direct Image Link):");
  if (!url) return;

  db.ref("gallery").push({
    url,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => showToast("Foto berhasil ditambahkan ke galeri!"));
}

function deleteGalleryItem(id) {
  if (confirm("Yakin ingin menghapus foto ini?")) {
    db.ref("gallery/" + id).remove().then(() => showToast("Foto dihapus!"));
  }
}

/* ===== UTILS ===== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function escapeAttr(str = "") {
  return escapeHTML(str); }

/* ===== EVENT LISTENERS & INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderBrandBadge();
  requireAuth();

  // Tombol Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutAdmin);
  }

  // Tombol Tambah Pengumuman
  const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener("click", createAnnouncement);
  }

  // Tombol Tambah Tugas
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", createTask);
  }

  // Tombol Tambah Foto Galeri
  const addGalleryBtn = document.getElementById("addGalleryBtn");
  if (addGalleryBtn) {
    addGalleryBtn.addEventListener("click", createGalleryItem);
  }
});
