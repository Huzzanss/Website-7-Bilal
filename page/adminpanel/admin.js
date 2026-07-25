/* ===== RENDER FUNCTIONS DENGAN CLASS CSS RAPI ===== */

function renderAnnouncements() {
  const list = document.getElementById("adminAnnouncementList");
  if (!list) return;

  if (!announcements.length) {
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman.</p>`;
    return;
  }

  list.innerHTML = announcements.map(a => `
    <div class="admin-card">
      <div class="a-body">
        <strong style="font-family: var(--font-display); font-size: 1rem; color: var(--on-surface); display: block; margin-bottom: 0.3rem;">${escapeHTML(a.title)}</strong>
        <p style="color: var(--on-surface-variant); font-size: 0.9rem; margin-bottom: 0.5rem;">${escapeHTML(a.body || "")}</p>
        <span style="font-size: 0.75rem; color: var(--on-surface-variant); font-weight: 600;">${escapeHTML(a.date || "")}</span>
      </div>
      <button class="btn-danger-sm" onclick="deleteAnnouncement('${a.id}')" title="Hapus Pengumuman">Hapus</button>
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
        <div class="action-group">
          <button class="btn btn-secondary" style="min-height:32px; padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
            ${t.status === "selesai" ? "Buka Lagi" : "Tandai Selesai"}
          </button>
          <button class="btn-danger-sm" onclick="deleteTask('${t.id}')" title="Hapus Tugas">Hapus</button>
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
      <button class="btn-delete-img" onclick="deleteGalleryItem('${g.id}')" title="Hapus Foto">&times;</button>
    </div>
  `).join("");
}
