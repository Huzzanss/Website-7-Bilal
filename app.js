const CLASS_ICON = "logo-kelas.png";

function renderBrandBadge(){
  const el = document.getElementById("brandBadge");
  if (CLASS_ICON && CLASS_ICON.trim()){
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas" onerror="this.parentElement.textContent='VII'">`;
  }
}

const TEACHER = {
  name: "Sugeng Riyadi, S.Kom., Gr.",
  role: "Wali Kelas",
  photo: "paksugeng.png",
};

const STUDENTS = [
  { name: "Chaerul Risyad Ferdiansyah", photo: "" },
  { name: "Ahmad Abdullah Hafi Munaji", photo: "" },
  { name: "Ahmad Faeyza Rafa", photo: "" },
  { name: "Al Ghazali Fahran", photo: "" },
  { name: "Alkhaliifi Hasyimi", photo: "" },
  { name: "Almer Abrisam Dzaky Noor", photo: "" },
  { name: "Faalih Arkaan", photo: "" },
  { name: "Hafidz Alfatih Hermanto", photo: "" },
  { name: "Handanu Indrafaza Styawan", photo: "" },
  { name: "Muhammad Abdurrahman Dzaki", photo: "" },
  { name: "Muhammad Alfindra Auvar Rahardja", photo: "" },
  { name: "Muhammad Asyraf Al Farisi", photo: "" },
  { name: "Muhammad El Junot Razqal", photo: "" },
  { name: "Muhammad Faqih Ramadhan", photo: "" },
  { name: "Muhammad Hafidz Setiadi", photo: "" },
  { name: "Muhammad Zharif Syatir", photo: "" },
  { name: "Muhammad Atha Alieudin Hamani", photo: "" },
  { name: "Muhammad Azka Alieudin Kalani", photo: "" },
];

const SCHEDULE = {
  Senin: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.30", subject: "Upacara / Apel / Bina Pribadi Islam" },
    { time: "08.30–09.30", subject: "Bahasa Arab" },
    { time: "09.30–10.00", subject: "Istirahat" },
    { time: "10.00–11.00", subject: "Matematika" },
    { time: "11.00–12.00", subject: "Al Qur'an" },
    { time: "12.00–12.30", subject: "Istirahat" },
    { time: "12.30–13.15", subject: "Salat Dzuhur, Makan Siang" },
    { time: "13.15–14.15", subject: "Pendidikan Agama Islam" },
    { time: "14.15–15.15", subject: "Bahasa Indonesia" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Selasa: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Bahasa Indonesia" },
    { time: "09.00–10.00", subject: "Matematika" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Bahasa Inggris" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–14.30", subject: "English Speaking Coaching" },
    { time: "14.30–15.15", subject: "Karya Tulis Ilmiah" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Rabu: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Fisika" },
    { time: "09.00–10.00", subject: "Bimbingan Konseling" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–15.15", subject: "Bina Prestasi (Klub)" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Kamis: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Public Speaking" },
    { time: "09.00–10.00", subject: "Seni Budaya dan Prakarya" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Biologi" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–14.30", subject: "Pramuka" },
    { time: "14.30–15.15", subject: "Pembinaan Karakter dan Kepribadian" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Jumat: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Senam / Jalan Santai / Jumat Bersih" },
    { time: "08.00–09.00", subject: "Pendidikan Kewarganegaraan" },
    { time: "09.00–10.00", subject: "Informatika" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Ilmu Pengetahuan Sosial" },
    { time: "11.30–12.00", subject: "Pembinaan Karakter dan Kepribadian" },
    { time: "12.00–12.50", subject: "Salat Jum'at / Keputrian - Salat Dzuhur" },
    { time: "12.50–13.30", subject: "Makan Siang" },
    { time: "13.30–15.15", subject: "Bina Prestasi (Ekstrakurikuler)" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

let announcements = [];
let tasks = [];
let gallery = [];

let activeDay = DAYS[(new Date().getDay() >= 1 && new Date().getDay() <= 5) ? new Date().getDay() - 1 : 0];
let activeFilter = "semua";

function formatDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}

function daysLeftLabel(iso){
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(iso + "T00:00:00");
  const diff = Math.round((target - today) / 86400000);
  if (diff < 0) return "Lewat tenggat";
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Besok";
  return `${diff} hari lagi`;
}

/* REALTIME READ PENGUMUMAN */
db.ref("announcements").on("value", (snap) => {
  const val = snap.val() || {};
  announcements = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderAnnouncements();
});

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
      <span class="a-date">${escapeHTML(a.date || "")}</span>
    </div>
  `).join("");
}

/* JADWAL */
function renderScheduleTabs(){
  const tabs = document.getElementById("scheduleTabs");
  tabs.innerHTML = DAYS.map(d => `
    <button class="${d === activeDay ? "active" : ""}" data-day="${d}">${d}</button>
  `).join("");
  tabs.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeDay = btn.getAttribute("data-day");
      renderScheduleTabs();
      renderSchedule();
    });
  });
}

function renderSchedule(){
  const wrap = document.getElementById("scheduleWrap");
  const rows = SCHEDULE[activeDay] || [];
  if (!rows.length){
    wrap.innerHTML = `<p class="empty-note" style="padding:1rem;">Belum ada jadwal untuk hari ${activeDay}.</p>`;
    return;
  }
  wrap.innerHTML = rows.map(r => `
    <div class="schedule-row">
      <span class="schedule-time">${escapeHTML(r.time)}</span>
      <span class="schedule-subject">${escapeHTML(r.subject)}</span>
    </div>
  `).join("");
}

/* REALTIME READ TUGAS */
db.ref("tasks").on("value", (snap) => {
  const val = snap.val() || {};
  tasks = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
  renderTasks();
});

function renderTasks(){
  const list = document.getElementById("taskList");
  let items = tasks.slice();
  if (activeFilter !== "semua") items = items.filter(t => t.status === activeFilter);

  if (!items.length){
    list.innerHTML = `<p class="empty-note">Tidak ada tugas untuk filter ini.</p>`;
    return;
  }

  list.innerHTML = items.map(t => `
    <div class="task-card">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc || "")}</div>
      <div class="task-foot">
        <span class="deadline ${t.status === "selesai" ? "done" : ""}">
          ${formatDate(t.deadline)} · ${t.status === "selesai" ? "Selesai" : daysLeftLabel(t.deadline)}
        </span>
      </div>
    </div>
  `).join("");
}

document.getElementById("filterRow").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  activeFilter = btn.getAttribute("data-filter");
  document.querySelectorAll("#filterRow .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderTasks();
});

/* SISWA & WALI KELAS */
function avatarInnerHTML(name, photo){
  if (photo && photo.trim()){
    return `<img src="${escapeAttr(photo)}" alt="Foto ${escapeAttr(name)}" onerror="this.parentElement.innerHTML='${initials(name)}'">`;
  }
  return initials(name);
}

function renderTeacher(){
  const el = document.getElementById("teacherCard");
  el.innerHTML = `
    <span class="avatar" style="width:64px;height:64px;font-size:1.15rem;">${avatarInnerHTML(TEACHER.name, TEACHER.photo)}</span>
    <div>
      <p class="label-sm">${escapeHTML(TEACHER.role)}</p>
      <h3>${escapeHTML(TEACHER.name)}</h3>
    </div>
  `;
}

function renderStudents(){
  const list = document.getElementById("studentList");
  list.innerHTML = STUDENTS.map((s, i) => `
    <div class="student-item">
      <span class="avatar-wrap">
        <span class="student-no">${i + 1}</span>
        <span class="avatar">${avatarInnerHTML(s.name, s.photo)}</span>
      </span>
      <span class="student-name">${escapeHTML(toTitleCase(s.name))}</span>
    </div>
  `).join("");
}
function initials(name){ return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function toTitleCase(str){ return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

/* REALTIME READ GALERI */
db.ref("gallery").on("value", (snap) => {
  const val = snap.val() || {};
  gallery = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderGallery();
});

function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  if (!gallery.length){
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    return;
  }
  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item">
      <img src="${g.url}" alt="Dokumentasi kelas" loading="lazy">
    </div>
  `).join("");
}

/* NAV & UTIL */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

function escapeHTML(str = ""){
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(str = ""){ return escapeHTML(str); }

/* Init */
renderScheduleTabs();
renderSchedule();
renderTeacher();
renderStudents();
renderBrandBadge();
