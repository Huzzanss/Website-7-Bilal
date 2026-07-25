/* ===== AUTH & SESSION CHECK (RUNS IMMEDIATELY) ===== */
const MAX_SESSION_MS = 2 * 60 * 60 * 1000; // Hard session limit: 2 hours

(function checkAuthImmediate() {
  const isAuthed = sessionStorage.getItem("adminAuth") === "true";
  const loginTime = parseInt(sessionStorage.getItem("adminLoginTime") || "0", 10);
  const sessionExpired = loginTime && (Date.now() - loginTime > MAX_SESSION_MS);

  if (!isAuthed || sessionExpired) {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminLoginTime");
    window.location.href = "../loginadminpanel/" + (sessionExpired ? "?reason=expired" : "");
  }
})();

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
let activityLog = [];

let editingAnnouncementId = null;
let editingTaskId = null;
let selectedGalleryFile = null;
let confirmActionCallback = null;

/* ===== THEME (LIGHT/DARK) ===== */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

/* ===== TOAST ===== */
function showToast(msg, duration = 2800) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ===== MODAL HELPERS ===== */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

/* ===== LOGOUT ===== */
function logoutAdmin(reason) {
  logActivity("logout", "Admin keluar" + (reason ? ` (${reason})` : ""));
  sessionStorage.removeItem("adminAuth");
  sessionStorage.removeItem("adminLoginTime");
  setTimeout(() => { window.location.href = "../../index.html"; }, 150);
}

/* ===== ACTIVITY LOG ===== */
function logActivity(action, label) {
  if (!window.db) return;
  db.ref("activityLog").push({
    action,
    label,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari lalu`;
}

const ACTIVITY_ICONS = {
  create: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  update: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  delete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>`,
  login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
};

function renderActivityLog() {
  const list = document.getElementById("activityLogList");
  if (!list) return;
  if (!activityLog.length) {
    list.innerHTML = `<p class="empty-note">Belum ada aktivitas.</p>`;
    return;
  }
  list.innerHTML = activityLog.slice(0, 20).map(a => `
    <div class="activity-item">
      <span class="activity-icon ${a.action}">${ACTIVITY_ICONS[a.action] || ACTIVITY_ICONS.update}</span>
      <div>
        <div>${escapeHTML(a.label || "")}</div>
        <div class="activity-meta">${relativeTime(a.timestamp)}</div>
      </div>
    </div>
  `).join("");
}

/* ===== REALTIME DATA SYNC (FIREBASE) ===== */

db.ref("announcements").on("value", (snap) => {
  const val = snap.val() || {};
  announcements = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderAnnouncements();
});

db.ref("tasks").on("value", (snap) => {
  const val = snap.val() || {};
  tasks = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
  renderTasks();
});

db.ref("gallery").on("value", (snap) => {
  const val = snap.val() || {};
  gallery = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderGallery();
});

db.ref("activityLog").limitToLast(30).on("value", (snap) => {
  const val = snap.val() || {};
  activityLog = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  renderActivityLog();
});

/* ===== RENDER: PENGUMUMAN ===== */
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
      <div class="action-btns" style="display:flex; gap:0.4rem; align-items:flex-start;">
        <button class="btn-icon" onclick="openEditAnnouncement('${a.id}')" title="Edit Pengumuman">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button class="btn-icon danger" onclick="confirmDeleteAnnouncement('${a.id}')" title="Hapus Pengumuman">&times;</button>
      </div>
    </div>
  `).join("");
}

/* ===== RENDER: TUGAS ===== */
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
        <div class="action-btns" style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="btn-sm" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
            ${t.status === "selesai" ? "Tandai Berjalan" : "Tandai Selesai"}
          </button>
          <button class="btn-icon" onclick="openEditTask('${t.id}')" title="Edit Tugas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDeleteTask('${t.id}')" title="Hapus Tugas">&times;</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* ===== RENDER: GALERI ===== */
function renderGallery() {
  const grid = document.getElementById("adminGalleryGrid");
  if (!grid) return;

  if (!gallery.length) {
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    return;
  }

  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item admin-gallery-item" style="position: relative;">
      <img src="${escapeAttr(g.url)}" alt="Dokumentasi kelas" loading="lazy">
      <button class="btn-icon danger delete-img-btn" onclick="confirmDeleteGalleryItem('${g.id}')" title="Hapus Foto" style="position: absolute; top: 8px; right: 8px;">&times;</button>
    </div>
  `).join("");
}

/* ===== CRUD: PENGUMUMAN ===== */
function openCreateAnnouncement() {
  editingAnnouncementId = null;
  document.getElementById("announcementModalTitle").textContent = "Buat Pengumuman";
  document.getElementById("announcementTitle").value = "";
  document.getElementById("announcementBody").value = "";
  document.getElementById("announcementTitleError").textContent = "";
  openModal("announcementModalBackdrop");
  setTimeout(() => document.getElementById("announcementTitle").focus(), 50);
}

function openEditAnnouncement(id) {
  const a = announcements.find(x => x.id === id);
  if (!a) return;
  editingAnnouncementId = id;
  document.getElementById("announcementModalTitle").textContent = "Edit Pengumuman";
  document.getElementById("announcementTitle").value = a.title || "";
  document.getElementById("announcementBody").value = a.body || "";
  document.getElementById("announcementTitleError").textContent = "";
  openModal("announcementModalBackdrop");
}

function saveAnnouncement(e) {
  e.preventDefault();
  const titleInput = document.getElementById("announcementTitle");
  const bodyInput = document.getElementById("announcementBody");
  const titleError = document.getElementById("announcementTitleError");

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    titleError.textContent = "Judul wajib diisi.";
    titleInput.focus();
    return;
  }
  titleError.textContent = "";

  const saveBtn = document.getElementById("announcementSaveBtn");
  saveBtn.disabled = true;

  if (editingAnnouncementId) {
    db.ref("announcements/" + editingAnnouncementId).update({ title, body })
      .then(() => {
        logActivity("update", `Mengubah pengumuman "${title}"`);
        showToast("Pengumuman berhasil diperbarui!");
        closeModal("announcementModalBackdrop");
      })
      .finally(() => { saveBtn.disabled = false; });
  } else {
    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    db.ref("announcements").push({
      title, body, date: dateStr,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    })
      .then(() => {
        logActivity("create", `Membuat pengumuman "${title}"`);
        showToast("Pengumuman berhasil ditambahkan!");
        closeModal("announcementModalBackdrop");
      })
      .finally(() => { saveBtn.disabled = false; });
  }
}

function confirmDeleteAnnouncement(id) {
  const a = announcements.find(x => x.id === id);
  openConfirmModal(
    "Hapus Pengumuman?",
    `Pengumuman "${a ? a.title : ""}" akan dihapus permanen.`,
    () => {
      db.ref("announcements/" + id).remove().then(() => {
        logActivity("delete", `Menghapus pengumuman "${a ? a.title : id}"`);
        showToast("Pengumuman dihapus!");
      });
    }
  );
}

/* ===== CRUD: TUGAS ===== */
function openCreateTask() {
  editingTaskId = null;
  document.getElementById("taskModalTitle").textContent = "Tambah Tugas";
  document.getElementById("taskSubject").value = "";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDeadline").value = new Date().toISOString().split("T")[0];
  document.getElementById("taskStatus").value = "berjalan";
  ["taskSubjectError", "taskTitleError", "taskDeadlineError"].forEach(id => document.getElementById(id).textContent = "");
  openModal("taskModalBackdrop");
  setTimeout(() => document.getElementById("taskSubject").focus(), 50);
}

function openEditTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editingTaskId = id;
  document.getElementById("taskModalTitle").textContent = "Edit Tugas";
  document.getElementById("taskSubject").value = t.subject || "";
  document.getElementById("taskTitle").value = t.title || "";
  document.getElementById("taskDesc").value = t.desc || "";
  document.getElementById("taskDeadline").value = t.deadline || "";
  document.getElementById("taskStatus").value = t.status || "berjalan";
  ["taskSubjectError", "taskTitleError", "taskDeadlineError"].forEach(id => document.getElementById(id).textContent = "");
  openModal("taskModalBackdrop");
}

function saveTask(e) {
  e.preventDefault();
  const subjectInput = document.getElementById("taskSubject");
  const titleInput = document.getElementById("taskTitle");
  const descInput = document.getElementById("taskDesc");
  const deadlineInput = document.getElementById("taskDeadline");
  const statusInput = document.getElementById("taskStatus");

  const subject = subjectInput.value.trim();
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const deadline = deadlineInput.value;
  const status = statusInput.value;

  let hasError = false;
  if (!subject) { document.getElementById("taskSubjectError").textContent = "Mata pelajaran wajib diisi."; hasError = true; }
  else { document.getElementById("taskSubjectError").textContent = ""; }
  if (!title) { document.getElementById("taskTitleError").textContent = "Judul wajib diisi."; hasError = true; }
  else { document.getElementById("taskTitleError").textContent = ""; }
  if (!deadline) { document.getElementById("taskDeadlineError").textContent = "Tenggat wajib diisi."; hasError = true; }
  else { document.getElementById("taskDeadlineError").textContent = ""; }
  if (hasError) return;

  const saveBtn = document.getElementById("taskSaveBtn");
  saveBtn.disabled = true;

  if (editingTaskId) {
    db.ref("tasks/" + editingTaskId).update({ subject, title, desc, deadline, status })
      .then(() => {
        logActivity("update", `Mengubah tugas "${title}"`);
        showToast("Tugas berhasil diperbarui!");
        closeModal("taskModalBackdrop");
      })
      .finally(() => { saveBtn.disabled = false; });
  } else {
    db.ref("tasks").push({
      subject, title, desc, deadline, status,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    })
      .then(() => {
        logActivity("create", `Menambah tugas "${title}"`);
        showToast("Tugas berhasil ditambahkan!");
        closeModal("taskModalBackdrop");
      })
      .finally(() => { saveBtn.disabled = false; });
  }
}

function toggleTaskStatus(id, currentStatus) {
  const newStatus = currentStatus === "selesai" ? "berjalan" : "selesai";
  db.ref("tasks/" + id).update({ status: newStatus })
    .then(() => {
      const t = tasks.find(x => x.id === id);
      logActivity("update", `Menandai tugas "${t ? t.title : id}" sebagai ${newStatus}`);
      showToast("Status tugas diperbarui!");
    });
}

function confirmDeleteTask(id) {
  const t = tasks.find(x => x.id === id);
  openConfirmModal(
    "Hapus Tugas?",
    `Tugas "${t ? t.title : ""}" akan dihapus permanen.`,
    () => {
      db.ref("tasks/" + id).remove().then(() => {
        logActivity("delete", `Menghapus tugas "${t ? t.title : id}"`);
        showToast("Tugas dihapus!");
      });
    }
  );
}

/* ===== CRUD: GALERI ===== */
function openGalleryModal() {
  selectedGalleryFile = null;
  document.getElementById("photoFileInput").value = "";
  document.getElementById("dropzoneIdle").style.display = "block";
  document.getElementById("dropzonePreviewWrap").style.display = "none";
  document.getElementById("uploadProgressWrap").style.display = "none";
  document.getElementById("uploadProgressBar").style.width = "0%";
  document.getElementById("galleryUploadBtn").disabled = true;
  document.getElementById("galleryUrlInput").value = "";
  document.getElementById("galleryUrlError").textContent = "";
  switchGalleryTab("upload");
  openModal("galleryModalBackdrop");
}

function switchGalleryTab(tab) {
  document.querySelectorAll(".modal-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.getElementById("uploadTabPanel").style.display = tab === "upload" ? "block" : "none";
  document.getElementById("urlTabPanel").style.display = tab === "url" ? "block" : "none";
}

function handleFileSelected(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("File harus berupa gambar.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("Ukuran gambar maksimal 5MB.");
    return;
  }
  selectedGalleryFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("dropzonePreview").src = e.target.result;
    document.getElementById("dropzoneIdle").style.display = "none";
    document.getElementById("dropzonePreviewWrap").style.display = "block";
    document.getElementById("galleryUploadBtn").disabled = false;
  };
  reader.readAsDataURL(file);
}

function uploadGalleryPhoto() {
  if (!selectedGalleryFile) return;
  if (!window.firebase || !firebase.storage) {
    showToast("Firebase Storage belum tersedia.");
    return;
  }

  const uploadBtn = document.getElementById("galleryUploadBtn");
  uploadBtn.disabled = true;
  const progressWrap = document.getElementById("uploadProgressWrap");
  const progressBar = document.getElementById("uploadProgressBar");
  const progressLabel = document.getElementById("uploadProgressLabel");
  progressWrap.style.display = "block";

  const fileName = `gallery/${Date.now()}_${selectedGalleryFile.name}`;
  const storageRef = firebase.storage().ref().child(fileName);
  const uploadTask = storageRef.put(selectedGalleryFile);

  uploadTask.on("state_changed",
    (snapshot) => {
      const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      progressBar.style.width = pct + "%";
      progressLabel.textContent = `Mengunggah... ${pct}%`;
    },
    (error) => {
      showToast("Gagal mengunggah foto: " + error.message);
      uploadBtn.disabled = false;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        db.ref("gallery").push({
          url, path: fileName,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          logActivity("create", "Menambahkan foto ke galeri");
          showToast("Foto berhasil diunggah!");
          closeModal("galleryModalBackdrop");
        });
      });
    }
  );
}

function saveGalleryUrl() {
  const input = document.getElementById("galleryUrlInput");
  const error = document.getElementById("galleryUrlError");
  const url = input.value.trim();
  if (!url) { error.textContent = "URL wajib diisi."; return; }
  try { new URL(url); } catch (err) { error.textContent = "URL tidak valid."; return; }
  error.textContent = "";

  db.ref("gallery").push({
    url, createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    logActivity("create", "Menambahkan foto ke galeri (URL)");
    showToast("Foto berhasil ditambahkan!");
    closeModal("galleryModalBackdrop");
  });
}

function confirmDeleteGalleryItem(id) {
  const g = gallery.find(x => x.id === id);
  openConfirmModal(
    "Hapus Foto?",
    "Foto ini akan dihapus permanen dari galeri.",
    () => {
      db.ref("gallery/" + id).remove().then(() => {
        if (g && g.path && firebase.storage) {
          firebase.storage().ref().child(g.path).delete().catch(() => {});
        }
        logActivity("delete", "Menghapus foto galeri");
        showToast("Foto dihapus!");
      });
    }
  );
}

/* ===== CONFIRM MODAL (GENERIC) ===== */
function openConfirmModal(title, desc, onConfirm) {
  document.getElementById("confirmModalTitle").textContent = title;
  document.getElementById("confirmModalDesc").textContent = desc;
  confirmActionCallback = onConfirm;
  openModal("confirmModalBackdrop");
}

/* ===== UTILS ===== */
function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(str = "") {
  return escapeHTML(str);
}

/* ===== AUTO-LOGOUT (IDLE TIMEOUT) ===== */
let idleTimeoutMinutes = parseInt(localStorage.getItem("adminIdleTimeoutMinutes") || "15", 10);
const WARNING_BEFORE_MS = 60 * 1000; // Show warning 60s before auto-logout
let lastActivityTime = Date.now();
let warningShown = false;
let sessionCountdownInterval = null;

function resetIdleTimer() {
  lastActivityTime = Date.now();
  if (warningShown) {
    warningShown = false;
    closeModal("sessionWarningBackdrop");
    clearInterval(sessionCountdownInterval);
  }
}

["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer, { passive: true });
});

setInterval(() => {
  const idleLimitMs = idleTimeoutMinutes * 60 * 1000;
  const idleFor = Date.now() - lastActivityTime;

  if (idleFor >= idleLimitMs) {
    logoutAdmin("tidak aktif");
    return;
  }
  if (idleFor >= idleLimitMs - WARNING_BEFORE_MS && !warningShown) {
    warningShown = true;
    openModal("sessionWarningBackdrop");
    startSessionCountdown(Math.ceil((idleLimitMs - idleFor) / 1000));
  }
}, 3000);

function startSessionCountdown(seconds) {
  const el = document.getElementById("sessionCountdown");
  let remaining = seconds;
  el.textContent = remaining;
  clearInterval(sessionCountdownInterval);
  sessionCountdownInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(sessionCountdownInterval);
      return;
    }
    el.textContent = remaining;
  }, 1000);
}

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("auth-pending");
  renderBrandBadge();

  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(current);
    });
  }

  // Header actions
  document.getElementById("logoutBtn").addEventListener("click", () => logoutAdmin());

  // Add buttons -> open modals
  document.getElementById("addAnnouncementBtn").addEventListener("click", openCreateAnnouncement);
  document.getElementById("addTaskBtn").addEventListener("click", openCreateTask);
  document.getElementById("addGalleryBtn").addEventListener("click", openGalleryModal);

  // Announcement modal
  document.getElementById("announcementForm").addEventListener("submit", saveAnnouncement);
  document.getElementById("announcementCancelBtn").addEventListener("click", () => closeModal("announcementModalBackdrop"));
  document.getElementById("announcementModalClose").addEventListener("click", () => closeModal("announcementModalBackdrop"));

  // Task modal
  document.getElementById("taskForm").addEventListener("submit", saveTask);
  document.getElementById("taskCancelBtn").addEventListener("click", () => closeModal("taskModalBackdrop"));
  document.getElementById("taskModalClose").addEventListener("click", () => closeModal("taskModalBackdrop"));

  // Confirm modal
  document.getElementById("confirmCancelBtn").addEventListener("click", () => closeModal("confirmModalBackdrop"));
  document.getElementById("confirmOkBtn").addEventListener("click", () => {
    if (confirmActionCallback) confirmActionCallback();
    closeModal("confirmModalBackdrop");
  });

  // Gallery modal: tabs
  document.querySelectorAll(".modal-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchGalleryTab(btn.dataset.tab));
  });
  document.getElementById("galleryModalClose").addEventListener("click", () => closeModal("galleryModalBackdrop"));
  document.getElementById("galleryUploadCancelBtn").addEventListener("click", () => closeModal("galleryModalBackdrop"));
  document.getElementById("galleryUrlCancelBtn").addEventListener("click", () => closeModal("galleryModalBackdrop"));

  // Gallery modal: dropzone
  const dropzone = document.getElementById("dropzone");
  const photoFileInput = document.getElementById("photoFileInput");
  dropzone.addEventListener("click", () => photoFileInput.click());
  photoFileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFileSelected(e.target.files[0]);
  });
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) handleFileSelected(e.dataTransfer.files[0]);
  });
  document.getElementById("removePreviewBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    selectedGalleryFile = null;
    photoFileInput.value = "";
    document.getElementById("dropzoneIdle").style.display = "block";
    document.getElementById("dropzonePreviewWrap").style.display = "none";
    document.getElementById("galleryUploadBtn").disabled = true;
  });
  document.getElementById("galleryUploadBtn").addEventListener("click", uploadGalleryPhoto);
  document.getElementById("galleryUrlSaveBtn").addEventListener("click", saveGalleryUrl);

  // Session warning modal
  document.getElementById("staySignedInBtn").addEventListener("click", resetIdleTimer);

  // Settings: idle timeout selector
  const idleSelect = document.getElementById("idleTimeoutSelect");
  idleSelect.value = String(idleTimeoutMinutes);
  idleSelect.addEventListener("change", () => {
    idleTimeoutMinutes = parseInt(idleSelect.value, 10);
    localStorage.setItem("adminIdleTimeoutMinutes", String(idleTimeoutMinutes));
    resetIdleTimer();
    showToast(`Auto-logout diatur ke ${idleTimeoutMinutes} menit.`);
  });

  // Settings: clear activity log
  document.getElementById("clearLogBtn").addEventListener("click", () => {
    openConfirmModal("Hapus Log Aktivitas?", "Seluruh riwayat aktivitas akan dihapus permanen.", () => {
      db.ref("activityLog").remove().then(() => showToast("Log aktivitas dibersihkan."));
    });
  });

  // Close modals when clicking backdrop directly
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    });
  });
});
