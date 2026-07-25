document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("adminAuth") === "true") {
    window.location.href = "../adminpanel/";
    return;
  }

  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Memverifikasi...";

    const password = passwordInput.value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem("adminAuth", "true");
        window.location.href = "../adminpanel/";
      } else {
        errorMsg.style.display = "block";
        passwordInput.value = "";
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Masuk";
    }
  });
});
