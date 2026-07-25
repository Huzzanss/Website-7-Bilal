/* =========================================================
   Admin Panel Script — Robust & Fail-safe Version
   ========================================================= */

// 1. HELPER ESCAPE STRING
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/"/g, "&quot;");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// 2. CEK AUTHENTICATION & AUTO LOGOUT
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (!isLoggedIn || isLoggedIn !== "true") {
    alert("Silakan login sebagai admin terlebih dahulu.");
    window.location.href = "../../index.html";
    return false;
  }
  return true;
}

function logoutAdmin(message) {
  sessionStorage.removeItem("adminLoggedIn");
  if (message) alert(message);
  window.location.href = "../../index.html";
}

// Timer Inaktivitas (Auto Logout 15 Menit)
const INACTIVE_TIMEOUT = 15 * 60 * 1000;
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    logoutAdmin("Sesi telah berakhir karena tidak ada aktivitas selama 15 menit.");
  }, INACTIVE_TIMEOUT);
}

['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
  window.addEventListener(event, resetInactivityTimer);
});

// 3. DATA & RENDER FUNCTIONS
let dbAnnouncements = [];
let dbTasks = [];
let dbGallery = [];

function renderAnnouncements() {
  const list = document.getElementById("adminAnnouncementList");
  if (!list) return;

  if (!dbAnnouncements || !dbAnnouncements.length) {
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }

  list.innerHTML = dbAnnouncements.map(a => `
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

function renderTasks() {
  const list = document.getElementById("adminTaskList");
  if (!list) return;

  if (!dbTasks || !dbTasks.length) {
    list.innerHTML = `<p class="empty-note">Belum ada tugas/ujian.</p>`;
    return;
  }

  list.innerHTML = dbTasks.map(t => `
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

function renderGallery() {
  const grid = document.getElementById("adminGalleryGrid");
  if (!grid) return;

  if (!dbGallery || !dbGallery.length) {
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    return;
  }

  grid.innerHTML = dbGallery.map(g => `
    <div class="admin-gallery-card">
      <img src="${escapeAttr(g.url)}" alt="Dokumentasi kelas" loading="lazy">
      <button class="btn-delete-img" onclick="deleteGalleryItem('${g.id}')">&times;</button>
    </div>
  `).join("");
}

// 4. FIREBASE DATA SYNC
function initFirebaseData() {
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    console.error("Firebase SDK belum dimuat. Periksa file firebase-config.js kamu.");
    renderAnnouncements();
    renderTasks();
    renderGallery();
    return;
  }

  const db = firebase.database();

  // Listener Pengumuman
  db.ref("announcements").on("value", snapshot => {
    const data = snapshot.val() || {};
    dbAnnouncements = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    renderAnnouncements();
  });

  // Listener Tugas
  db.ref("tasks").on("value", snapshot => {
    const data = snapshot.val() || {};
    dbTasks = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    renderTasks();
  });

  // Listener Galeri
  db.ref("gallery").on("value", snapshot => {
    const data = snapshot.val() || {};
    dbGallery = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    renderGallery();
  });
}

// 5. CRUD ACTIONS
function deleteAnnouncement(id) {
  if (confirm("Hapus pengumuman ini?")) {
    firebase.database().ref("announcements/" + id).remove()
      .then(() => showToast("Pengumuman berhasil dihapus"));
  }
}

function deleteTask(id) {
  if (confirm("Hapus tugas ini?")) {
    firebase.database().ref("tasks/" + id).remove()
      .then(() => showToast("Tugas berhasil dihapus"));
  }
}

function toggleTaskStatus(id, currentStatus) {
  const newStatus = currentStatus === "selesai" ? "berjalan" : "selesai";
  firebase.database().ref("tasks/" + id).update({ status: newStatus })
    .then(() => showToast("Status tugas diperbarui"));
}

function deleteGalleryItem(id) {
  if (confirm("Hapus foto ini dari galeri?")) {
    firebase.database().ref("gallery/" + id).remove()
      .then(() => showToast("Foto berhasil dihapus"));
  }
}

// 6. INITIALIZATION & EVENTS
document.addEventListener("DOMContentLoaded", () => {
  // Cek Login Session saat halaman dibuka
  if (!checkAuth()) return;
  
  // Start inactivity timer
  resetInactivityTimer();

  // Event Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => logoutAdmin("Berhasil keluar dari Admin Panel."));
  }

  // Event Buat Pengumuman
  const addAnnBtn = document.getElementById("addAnnouncementBtn");
  if (addAnnBtn) {
    addAnnBtn.addEventListener("click", () => {
      const title = prompt("Masukkan Judul Pengumuman:");
      if (!title) return;
      const body = prompt("Masukkan Isi Pengumuman:");
      const date = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });

      if (typeof firebase !== "undefined" && firebase.apps.length) {
        firebase.database().ref("announcements").push({ title, body, date })
          .then(() => showToast("Pengumuman berhasil dibuat!"));
      }
    });
  }

  // Event Tambah Tugas
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const subject = prompt("Mata Pelajaran (contoh: PKN, MTK):");
      if (!subject) return;
      const title = prompt("Judul Tugas/Ujian:");
      const desc = prompt("Deskripsi Ringkas:");
      const deadline = prompt("Tenggat Waktu (contoh: 2026-07-31):");

      if (typeof firebase !== "undefined" && firebase.apps.length) {
        firebase.database().ref("tasks").push({
          subject, title, desc, deadline, status: "berjalan"
        }).then(() => showToast("Tugas berhasil ditambahkan!"));
      }
    });
  }

  // Event Tambah Foto
  const addGalBtn = document.getElementById("addGalleryBtn");
  if (addGalBtn) {
    addGalBtn.addEventListener("click", () => {
      const url = prompt("Masukkan URL Gambar/Foto:");
      if (!url) return;

      if (typeof firebase !== "undefined" && firebase.apps.length) {
        firebase.database().ref("gallery").push({ url })
          .then(() => showToast("Foto berhasil ditambahkan!"));
      }
    });
  }

  // Load Data dari Firebase Realtime Database
  initFirebaseData();
});
