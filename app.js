const CLASS_ICON = "/logo-kelas.png";

function renderBrandBadge(){
  const el = document.getElementById("brandBadge");
  if (!el) return;
  if (CLASS_ICON && CLASS_ICON.trim()){
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas" onerror="this.parentElement.textContent='VII'">`;
  }
}

const TEACHER = {
  name: "Sugeng Riyadi, S.Kom., Gr.",
  role: "Wali Kelas",
  photo: "paksugeng.png",
};

const CLASS_STRUCTURE = [
  { role: "Ketua Kelas", name: "Muhammad Alfindra Auvar Rahardja", nickname: "", photo: "" },
  { role: "Wakil Ketua Kelas", name: "Muhammad Asyraf Al Farisi", nickname: "Izi", photo: "" },
  { role: "Sekretaris", name: "Ahmad Abdullah Hafi Munaji", nickname: "Hafi", photo: "" },
  { role: "Keamanan", name: "Chaerul Risyad Ferdiansyah", nickname: "Icad", photo: "" },
  { role: "Kebersihan", name: "Muhammad Hafidz Setiadi", nickname: "", photo: "" },
];

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

function daysUntilDeadline(iso){
  if (!iso) return 999;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function deadlineUrgencyClass(task){
  if (task.status === "selesai") return "done";
  const diff = daysUntilDeadline(task.deadline);
  if (diff < 0) return "urgency-overdue";
  if (diff <= 1) return "urgency-urgent";
  if (diff <= 3) return "urgency-soon";
  return "";
}

/* AMBIL DATA PENGUMUMAN DARI REST API */
const API_BASE = "/api";

async function loadAnnouncements(){
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    announcements = await res.json();
    renderAnnouncements();
  } catch (err) {
    console.error("Gagal memuat pengumuman:", err);
  }
}

function renderAnnouncements(){
  const list = document.getElementById("announcementList");
  if (!list) return;
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
  if (!tabs) return;
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
  if (!wrap) return;
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

/* PIKET KELAS (HARIAN) — data tetap, diatur lewat kode, bukan admin panel */
const PIKET_KELAS = {
  Senin: "Faalih, Almer, Aca (Junot), Atha",
  Selasa: "Hafidz, Al Ghazali, Fatih, Azka",
  Rabu: "Izzi, Icad, Faezya (Ezra)",
  Kamis: "Faqih, Hafi, Indra",
  Jumat: "Alfin, Syatir, Alkhalifi (Lifi), Dzaki",
};

function renderPiketKelas(){
  const wrap = document.getElementById("piketKelasWrap");
  if (!wrap) return;
  wrap.innerHTML = DAYS.map(day => `
    <div class="schedule-row">
      <span class="schedule-time">${day}</span>
      <span class="schedule-subject">${escapeHTML(PIKET_KELAS[day] || "Belum diatur")}</span>
    </div>
  `).join("");
}

/* PIKET GULUNG SAJADAH (BALLROOM) — data tetap, diatur lewat kode, bukan admin panel */
const PIKET_BALLROOM = {
  Senin: "Salman Al Farisi, Aisyah Binti Abu Bakar",
  Selasa: "Amru Bin Ash, Hafsah Binti Umar",
  Rabu: "Thoriq Bin Ziyad, Fatimah Az Zahra, Khansa Binti Amr",
  Kamis: "Khalid Bin Walid, Khadijah Binti Khuwailid, Halimah Assa'diyah",
  Jumat: "Bilal Bin Rabbah, Mus'ab Bin Umair, Zainab Binti Muhammad",
};

function renderPiket(){
  const wrap = document.getElementById("piketWrap");
  if (!wrap) return;
  wrap.innerHTML = DAYS.map(day => `
    <div class="schedule-row">
      <span class="schedule-time">${day}</span>
      <span class="schedule-subject">${escapeHTML(PIKET_BALLROOM[day] || "Belum diatur")}</span>
    </div>
  `).join("");
}

/* AMBIL DATA TUGAS DARI REST API */
async function loadTasks(){
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error("Gagal memuat tugas:", err);
  }
}

function renderTasks(){
  const list = document.getElementById("taskList");
  if (list) {
    let items = tasks.slice();
    if (activeFilter !== "semua") items = items.filter(t => t.status === activeFilter);

    if (!items.length){
      list.innerHTML = `<p class="empty-note">Tidak ada tugas untuk filter ini.</p>`;
    } else {
      list.innerHTML = items.map(t => {
        const urgency = deadlineUrgencyClass(t);
        return `
        <div class="task-card ${urgency}">
          <div class="task-top">
            <span class="task-subject">${escapeHTML(t.subject)}</span>
            <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
          </div>
          <div class="task-title">${escapeHTML(t.title)}</div>
          <div class="task-desc">${escapeHTML(t.desc || "")}</div>
          <div class="task-foot">
            <span class="deadline ${t.status === "selesai" ? "done" : urgency}">
              ${formatDate(t.deadline)} · ${t.status === "selesai" ? "Selesai" : daysLeftLabel(t.deadline)}
            </span>
          </div>
        </div>
      `;
      }).join("");
    }
  }
  renderCalendar();
}

const filterRow = document.getElementById("filterRow");
if (filterRow) {
  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    activeFilter = btn.getAttribute("data-filter");
    document.querySelectorAll("#filterRow .chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    renderTasks();
  });
}

/* KALENDER TUGAS (tampilan bulanan) */
let calendarDate = new Date();
const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function renderCalendar(){
  const grid = document.getElementById("calendarGrid");
  const label = document.getElementById("calMonthLabel");
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  label.textContent = `${MONTH_NAMES[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // 0 = Senin
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--){
    cells.push({ day: daysInPrevMonth - i, otherMonth: true, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++){
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, otherMonth: false, dateStr });
  }
  while (cells.length % 7 !== 0){
    cells.push({ day: cells.length - firstWeekday - daysInMonth + 1, otherMonth: true, dateStr: null });
  }

  grid.innerHTML = cells.map(cell => {
    if (cell.otherMonth){
      return `<div class="calendar-day other-month"><span class="calendar-day-number">${cell.day}</span></div>`;
    }
    const dayTasks = tasks.filter(t => t.deadline === cell.dateStr);
    const isToday = cell.dateStr === todayStr;
    const chips = dayTasks.slice(0, 2).map(t => {
      const cls = deadlineUrgencyClass(t);
      return `<div class="calendar-task-chip ${cls}" title="${escapeAttr(t.subject + ": " + t.title)}">${escapeHTML(t.subject)}</div>`;
    }).join("");
    const more = dayTasks.length > 2 ? `<div class="calendar-more">+${dayTasks.length - 2} lainnya</div>` : "";
    return `
      <div class="calendar-day ${isToday ? "today" : ""}">
        <span class="calendar-day-number">${cell.day}</span>
        <div class="calendar-tasks">${chips}${more}</div>
      </div>
    `;
  }).join("");
}

const calPrevBtn = document.getElementById("calPrevBtn");
const calNextBtn = document.getElementById("calNextBtn");
if (calPrevBtn) calPrevBtn.addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
if (calNextBtn) calNextBtn.addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

/* KOTAK SARAN */
const feedbackForm = document.getElementById("feedbackForm");
if (feedbackForm){
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("feedbackName");
    const messageInput = document.getElementById("feedbackMessage");
    const messageError = document.getElementById("feedbackMessageError");
    const submitBtn = document.getElementById("feedbackSubmitBtn");

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!message){
      messageError.textContent = "Pesan tidak boleh kosong.";
      messageInput.focus();
      return;
    }
    messageError.textContent = "";
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const result = await res.json();
      if (result.success){
        showToast("Terima kasih! Masukanmu sudah terkirim. 🙏");
        feedbackForm.reset();
      } else {
        messageError.textContent = result.message || "Gagal mengirim, coba lagi.";
      }
    } catch (err) {
      showToast("Gagal mengirim, cek koneksi internet kamu.");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* KOTAK SARAN (PUBLIK, TAMPILAN BACA SAJA) */
let feedbackPublicList = [];

async function loadFeedbackPublic(){
  try {
    const res = await fetch(`${API_BASE}/feedback`);
    feedbackPublicList = await res.json();
    renderFeedbackPublic();
  } catch (err) {
    console.error("Gagal memuat masukan:", err);
  }
}

function renderFeedbackPublic(){
  const list = document.getElementById("feedbackPublicList");
  if (!list) return;
  if (!feedbackPublicList.length){
    list.innerHTML = `<p class="empty-note">Belum ada masukan. Jadi yang pertama, yuk!</p>`;
    return;
  }
  list.innerHTML = feedbackPublicList.map(f => `
    <div class="announcement-item">
      <div class="a-body">
        <strong>${escapeHTML(f.name || "Anonim")}</strong>
        <p>${escapeHTML(f.message)}</p>
      </div>
      <span class="a-date">${escapeHTML(relativeTimePublic(f.createdAt))}</span>
    </div>
  `).join("");
}

function relativeTimePublic(ts){
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

/* SISWA & WALI KELAS */
function avatarInnerHTML(name, photo){
  if (photo && photo.trim()){
    return `<img src="${escapeAttr(photo)}" alt="Foto ${escapeAttr(name)}" onerror="this.parentElement.innerHTML='${initials(name)}'">`;
  }
  return initials(name);
}

function renderTeacher(){
  const el = document.getElementById("teacherCard");
  if (!el) return;
  el.innerHTML = `
    <span class="avatar" style="width:64px;height:64px;font-size:1.15rem;">${avatarInnerHTML(TEACHER.name, TEACHER.photo)}</span>
    <div>
      <p class="label-sm">${escapeHTML(TEACHER.role)}</p>
      <h3>${escapeHTML(TEACHER.name)}</h3>
    </div>
  `;
}

function renderClassStructure(){
  const grid = document.getElementById("structureGrid");
  if (!grid) return;
  grid.innerHTML = CLASS_STRUCTURE.map(s => `
    <div class="structure-item">
      <span class="structure-role">${escapeHTML(s.role)}</span>
      <span class="avatar" style="width:56px;height:56px;font-size:1rem;">${avatarInnerHTML(s.name, s.photo)}</span>
      <span class="student-name">${escapeHTML(toTitleCase(s.name))}</span>
      ${s.nickname ? `<span class="structure-nickname">(${escapeHTML(s.nickname)})</span>` : ""}
    </div>
  `).join("");
}

function renderStudents(){
  const list = document.getElementById("studentList");
  if (!list) return;
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

/* AMBIL DATA GALERI DARI REST API */
async function loadGallery(){
  try {
    const res = await fetch(`${API_BASE}/gallery`);
    gallery = await res.json();
    renderGallery();
  } catch (err) {
    console.error("Gagal memuat galeri:", err);
  }
}

function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  if (grid) {
    if (!gallery.length){
      grid.innerHTML = `<div class="gallery-empty">Belum ada foto kegiatan.</div>`;
    } else {
      grid.innerHTML = gallery.map(g => `
        <div class="gallery-item">
          <img src="${g.url}" alt="Dokumentasi kelas" loading="lazy" onclick="openLightbox('${escapeAttr(g.url)}')">
        </div>
      `).join("");
    }
  }
  renderFeaturedPhoto();
}

/* FOTO PILIHAN HARI INI (berganti otomatis tiap hari, sama untuk semua orang) */
function renderFeaturedPhoto(){
  const wrap = document.getElementById("featuredPhotoWrap");
  if (!wrap) return;
  if (!gallery.length){
    wrap.style.display = "none";
    return;
  }
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  const photo = gallery[dayOfYear % gallery.length];
  wrap.querySelector("img").src = photo.url;
  wrap.style.display = "block";
}

/* LIGHTBOX (TAMPILAN PENUH FOTO GALERI) */
function openLightbox(url){
  const backdrop = document.getElementById("lightboxBackdrop");
  const img = document.getElementById("lightboxImg");
  if (!backdrop || !img) return;
  img.src = url;
  backdrop.classList.add("open");
}
function closeLightbox(){
  document.getElementById("lightboxBackdrop")?.classList.remove("open");
}
document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
document.getElementById("lightboxBackdrop")?.addEventListener("click", (e) => {
  if (e.target.id === "lightboxBackdrop") closeLightbox();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

/* CETAK JADWAL & PIKET (jadi PDF/gambar lewat dialog print browser) */
function buildPrintHTML(){
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const scheduleTables = DAYS.map(day => {
    const rows = SCHEDULE[day] || [];
    return `
      <h3>${day}</h3>
      <table class="print-table">
        <thead><tr><th style="width:22%;">Waktu</th><th>Kegiatan / Mata Pelajaran</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td>${escapeHTML(r.time)}</td><td>${escapeHTML(r.subject)}</td></tr>`).join("")}
        </tbody>
      </table>
    `;
  }).join("");

  const piketKelasRows = DAYS.map(day => `<tr><td>${day}</td><td>${escapeHTML(PIKET_KELAS[day] || "Belum diatur")}</td></tr>`).join("");
  const piketBallroomRows = DAYS.map(day => `<tr><td>${day}</td><td>${escapeHTML(PIKET_BALLROOM[day] || "Belum diatur")}</td></tr>`).join("");

  return `
    <div class="print-page">
      <div class="print-header">
        <img src="${CLASS_ICON}" alt="Logo Kelas">
        <div>
          <h1>Kelas VII Bilal bin Rabbah</h1>
          <p>SMP Islam Bunga Bangsa</p>
        </div>
      </div>

      <h2>Jadwal Pelajaran</h2>
      ${scheduleTables}

      <h2>Piket Kelas</h2>
      <table class="print-table">
        <thead><tr><th style="width:22%;">Hari</th><th>Petugas</th></tr></thead>
        <tbody>${piketKelasRows}</tbody>
      </table>

      <h2>Piket Gulung Sajadah (Ballroom)</h2>
      <table class="print-table">
        <thead><tr><th style="width:22%;">Hari</th><th>Kelas Bertugas</th></tr></thead>
        <tbody>${piketBallroomRows}</tbody>
      </table>

      <p class="print-footer">Dicetak dari website kelas pada ${today}</p>
    </div>
  `;
}

const printScheduleBtn = document.getElementById("printScheduleBtn");
if (printScheduleBtn){
  printScheduleBtn.addEventListener("click", () => {
    const printArea = document.getElementById("printArea");
    if (!printArea) return;
    printArea.innerHTML = buildPrintHTML();
    document.body.classList.add("printing");
    window.print();
  });
}
window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing");
});

/* NPC WALI KELAS (bubble chat mengambang, isinya dari data tugas & piket asli) */
function getNpcMessages(){
  const messages = [];
  const jsDay = new Date().getDay(); // 0=Minggu..6=Sabtu
  const todayName = (jsDay >= 1 && jsDay <= 5) ? DAYS[jsDay - 1] : null;

  if (todayName){
    if (PIKET_KELAS[todayName]) messages.push(`Piket kelas hari ini: ${PIKET_KELAS[todayName]}. Jangan lupa ya!`);
    if (PIKET_BALLROOM[todayName]) messages.push(`Piket gulung sajadah hari ini giliran kelas: ${PIKET_BALLROOM[todayName]}.`);
  }

  tasks
    .filter(t => t.status !== "selesai" && daysUntilDeadline(t.deadline) >= 0 && daysUntilDeadline(t.deadline) <= 1)
    .forEach(t => messages.push(`Jangan lupa, ${t.subject} "${t.title}" tenggatnya ${daysLeftLabel(t.deadline).toLowerCase()}!`));

  messages.push(
    "Semangat belajar hari ini! \uD83D\uDCDA",
    "Jangan lupa sholat tepat waktu ya!",
    "Rajin-rajin cek Papan Pengumuman!",
    "Kelas yang rapi bikin belajar makin nyaman.",
    "Sudah cek Kalender Tugas belum hari ini?"
  );
  return messages;
}

let npcMessages = [];
let npcMessageIndex = 0;

function showNextNpcMessage(){
  const bubble = document.getElementById("npcBubble");
  if (!bubble) return;
  npcMessages = getNpcMessages();
  if (!npcMessages.length) return;
  bubble.textContent = npcMessages[npcMessageIndex % npcMessages.length];
  npcMessageIndex++;
}

function initNpcWidget(){
  const widget = document.getElementById("npcWidget");
  if (!widget) return;
  showNextNpcMessage();
  setInterval(showNextNpcMessage, 9000);

  const closeBtn = document.getElementById("npcClose");
  if (closeBtn) closeBtn.addEventListener("click", () => widget.classList.add("npc-hidden"));
}

/* EFEK KETIK MESIN TIK PADA JUDUL HERO */
function typewriterEffect(el, speed = 32){
  if (!el) return;
  const text = el.textContent;
  el.textContent = "";
  el.classList.add("typewriter-active");
  let i = 0;
  (function tick(){
    if (i <= text.length){
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, speed);
    } else {
      el.classList.remove("typewriter-active");
    }
  })();
}

/* BOOT SCREEN (tampil sekali per sesi browser) */
(function initBootAndTypewriter(){
  const bootEl = document.getElementById("bootScreen");
  const heroTitle = document.querySelector(".hero-text h1");

  function startTypewriter(){
    if (heroTitle) typewriterEffect(heroTitle);
  }

  if (!bootEl || sessionStorage.getItem("bootShown")){
    if (bootEl) bootEl.remove();
    startTypewriter();
    return;
  }

  sessionStorage.setItem("bootShown", "1");
  if (typeof playSfx === "function") playSfx("boot");

  setTimeout(() => {
    bootEl.classList.add("boot-hide");
    setTimeout(() => {
      bootEl.remove();
      startTypewriter();
    }, 500);
  }, 1600);
})();

/* TOGGLE EFEK SUARA & MUSIK LATAR (chiptune, mati secara default) */
const sfxToggle = document.getElementById("sfxToggle");
if (sfxToggle && typeof isSfxEnabled === "function"){
  if (!isSfxEnabled()) document.documentElement.setAttribute("data-sfx", "off");
  sfxToggle.addEventListener("click", () => {
    const nowEnabled = !isSfxEnabled();
    setSfxEnabled(nowEnabled);
    document.documentElement.setAttribute("data-sfx", nowEnabled ? "on" : "off");
    if (nowEnabled) playSfx("click");
  });
}

const bgmToggle = document.getElementById("bgmToggle");
if (bgmToggle && typeof toggleBgm === "function"){
  bgmToggle.addEventListener("click", () => {
    const playing = toggleBgm();
    bgmToggle.classList.toggle("bgm-active", playing);
    showToast(playing ? "\uD83C\uDFB5 Musik latar nyala" : "\uD83D\uDD07 Musik latar mati", 1400);
  });
}

/* NAV & UTIL */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));
}

function escapeHTML(str = ""){
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(str = ""){ return escapeHTML(str); }

function showToast(msg, duration = 2600){
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ===== DARK MODE ===== */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
const themeToggle = document.getElementById("themeToggle");
if (themeToggle){
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
    showToast(current === "dark" ? "🌙 Mode gelap aktif" : "☀️ Mode terang aktif", 1600);
  });
}

/* ===== EASTER EGG 1: KLIK "BERANDA" 5X -> MINI GAME RAHASIA ===== */
let berandaClickCount = 0;
let berandaClickTimer = null;
const navBeranda = document.getElementById("navBeranda");
if (navBeranda){
  navBeranda.addEventListener("click", (e) => {
    berandaClickCount++;
    clearTimeout(berandaClickTimer);
    berandaClickTimer = setTimeout(() => { berandaClickCount = 0; }, 2200);

    if (berandaClickCount === 3){
      showToast("👀 Terus...", 1200);
    } else if (berandaClickCount === 4){
      showToast("🤫 1x lagi...", 1200);
    } else if (berandaClickCount >= 5){
      e.preventDefault();
      berandaClickCount = 0;
      showToast("🎮 Easter egg ditemukan! Membuka mini game...", 2200);
      setTimeout(() => { window.location.href = "/page/minigame/"; }, 700);
    }
  });
}

/* ===== EASTER EGG 2: KONAMI CODE -> CONFETTI ===== */
const KONAMI_CODE = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
let konamiProgress = [];

function spawnConfetti(){
  const colors = ["#1E3A8A","#0B7A70","#F59E0B","#EF4444","#14B8A6"];
  for (let i = 0; i < 60; i++){
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 1.5) + "s";
    piece.style.animationDelay = (Math.random() * 0.4) + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function handleKonamiKey(e){
  const key = e.key.toLowerCase();
  const expected = KONAMI_CODE[konamiProgress.length];
  if (key === expected){
    konamiProgress.push(key);
    if (konamiProgress.length === KONAMI_CODE.length){
      konamiProgress = [];
      spawnConfetti();
      showToast("🎉 Kode rahasia ditemukan! Selamat!", 3000);
    }
  } else {
    konamiProgress = (key === KONAMI_CODE[0]) ? [key] : [];
  }
}

/* ===== EASTER EGG 3: KLIK LOGO 7X -> LOGO MUTER ===== */
let logoClickCount = 0;
let logoClickTimer = null;
const brandBadgeEl = document.getElementById("brandBadge");
if (brandBadgeEl){
  brandBadgeEl.addEventListener("click", (e) => {
    logoClickCount++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1800);

    if (logoClickCount >= 7){
      e.preventDefault();
      logoClickCount = 0;
      brandBadgeEl.classList.remove("spin-egg");
      void brandBadgeEl.offsetWidth;
      brandBadgeEl.classList.add("spin-egg");
      showToast("🌀 Logo pusing!", 1600);
    }
  });
}

/* ===== SHORTCUT RAHASIA: KETIK 'admin' UNTUK PINDAH KE HALAMAN LOGIN ===== */
let secretBuffer = "";
let secretTimer = null;

window.addEventListener("keydown", (e) => {
  handleKonamiKey(e);

  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

  secretBuffer += e.key.toLowerCase();

  clearTimeout(secretTimer);
  secretTimer = setTimeout(() => { secretBuffer = ""; }, 1500);

  if (secretBuffer.endsWith("admin")){
    window.location.href = "/page/loginadminpanel/";
  }
});

/* Init */
renderScheduleTabs();
renderSchedule();
renderTeacher();
renderClassStructure();
renderStudents();
renderBrandBadge();

// Muat data dari server, lalu polling berkala supaya perubahan dari admin
// (di tab/perangkat lain) ikut muncul tanpa perlu refresh manual.
loadAnnouncements();
loadTasks();
loadGallery();
loadFeedbackPublic();
renderPiketKelas();
renderPiket();
initNpcWidget();
setInterval(() => {
  loadAnnouncements();
  loadTasks();
  loadGallery();
  loadFeedbackPublic();
}, 20000);
