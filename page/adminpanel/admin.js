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
let piketData = {};
const PIKET_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

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

async function loadPiket() {
  try {
    const res = await apiFetch("/piket");
    piketData = await res.json();
    renderPiketAdmin();
  } catch (err) { console.error("Gagal memuat jadwal piket:", err); }
}

async function loadAll() {
  await Promise.all([loadAnnouncements(), loadTasks(), loadGallery(), loadActivityLog(), loadFeedback(), loadPiket()]);
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

/* ===== RENDER & SIMPAN: PIKET GULUNG SAJADAH ===== */
function renderPiketAdmin() {
  const wrap = document.getElementById("piketAdminList");
  if (!wrap) return;
  wrap.innerHTML = PIKET_DAYS.map(day => {
    const entry = piketData[day] || {};
    return `
      <div class="form-group" style="display:flex; gap:0.5rem; align-items:flex-end;">
        <div style="flex:1;">
          <label for="piketNames_${day}">${day}</label>
          <input type="text" id="piketNames_${day}" value="${escapeAttr(entry.names || "")}" placeholder="Nama petugas, pisahkan koma">
        </div>
        <button type="button" class="btn btn-secondary" style="height:44px;" onclick="savePiketDay('${day}')">Simpan</button>
      </div>
    `;
  }).join("");
}

async function savePiketDay(day) {
  const input = document.getElementById(`piketNames_${day}`);
  if (!input) return;
  const names = input.value.trim();
  try {
    const res = await apiFetch(`/piket/${day}`, {
      method: "PUT",
      body: JSON.stringify({ names, note: "" }),
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Piket hari ${day} disimpan!`);
      loadPiket();
      loadActivityLog();
    } else {
      showToast(result.message || "Gagal menyimpan jadwal piket.");
    }
  } catch (err) { /* apiFetch already redirects on 401 */ }
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
  selectedGalleryFile = null;
  document.getElementById("photoFileInput").value = "";
  document.getElementById("dropzoneIdle").style.display = "block";
  document.getElementById("dropzonePreviewWrap").style.display = "none";
  document.getElementById("uploadProgressWrap").style.display = "none";
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

// Reads the file both for the preview AND to get the base64 payload we'll
// send to the server (kept together since FileReader gives us both at once).
function handleFileSelected(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("File harus berupa gambar.");
    return;
  }
  if (file.size > 1.5 * 1024 * 1024) {
    showToast("Ukuran gambar maksimal 1.5MB.");
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

// Uploads as base64 JSON (not multipart/form-data) — multer/busboy-style
// multipart parsing hangs indefinitely on Vercel's serverless functions, so
// this reuses the same JSON path that already works reliably for
// announcements/tasks. No real upload-progress events exist for fetch(), so
// we show an indeterminate "uploading" state instead of a fake percentage.
function uploadGalleryPhoto() {
  if (!selectedGalleryFile) return;

  const uploadBtn = document.getElementById("galleryUploadBtn");
  uploadBtn.disabled = true;
  const progressWrap = document.getElementById("uploadProgressWrap");
  const progressBar = document.getElementById("uploadProgressBar");
  const progressLabel = document.getElementById("uploadProgressLabel");
  progressWrap.style.display = "block";
  progressBar.style.width = "100%";
  progressBar.classList.add("indeterminate");
  progressLabel.textContent = "Mengunggah foto...";

  const file = selectedGalleryFile;
  const reader = new FileReader();
  reader.onload = async () => {
    // reader.result looks like "data:image/png;base64,AAAA..." — strip the prefix.
    const dataBase64 = String(reader.result).split(",")[1] || "";
    try {
      const res = await apiFetch("/gallery/upload", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type, dataBase64 }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("Foto berhasil diunggah!");
        closeModal("galleryModalBackdrop");
        loadGallery();
        loadActivityLog();
      } else {
        showToast(result.message || "Gagal mengunggah foto.");
      }
    } catch (err) {
      // apiFetch already redirects on 401; anything else just needs a toast.
      showToast("Gagal mengunggah foto (koneksi bermasalah).");
    } finally {
      uploadBtn.disabled = false;
      progressBar.classList.remove("indeterminate");
    }
  };
  reader.onerror = () => {
    uploadBtn.disabled = false;
    showToast("Gagal membaca file foto.");
  };
  reader.readAsDataURL(file);
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
});
