/* =========================================================
   KREDENSIAL ADMIN — Silakan ubah di bawah ini
   ========================================================= */
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const CLASS_ICON = "logo-kelas.png";

function renderBrandBadge(){
  const el = document.getElementById("brandBadge");
  if (el && CLASS_ICON && CLASS_ICON.trim()){
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas" onerror="this.parentElement.textContent='VII'">`;
  }
}

let announcements = [];
let tasks = [];
let gallery = [];

/* ===== Icon Set ===== */
const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
const ICON_REFRESH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9M20.5 12a8.5 8.5 0 0 1-14.6 5.9"/><path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4"/></svg>`;

/* ===== Helper Functions ===== */
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function escapeHTML(str = ""){
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function todayLabel(){
  return new Date().toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
}

function addDays(n){
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
}

function formatDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}

/* ===== Modal Helper ===== */
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

function openModal(title, bodyHTML, onMount){
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalBackdrop.classList.add("open");
  if (onMount) onMount(modalBody);
}
function closeModal(){ modalBackdrop.classList.remove("open"); }
document.getElementById("modalClose")?.addEventListener("click", closeModal);
modalBackdrop?.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });

/* ===== SISTEM LOGIN ADMIN ===== */
const loginModal = document.getElementById("loginModal");
const adminContent = document.getElementById("adminContent");
const btnLogout = document.getElementById("btnLogout");

function checkAuth(){
  if (sessionStorage.getItem("adminLoggedIn") === "true"){
    loginModal.classList.remove("open");
    adminContent.style.display = "block";
    btnLogout.style.display = "inline-flex";
    initAdminData();
  } else {
    loginModal.classList.add("open");
    adminContent.style.display = "none";
    btnLogout.style.display = "none";
  }
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const u = document.getElementById("adminUsername").value.trim();
  const p = document.getElementById("adminPassword").value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS){
    sessionStorage.setItem("adminLoggedIn", "true");
    showToast("Berhasil masuk sebagai Admin");
    checkAuth();
  } else {
    showToast("Username atau Password salah!");
  }
});

btnLogout.addEventListener("click", () => {
  sessionStorage.removeItem("adminLoggedIn");
  showToast("Telah keluar");
  checkAuth();
});

/* ===== INITIALIZE FIREBASE LISTENERS UNTUK ADMIN ===== */
function initAdminData(){
  // Realtime Database: Pengumuman
  db.ref("announcements").on("value", (snap) => {
    const val = snap.val() || {};
    announcements = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderAnnouncements();
  });

  // Realtime Database: Tugas
  db.ref("tasks").on("value", (snap) => {
    const val = snap.val() || {};
    tasks = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
    renderTasks();
  });

  // Realtime Database: Galeri
  db.ref("gallery").on("value", (snap) => {
    const val = snap.val() || {};
    gallery = Object.entries(val)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderGallery();
  });
}

/* ===== MANAJEMEN PENGUMUMAN ===== */
function renderAnnouncements(){
  const list = document.getElementById("announcementList");
  if (!announcements.length){
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }
  list.innerHTML = announcements.map(a => `
    <div class="announcement-item">
      <div class="a-body">
        <strong>${escapeHTML(a.title)}</strong>
        <p>${escapeHTML(a.body || "")}</p>
      </div>
      <div class="item-actions">
        <span class="a-date">${escapeHTML(a.date || "")}</span>
        <button class="icon-btn" data-del-announcement="${a.id}" title="Hapus">${ICON_CLOSE}</button>
      </div>
    </div>
  `).join("");
}

document.getElementById("btnAddAnnouncement").addEventListener("click", () => {
  openModal("Buat Pengumuman Baru", `
    <div class="form-group">
      <label>Judul Pengumuman</label>
      <input type="text" id="fTitle" placeholder="Contoh: Libur Sekolah">
    </div>
    <div class="form-group">
      <label>Isi Pengumuman</label>
      <textarea id="fBody" placeholder="Tulis detail pengumuman..."></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="fCancel">Batal</button>
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    body.querySelector("#fCancel").addEventListener("click", closeModal);
    body.querySelector("#fSave").addEventListener("click", async () => {
      const title = body.querySelector("#fTitle").value.trim();
      const text = body.querySelector("#fBody").value.trim();
      if (!title){ showToast("Judul wajib diisi"); return; }
      try{
        await db.ref("announcements").push({
          title, body: text, date: todayLabel(),
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        });
        closeModal();
        showToast("Pengumuman ditambahkan");
      }catch(e){ showToast("Gagal menyimpan"); }
    });
  });
});

document.getElementById("announcementList").addEventListener("click", async (e) => {
  const id = e.target.closest("[data-del-announcement]")?.getAttribute("data-del-announcement");
  if (id && confirm("Yakin ingin menghapus pengumuman ini?")){
    await db.ref("announcements/" + id).remove();
    showToast("Pengumuman dihapus");
  }
});

/* ===== MANAJEMEN TUGAS ===== */
function renderTasks(){
  const list = document.getElementById("taskList");
  if (!tasks.length){
    list.innerHTML = `<p class="empty-note">Belum ada tugas.</p>`;
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
        <span class="deadline">${formatDate(t.deadline)}</span>
        <div class="task-actions">
          <button class="icon-btn" data-toggle="${t.id}" title="Ubah status">${ICON_REFRESH}</button>
          <button class="icon-btn" data-del-task="${t.id}" title="Hapus">${ICON_CLOSE}</button>
        </div>
      </div>
    </div>
  `).join("");
}

document.getElementById("btnAddTask").addEventListener("click", () => {
  openModal("Tambah Tugas / Ujian", `
    <div class="form-group">
      <label>Mata Pelajaran</label>
      <input type="text" id="fSubject" placeholder="Contoh: Matematika">
    </div>
    <div class="form-group">
      <label>Nama Tugas / Ujian</label>
      <input type="text" id="fTitle" placeholder="Contoh: PR Halaman 45">
    </div>
    <div class="form-group">
      <label>Deskripsi</label>
      <textarea id="fDesc" placeholder="Detail petunjuk tugas..."></textarea>
    </div>
    <div class="form-group">
      <label>Tenggat Waktu</label>
      <input type="date" id="fDeadline" value="${addDays(3)}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="fCancel">Batal</button>
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    body.querySelector("#fCancel").addEventListener("click", closeModal);
    body.querySelector("#fSave").addEventListener("click", async () => {
      const subject = body.querySelector("#fSubject").value.trim();
      const title = body.querySelector("#fTitle").value.trim();
      const desc = body.querySelector("#fDesc").value.trim();
      const deadline = body.querySelector("#fDeadline").value;
      if (!subject || !title || !deadline){ showToast("Data belum lengkap"); return; }
      try{
        await db.ref("tasks").push({ subject, title, desc, deadline, status: "berjalan" });
        closeModal();
        showToast("Tugas ditambahkan");
      }catch(e){ showToast("Gagal menyimpan"); }
    });
  });
});

document.getElementById("taskList").addEventListener("click", async (e) => {
  const toggleId = e.target.closest("[data-toggle]")?.getAttribute("data-toggle");
  const delId = e.target.closest("[data-del-task]")?.getAttribute("data-del-task");
  
  if (toggleId){
    const t = tasks.find(x => x.id === toggleId);
    await db.ref("tasks/" + toggleId).update({ status: t.status === "selesai" ? "berjalan" : "selesai" });
  }
  if (delId && confirm("Yakin ingin menghapus tugas ini?")){
    await db.ref("tasks/" + delId).remove();
    showToast("Tugas dihapus");
  }
});

/* ===== MANAJEMEN GALERI ===== */
function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  if (!gallery.length){
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto yang diunggah.</div>`;
    return;
  }
  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item">
      <img src="${g.url}" alt="Foto Galeri" loading="lazy">
      <button class="gallery-remove" data-del-photo="${g.id}" title="Hapus">${ICON_CLOSE}</button>
    </div>
  `).join("");
}

function compressImage(file, maxWidth = 1000, quality = 0.72){
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("galleryInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  showToast(`Mengunggah ${files.length} foto...`);
  for (const file of files){
    try{
      const dataUrl = await compressImage(file);
      await db.ref("gallery").push({
        url: dataUrl,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    }catch(err){
      showToast("Gagal mengunggah foto");
    }
  }
  e.target.value = "";
  showToast("Selesai mengunggah foto");
});

document.getElementById("galleryGrid").addEventListener("click", async (e) => {
  const id = e.target.closest("[data-del-photo]")?.getAttribute("data-del-photo");
  if (id && confirm("Hapus foto ini?")){
    await db.ref("gallery/" + id).remove();
    showToast("Foto dihapus");
  }
});

/* Init */
renderBrandBadge();
checkAuth();
