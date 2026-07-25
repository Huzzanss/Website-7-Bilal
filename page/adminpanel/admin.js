/* ===== 1. CHECK AUTHENTICATION ===== */
(function checkAuthImmediate() {
  const isLoggedIn = sessionStorage.getItem("adminAuth") || localStorage.getItem("adminAuth");
  if (isLoggedIn !== "true") {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "../loginadminpanel/";
  }
})();

/* ===== 2. INITIALIZE DATABASE (FIX CRITICAL BUG) ===== */
let db;
try {
  db = firebase.database();
} catch (e) {
  console.error("Firebase Database gagal terhubung:", e);
}

const CLASS_ICON = "../../logo-kelas.png";

function renderBrandBadge() {
  const el = document.getElementById("brandBadge");
  if (el && CLASS_ICON && CLASS_ICON.trim()) {
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas" onerror="this.parentElement.textContent='VII'">`;
  }
}

let announcements = [];
let tasks = [];
let gallery = [];

/* ===== 3. LOGOUT FUNCTION ===== */
function logoutAdmin() {
  sessionStorage.removeItem("adminAuth");
  localStorage.removeItem("adminAuth");
  window.location.href = "../../index.html";
}

/* ===== 4. REALTIME DATA SYNC ===== */
if (db) {
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
}

/* ===== 5. RENDER FUNCTIONS ===== */

function renderAnnouncements() {
  const list = document.getElementById("adminAnnouncementList");
  if (!list) return;

  if (!announcements.length) {
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }

  list.innerHTML = announcements.map(a => `
    <div class="admin-card-item">
      <div>
        <strong style="font-size: 1rem; display: block; margin-bottom: 0.3rem;">${escapeHTML(a.title)}</strong>
        <p style="color: var(--on-surface-variant, #555); font-size: 0.9rem; margin-bottom: 0.5rem;">${escapeHTML(a.body || "")}</p>
        <span style="font-size: 0.75rem; color: #777; font-weight: 600;">${escapeHTML(a.date || "")}</span>
      </div>
      <button class="btn-danger-sm" onclick="deleteAnnouncement('${a.id}')">Hapus</button>
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
    <div class="task-card">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc || "")}</div>
      <div class="task-foot">
        <span class="deadline">Tenggat: ${escapeHTML(t.deadline || "")}</span>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn btn-secondary" style="min-height:32px; padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
            ${t.status === "selesai" ? "Buka Lagi" : "Tandai Selesai"}
          </button>
          <button class="btn-danger-sm" onclick="deleteTask('${t.id}')">Hapus</button>
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
    <div class="admin-gallery-card">
      <img src="${escapeAttr(g.url)}" alt="Dokumentasi kelas" loading="lazy">
      <button class="delete-img-btn" onclick="deleteGalleryItem('${g.id}')">&times;</button>
    </div>
  `).join("");
}

/* ===== 6. CRUD ACTIONS ===== */

// Pengumuman
function createAnnouncement() {
  const title = prompt("Judul Pengumuman:");
  if (!title) return;
  const body = prompt("Isi Pengumuman:");
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (db) {
    db.ref("announcements").push({
      title,
      body: body || "",
      date: dateStr,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => showToast("Pengumuman berhasil ditambahkan!"));
  }
}

function deleteAnnouncement(id) {
  if (confirm("Yakin ingin menghapus pengumuman ini?") && db) {
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

  if (db) {
    db.ref("tasks").push({
      subject,
      title,
      desc: desc || "",
      deadline: deadline || "",
      status: "berjalan",
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => showToast("Tugas berhasil ditambahkan!"));
  }
}

function toggleTaskStatus(id, currentStatus) {
  if (!db) return;
  const newStatus = currentStatus === "selesai" ? "berjalan" : "selesai";
  db.ref("tasks/" + id).update({ status: newStatus })
    .then(() => showToast("Status tugas diperbarui!"));
}

function deleteTask(id) {
  if (confirm("Yakin ingin menghapus tugas ini?") && db) {
    db.ref("tasks/" + id).remove().then(() => showToast("Tugas dihapus!"));
  }
}

// Galeri
function createGalleryItem() {
  const url = prompt("Masukkan URL/Link Gambar Direct:");
  if (!url) return;

  if (db) {
    db.ref("gallery").push({
      url,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => showToast("Foto berhasil ditambahkan!"));
  }
}

function deleteGalleryItem(id) {
  if (confirm("Yakin ingin menghapus foto ini?") && db) {
    db.ref("gallery/" + id).remove().then(() => showToast("Foto dihapus!"));
  }
}

/* ===== 7. UTILS ===== */
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
  return escapeHTML(str);
}

/* ===== 8. INITIALIZATION & BIND EVENTS ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderBrandBadge();

  // Event Listeners
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutAdmin);

  const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
  if (addAnnouncementBtn) addAnnouncementBtn.addEventListener("click", createAnnouncement);

  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) addTaskBtn.addEventListener("click", createTask);

  const addGalleryBtn = document.getElementById("addGalleryBtn");
  if (addGalleryBtn) addGalleryBtn.addEventListener("click", createGalleryItem);
});
