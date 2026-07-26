/* ===== THEME (LIGHT/DARK) ===== */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
  });
}

function showToast(msg, duration = 3200) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout after too many failed attempts

document.addEventListener("DOMContentLoaded", () => {
  // If session expired notice is present in URL, inform the user
  const params = new URLSearchParams(window.location.search);
  if (params.get("reason") === "expired") {
    showToast("Sesi kamu berakhir. Silakan login kembali.");
  }

  // If already logged in with a valid session, go straight to admin panel
  if (sessionStorage.getItem("adminAuth") === "true") {
    window.location.href = "../adminpanel/";
    return;
  }

  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = document.getElementById("submitBtn");
  const lockoutBanner = document.getElementById("lockoutBanner");
  const togglePasswordBtn = document.getElementById("togglePassword");

  // Show/hide password toggle
  togglePasswordBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePasswordBtn.setAttribute("aria-label", isHidden ? "Sembunyikan password" : "Tampilkan password");
  });

  let lockoutInterval = null;

  function getAttempts() { return parseInt(sessionStorage.getItem("loginAttempts") || "0", 10); }
  function setAttempts(n) { sessionStorage.setItem("loginAttempts", String(n)); }
  function getLockoutUntil() { return parseInt(sessionStorage.getItem("loginLockoutUntil") || "0", 10); }
  function setLockoutUntil(ts) { sessionStorage.setItem("loginLockoutUntil", String(ts)); }

  function updateLockoutUI() {
    const until = getLockoutUntil();
    const remaining = until - Date.now();
    if (remaining > 0) {
      submitBtn.disabled = true;
      const seconds = Math.ceil(remaining / 1000);
      lockoutBanner.style.display = "block";
      lockoutBanner.textContent = `Terlalu banyak percobaan gagal. Coba lagi dalam ${seconds} detik.`;
      if (!lockoutInterval) {
        lockoutInterval = setInterval(() => {
          const left = getLockoutUntil() - Date.now();
          if (left <= 0) {
            clearInterval(lockoutInterval);
            lockoutInterval = null;
            lockoutBanner.style.display = "none";
            submitBtn.disabled = false;
            setAttempts(0);
          } else {
            lockoutBanner.textContent = `Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(left / 1000)} detik.`;
          }
        }, 1000);
      }
      return true;
    }
    lockoutBanner.style.display = "none";
    return false;
  }

  updateLockoutUI();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";

    if (updateLockoutUI()) return;

    const password = passwordInput.value.trim();

    // Client-side validation before hitting the server
    if (!password) {
      errorMsg.textContent = "Password wajib diisi.";
      errorMsg.style.display = "block";
      passwordInput.focus();
      return;
    }
    if (password.length < 4) {
      errorMsg.textContent = "Password terlalu pendek.";
      errorMsg.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Memverifikasi...";

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (result.success) {
        setAttempts(0);
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminLoginTime", String(Date.now()));
        if (window.db) {
          db.ref("activityLog").push({
            action: "login",
            label: "Admin berhasil login",
            timestamp: firebase.database.ServerValue.TIMESTAMP
          });
        }
        window.location.href = "../adminpanel/";
      } else {
        const attempts = getAttempts() + 1;
        setAttempts(attempts);
        if (attempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_MS);
          updateLockoutUI();
          errorMsg.style.display = "none";
        } else {
          errorMsg.textContent = `Password salah. Sisa percobaan: ${MAX_ATTEMPTS - attempts}.`;
          errorMsg.style.display = "block";
        }
        passwordInput.value = "";
        passwordInput.focus();
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi server.");
    } finally {
      submitBtn.disabled = updateLockoutUI();
      submitBtn.textContent = "Masuk";
    }
  });
});
