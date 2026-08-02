/* ===== AUTH & SESSION CHECK (RUNS IMMEDIATELY) ===== */
const MAX_SESSION_MS = 2 * 60 * 60 * 1000; // Hard session limit: 2 hours (matches JWT expiry)
const API_BASE = "/api";

(function checkAuthImmediate() {
  const token = sessionStorage.getItem("adminToken");
  const loginTime = parseInt(sessionStorage.getItem("adminLoginTime") || "0", 10);
  const sessionExpired = loginTime && (Date.now() - loginTime > MAX_SESSION_MS);

  if (!token || sessionExpired) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminLoginTime");
    window.location.href = "../loginadminpanel/" + (sessionExpired ? "?reason=expired" : "");
  }
})();

/* ===== REST API HELPER (attaches JWT, handles expired sessions) ===== */
async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("adminToken");
  const headers = Object.assign({}, options.headers || {});
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminLoginTime");
    window.location.href = "../loginadminpanel/?reason=expired";
    throw new Error("Unauthorized");
  }
  return res;
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
let activityLog = [];
let feedbackList = [];

let editingAnnouncementId = null;
let editingTaskId = null;
let selectedGalleryFiles = [];
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
function logoutAdmin() {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminLoginTime");
  window.location.href = "../../index.html";
}

/* ===== DATA LOADERS (REST API) ===== */
async function loadAnnouncements() {
  try {
    const res = await apiFetch("/announcements");
    announcements = await res.json();
    renderAnnouncements();
  } catch (err) { console.error("Gagal memuat pengumuman:", err); }
}

async function loadTasks() {
  try {
    const res = await apiFetch("/tasks");
    tasks = await res.json();
    renderTasks();
  } catch (err) { console.error("Gagal memuat tugas:", err); }
}

async function loadGallery() {
  try {
    const res = await apiFetch("/gallery");
    gallery = await res.json();
    renderGallery();
  } catch (err) { console.error("Gagal memuat galeri:", err); }
}

async function loadActivityLog() {
  try {
    const res = await apiFetch("/activity-log");
    activityLog = await res.json();
    renderActivityLog();
  } catch (err) { console.error("Gagal memuat log aktivitas:", err); }
}

async function loadFeedback() {
  try {
    const res = await apiFetch("/feedback");
    feedbackList = await res.json();
    renderFeedback();
  } catch (err) { console.error("Gagal memuat masukan:", err); }
}

async function loadAll() {
  await Promise.all([loadAnnouncements(), loadTasks(), loadGallery(), loadActivityLog(), loadFeedback()]);
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

/* ===== RENDER: KOTAK SARAN ===== */
function renderFeedback() {
  const list = document.getElementById("feedbackList");
  const badge = document.getElementById("feedbackUnreadBadge");
  if (!list) return;

  const pendingCount = feedbackList.filter(f => !f.approved).length;
  if (badge) {
    if (pendingCount > 0) {
      badge.textContent = `${pendingCount} Menunggu Persetujuan`;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  if (!feedbackList.length) {
    list.innerHTML = `<p class="empty-note">Belum ada masukan.</p>`;
    return;
  }

  list.innerHTML = feedbackList.map(f => `
    <div class="announcement-item admin-card-item" style="${f.approved ? "" : "border-color: var(--tertiary);"}">
      <div class="a-body">
        <strong>
          ${escapeHTML(f.name || "Anonim")}
          ${!f.approved ? ' <span class="admin-chip" style="background:var(--tertiary-tint); color:var(--tertiary);">Menunggu Persetujuan</span>' : ""}
          ${f.approved && !f.read ? ' <span class="admin-chip">Baru</span>' : ""}
        </strong>
        <p>${escapeHTML(f.message)}</p>
        <span class="a-date">${relativeTime(f.createdAt)}</span>
      </div>
      <div class="action-btns" style="display:flex; gap:0.4rem; align-items:flex-start;">
        <button class="btn-icon" onclick="toggleFeedbackApprove('${f.id}')" title="${f.approved ? "Sembunyikan dari publik" : "Setujui & tayangkan"}">
          ${f.approved
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>'
          }
        </button>
        <button class="btn-icon" onclick="toggleFeedbackRead('${f.id}')" title="${f.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}">
          ${f.read
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
          }
        </button>
        <button class="btn-icon danger" onclick="confirmDeleteFeedback('${f.id}')" title="Hapus Masukan">&times;</button>
      </div>
    </div>
  `).join("");
}

async function toggleFeedbackApprove(id) {
  try {
    const res = await apiFetch(`/feedback/${id}/approve`, { method: "PATCH" });
    const result = await res.json();
    if (result.success) {
      showToast(result.approved ? "Masukan disetujui, sekarang tayang publik!" : "Masukan disembunyikan dari publik.");
      loadFeedback();
      loadActivityLog();
    }
  } catch (err) { /* apiFetch already redirects on 401 */ }
}

async function toggleFeedbackRead(id) {
  const res = await apiFetch(`/feedback/${id}/read`, { method: "PATCH" });
  const result = await res.json();
  if (result.success) loadFeedback();
}

function confirmDeleteFeedback(id) {
  openConfirmModal(
    "Hapus Masukan?",
    "Masukan ini akan dihapus permanen.",
    async () => {
      const res = await apiFetch(`/feedback/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Masukan dihapus!");
        loadFeedback();
        loadActivityLog();
      } else {
        showToast(result.message || "Gagal menghapus masukan.");
      }
    }
  );
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

async function saveAnnouncement(e) {
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

  try {
    const isEdit = !!editingAnnouncementId;
    const res = await apiFetch(isEdit ? `/announcements/${editingAnnouncementId}` : "/announcements", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify({ title, body }),
    });
    const result = await res.json();
    if (result.success) {
      showToast(isEdit ? "Pengumuman berhasil diperbarui!" : "Pengumuman berhasil ditambahkan!");
      closeModal("announcementModalBackdrop");
      loadAnnouncements();
      loadActivityLog();
    } else {
      showToast(result.message || "Gagal menyimpan pengumuman.");
    }
  } catch (err) {
    // apiFetch already redirects on 401
  } finally {
    saveBtn.disabled = false;
  }
}

function confirmDeleteAnnouncement(id) {
  const a = announcements.find(x => x.id === id);
  openConfirmModal(
    "Hapus Pengumuman?",
    `Pengumuman "${a ? a.title : ""}" akan dihapus permanen.`,
    async () => {
      const res = await apiFetch(`/announcements/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Pengumuman dihapus!");
        loadAnnouncements();
        loadActivityLog();
      } else {
        showToast(result.message || "Gagal menghapus pengumuman.");
      }
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

async function saveTask(e) {
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

  try {
    const isEdit = !!editingTaskId;
    const res = await apiFetch(isEdit ? `/tasks/${editingTaskId}` : "/tasks", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify({ subject, title, desc, deadline, status }),
    });
    const result = await res.json();
    if (result.success) {
      showToast(isEdit ? "Tugas berhasil diperbarui!" : "Tugas berhasil ditambahkan!");
      closeModal("taskModalBackdrop");
      loadTasks();
      loadActivityLog();
    } else {
      showToast(result.message || "Gagal menyimpan tugas.");
    }
  } catch (err) {
    // apiFetch already redirects on 401
  } finally {
    saveBtn.disabled = false;
  }
}

async function toggleTaskStatus(id, currentStatus) {
  try {
    const res = await apiFetch(`/tasks/${id}/status`, { method: "PATCH" });
    const result = await res.json();
    if (result.success) {
      showToast("Status tugas diperbarui!");
      loadTasks();
      loadActivityLog();
    } else {
      showToast(result.message || "Gagal mengubah status tugas.");
    }
  } catch (err) { /* apiFetch already redirects on 401 */ }
}

function confirmDeleteTask(id) {
  const t = tasks.find(x => x.id === id);
  openConfirmModal(
    "Hapus Tugas?",
    `Tugas "${t ? t.title : ""}" akan dihapus permanen.`,
    async () => {
      const res = await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Tugas dihapus!");
        loadTasks();
        loadActivityLog();
      } else {
        showToast(result.message || "Gagal menghapus tugas.");
      }
    }
  );
}

/* ===== CRUD: GALERI ===== */
function openGalleryModal() {
  selectedGalleryFiles = [];
  document.getElementById("photoFileInput").value = "";
  document.getElementById("dropzoneIdle").style.display = "block";
  document.getElementById("dropzonePreviewWrap").style.display = "none";
  document.getElementById("uploadProgressWrap").style.display = "none";
  document.getElementById("galleryUploadBtn").disabled = true;
  document.getElementById("galleryUploadBtn").textContent = "Unggah Foto";
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

// Validates and queues one or more files (from file picker OR drag-and-drop),
// then re-renders the thumbnail grid. Invalid files are skipped with a toast
// instead of blocking the whole batch.
function handleFilesSelected(fileList) {
  const files = Array.from(fileList);
  files.forEach(file => {
    if (!file.type.startsWith("image/")) {
      showToast(`${file.name}: bukan file gambar, dilewati.`);
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      showToast(`${file.name}: lebih dari 1.5MB, dilewati.`);
      return;
    }
    selectedGalleryFiles.push(file);
  });
  renderDropzonePreviews();
}

function renderDropzonePreviews() {
  const grid = document.getElementById("dropzonePreviewGrid");
  const idle = document.getElementById("dropzoneIdle");
  const previewWrap = document.getElementById("dropzonePreviewWrap");
  const uploadBtn = document.getElementById("galleryUploadBtn");

  if (!selectedGalleryFiles.length) {
    idle.style.display = "block";
    previewWrap.style.display = "none";
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Unggah Foto";
    return;
  }

  idle.style.display = "none";
  previewWrap.style.display = "block";
  uploadBtn.disabled = false;
  uploadBtn.textContent = `Unggah ${selectedGalleryFiles.length} Foto`;

  grid.innerHTML = "";
  selectedGalleryFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement("div");
      item.className = "dropzone-preview-item";
      item.innerHTML = `<img src="${e.target.result}" alt="Preview"><button type="button" class="dropzone-preview-remove" data-idx="${idx}">&times;</button>`;
      grid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads each queued file as base64 JSON, one at a time (not multipart/form-data
// — multer/busboy-style multipart parsing hangs indefinitely on Vercel's
// serverless functions). Failures on one file don't stop the rest of the batch.
async function uploadGalleryPhotos() {
  if (!selectedGalleryFiles.length) return;

  const uploadBtn = document.getElementById("galleryUploadBtn");
  uploadBtn.disabled = true;
  const progressWrap = document.getElementById("uploadProgressWrap");
  const progressBar = document.getElementById("uploadProgressBar");
  const progressLabel = document.getElementById("uploadProgressLabel");
  progressWrap.style.display = "block";
  progressBar.style.width = "100%";
  progressBar.classList.add("indeterminate");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < selectedGalleryFiles.length; i++) {
    const file = selectedGalleryFiles[i];
    progressLabel.textContent = `Mengunggah foto ${i + 1} dari ${selectedGalleryFiles.length}...`;
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await apiFetch("/gallery/upload", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type, dataBase64 }),
      });
      const result = await res.json();
      if (result.success) successCount++;
      else failCount++;
    } catch (err) {
      failCount++;
    }
  }

  progressBar.classList.remove("indeterminate");
  uploadBtn.disabled = false;

  if (successCount > 0) {
    showToast(failCount > 0
      ? `${successCount} foto berhasil, ${failCount} gagal diunggah.`
      : `${successCount} foto berhasil diunggah!`);
    closeModal("galleryModalBackdrop");
    loadGallery();
    loadActivityLog();
  } else {
    showToast("Semua foto gagal diunggah.");
  }
}

async function saveGalleryUrl() {
  const input = document.getElementById("galleryUrlInput");
  const error = document.getElementById("galleryUrlError");
  const url = input.value.trim();
  if (!url) { error.textContent = "URL wajib diisi."; return; }
  try { new URL(url); } catch (err) { error.textContent = "URL tidak valid."; return; }
  error.textContent = "";

  try {
    const res = await apiFetch("/gallery/url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    const result = await res.json();
    if (result.success) {
      showToast("Foto berhasil ditambahkan!");
      closeModal("galleryModalBackdrop");
      loadGallery();
      loadActivityLog();
    } else {
      error.textContent = result.message || "Gagal menambahkan foto.";
    }
  } catch (err) { /* apiFetch already redirects on 401 */ }
}

function confirmDeleteGalleryItem(id) {
  openConfirmModal(
    "Hapus Foto?",
    "Foto ini akan dihapus permanen dari galeri.",
    async () => {
      const res = await apiFetch(`/gallery/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Foto dihapus!");
        loadGallery();
        loadActivityLog();
      } else {
        showToast(result.message || "Gagal menghapus foto.");
      }
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
    logoutAdmin();
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

/* ===== BACKUP / EXPORT DATA ===== */
async function exportBackup() {
  try {
    const res = await apiFetch("/backup");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `backup-kelas-vii-bilal-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Backup berhasil diunduh!");
  } catch (err) {
    showToast("Gagal membuat backup.");
  }
}

/* ===== TERMINAL CLI ADMIN ===== */
// Command-line interface untuk aksi admin cepat tanpa klik tombol.
// Setelah "list <tipe>", item bisa dirujuk pakai nomor urut (bukan cuma ID panjang).
const cliListCache = { announcements: [], tasks: [], gallery: [], feedback: [] };
const cliHistory = [];
let cliHistoryIndex = -1;

function cliPrint(text, cls) {
  const output = document.getElementById("cliOutput");
  if (!output) return;
  const line = document.createElement("div");
  if (cls) line.className = cls;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function cliParseArgs(str) {
  const args = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    args.push(match[1] !== undefined ? match[1] : match[2]);
  }
  return args;
}

function cliResolveId(type, ref) {
  if (/^\d+$/.test(ref)) {
    const idx = parseInt(ref, 10) - 1;
    const cached = cliListCache[type];
    return (cached && cached[idx]) || null;
  }
  return ref;
}

const CLI_COMMANDS = {
  help() {
    cliPrint("Perintah yang tersedia:");
    cliPrint('  list <announcements|tasks|gallery|feedback|log>');
    cliPrint('  announce "Judul" "Isi"                          - buat pengumuman');
    cliPrint('  task "Mapel" "Judul" YYYY-MM-DD ["Deskripsi"]     - buat tugas');
    cliPrint('  done <no/id>                                    - toggle status selesai/berjalan');
    cliPrint('  approve <no/id>                                 - setujui masukan biar tayang');
    cliPrint('  rm <announcement|task|gallery|feedback> <no/id>  - hapus item');
    cliPrint('  backup                                          - unduh backup data (JSON)');
    cliPrint('  theme <dark|light>                              - ganti tema');
    cliPrint('  clear                                           - bersihkan layar');
    cliPrint('  logout                                          - keluar dari admin panel');
    cliPrint("Tips: setelah 'list', pakai nomor urut (bukan ID panjang) di perintah lain.");
  },

  list(args) {
    const type = args[0];
    if (type === "announcements") {
      cliListCache.announcements = announcements.map(a => a.id);
      if (!announcements.length) return cliPrint("(kosong)");
      announcements.forEach((a, i) => cliPrint(`${i + 1}. ${a.title}`));
    } else if (type === "tasks") {
      cliListCache.tasks = tasks.map(t => t.id);
      if (!tasks.length) return cliPrint("(kosong)");
      tasks.forEach((t, i) => cliPrint(`${i + 1}. [${t.subject}] ${t.title} - ${t.status}, tenggat ${t.deadline}`));
    } else if (type === "gallery") {
      cliListCache.gallery = gallery.map(g => g.id);
      if (!gallery.length) return cliPrint("(kosong)");
      gallery.forEach((g, i) => cliPrint(`${i + 1}. foto galeri`));
    } else if (type === "feedback") {
      cliListCache.feedback = feedbackList.map(f => f.id);
      if (!feedbackList.length) return cliPrint("(kosong)");
      feedbackList.forEach((f, i) => cliPrint(`${i + 1}. ${f.approved ? "[tayang]" : "[menunggu]"} ${f.name}: ${f.message.slice(0, 60)}`));
    } else if (type === "log") {
      if (!activityLog.length) return cliPrint("(kosong)");
      activityLog.slice(0, 10).forEach(a => cliPrint(`- ${a.label} (${relativeTime(a.timestamp)})`));
    } else {
      cliPrint("Tipe tidak dikenal. Coba: announcements, tasks, gallery, feedback, log", "cli-error");
    }
  },

  async announce(args) {
    const [title, body] = args;
    if (!title) return cliPrint('Format: announce "Judul" "Isi"', "cli-error");
    const res = await apiFetch("/announcements", {
      method: "POST",
      body: JSON.stringify({ title, body: body || "" }),
    });
    const result = await res.json();
    if (result.success) {
      cliPrint(`OK. Pengumuman "${title}" dibuat.`, "cli-ok");
      loadAnnouncements(); loadActivityLog();
    } else {
      cliPrint(result.message || "Gagal.", "cli-error");
    }
  },

  async task(args) {
    const [subject, title, deadline, desc] = args;
    if (!subject || !title || !deadline) return cliPrint('Format: task "Mapel" "Judul" YYYY-MM-DD ["Deskripsi"]', "cli-error");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return cliPrint("Format tanggal harus YYYY-MM-DD.", "cli-error");
    const res = await apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify({ subject, title, deadline, desc: desc || "", status: "berjalan" }),
    });
    const result = await res.json();
    if (result.success) {
      cliPrint(`OK. Tugas "${title}" dibuat.`, "cli-ok");
      loadTasks(); loadActivityLog();
    } else {
      cliPrint(result.message || "Gagal.", "cli-error");
    }
  },

  async done(args) {
    const ref = args[0];
    if (!ref) return cliPrint("Format: done <no/id tugas>", "cli-error");
    const id = cliResolveId("tasks", ref);
    if (!id) return cliPrint("Tugas tidak ditemukan. Jalankan 'list tasks' dulu.", "cli-error");
    const res = await apiFetch(`/tasks/${id}/status`, { method: "PATCH" });
    const result = await res.json();
    if (result.success) {
      cliPrint(`OK. Status tugas sekarang: ${result.status}.`, "cli-ok");
      loadTasks(); loadActivityLog();
    } else {
      cliPrint(result.message || "Gagal.", "cli-error");
    }
  },

  async approve(args) {
    const ref = args[0];
    if (!ref) return cliPrint("Format: approve <no/id masukan>", "cli-error");
    const id = cliResolveId("feedback", ref);
    if (!id) return cliPrint("Masukan tidak ditemukan. Jalankan 'list feedback' dulu.", "cli-error");
    const res = await apiFetch(`/feedback/${id}/approve`, { method: "PATCH" });
    const result = await res.json();
    if (result.success) {
      cliPrint(`OK. Status: ${result.approved ? "tayang publik" : "disembunyikan"}.`, "cli-ok");
      loadFeedback(); loadActivityLog();
    } else {
      cliPrint(result.message || "Gagal.", "cli-error");
    }
  },

  async rm(args) {
    const [type, ref] = args;
    const endpointMap = { announcement: "announcements", task: "tasks", gallery: "gallery", feedback: "feedback" };
    const endpoint = endpointMap[type];
    if (!endpoint || !ref) return cliPrint("Format: rm <announcement|task|gallery|feedback> <no/id>", "cli-error");
    const id = cliResolveId(endpoint, ref);
    if (!id) return cliPrint("Item tidak ditemukan. Jalankan 'list' dulu.", "cli-error");
    const res = await apiFetch(`/${endpoint}/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      cliPrint(`OK. ${type} dihapus.`, "cli-ok");
      loadAll();
    } else {
      cliPrint(result.message || "Gagal.", "cli-error");
    }
  },

  backup() {
    exportBackup();
    cliPrint("Mengunduh backup...", "cli-ok");
  },

  theme(args) {
    const mode = args[0];
    if (mode !== "dark" && mode !== "light") return cliPrint("Format: theme <dark|light>", "cli-error");
    applyTheme(mode);
    cliPrint(`OK. Tema diganti ke ${mode}.`, "cli-ok");
  },

  clear() {
    const output = document.getElementById("cliOutput");
    if (output) output.innerHTML = "";
  },

  logout() {
    cliPrint("Keluar...", "cli-ok");
    setTimeout(logoutAdmin, 400);
  },

  whoami() {
    cliPrint("admin");
  },
};

async function cliExecute(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  cliPrint(`> ${trimmed}`, "cli-cmd");

  const parts = cliParseArgs(trimmed);
  const cmdName = (parts.shift() || "").toLowerCase();
  const handler = CLI_COMMANDS[cmdName];

  if (!handler) {
    cliPrint(`Perintah tidak dikenal: "${cmdName}". Ketik "help" untuk daftar perintah.`, "cli-error");
    return;
  }

  try {
    await handler(parts);
  } catch (err) {
    cliPrint("Terjadi kesalahan menjalankan perintah.", "cli-error");
  }
}

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("auth-pending");
  renderBrandBadge();
  loadAll();

  // Poll periodically so changes from another admin session/tab show up here too.
  setInterval(loadAll, 15000);

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
    if (e.target.files.length) handleFilesSelected(e.target.files);
    photoFileInput.value = ""; // allow re-selecting the same file(s) later
  });
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFilesSelected(e.dataTransfer.files);
  });
  document.getElementById("dropzonePreviewGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".dropzone-preview-remove");
    if (!btn) return;
    e.stopPropagation();
    const idx = parseInt(btn.dataset.idx, 10);
    selectedGalleryFiles.splice(idx, 1);
    renderDropzonePreviews();
  });
  const addMoreBtn = document.getElementById("addMorePhotosBtn");
  if (addMoreBtn) addMoreBtn.addEventListener("click", (e) => { e.stopPropagation(); photoFileInput.click(); });
  document.getElementById("galleryUploadBtn").addEventListener("click", uploadGalleryPhotos);
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

  // Settings: export backup
  const exportBtn = document.getElementById("exportBackupBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportBackup);

  // Settings: clear activity log
  document.getElementById("clearLogBtn").addEventListener("click", () => {
    openConfirmModal("Hapus Log Aktivitas?", "Seluruh riwayat aktivitas akan dihapus permanen.", async () => {
      const res = await apiFetch("/activity-log", { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Log aktivitas dibersihkan.");
        loadActivityLog();
      }
    });
  });

  // Close modals when clicking backdrop directly
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    });
  });

  // Terminal CLI
  const cliToggleBtn = document.getElementById("cliToggleBtn");
  const cliPanel = document.getElementById("cliPanel");
  const cliCloseBtn = document.getElementById("cliCloseBtn");
  const cliInput = document.getElementById("cliInput");

  if (cliToggleBtn && cliPanel) {
    cliToggleBtn.addEventListener("click", () => {
      cliPanel.classList.toggle("open");
      if (cliPanel.classList.contains("open")) {
        if (!cliPanel.dataset.welcomed) {
          cliPrint('Terminal Admin siap. Ketik "help" untuk daftar perintah.');
          cliPanel.dataset.welcomed = "1";
        }
        cliInput.focus();
      }
    });
  }
  if (cliCloseBtn && cliPanel) {
    cliCloseBtn.addEventListener("click", () => cliPanel.classList.remove("open"));
  }
  if (cliInput) {
    cliInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = cliInput.value;
        if (value.trim()) {
          cliHistory.push(value);
          cliHistoryIndex = cliHistory.length;
        }
        cliInput.value = "";
        cliExecute(value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (cliHistoryIndex > 0) {
          cliHistoryIndex--;
          cliInput.value = cliHistory[cliHistoryIndex] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (cliHistoryIndex < cliHistory.length - 1) {
          cliHistoryIndex++;
          cliInput.value = cliHistory[cliHistoryIndex] || "";
        } else {
          cliHistoryIndex = cliHistory.length;
          cliInput.value = "";
        }
      }
    });
  }
});
