/* =========================================================
   Sound Engine — efek suara & musik 8-bit, disintesis langsung
   di browser pakai Web Audio API (tidak perlu file audio sama sekali).
   Dipakai bersama di semua halaman (index, admin, minigame).
   ========================================================= */

let _audioCtx = null;
function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!_audioCtx) _audioCtx = new AC();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

// Satu nada pendek gaya 8-bit (gelombang persegi/segitiga/gigi gergaji).
function beep(freq, duration, type = "square", volume = 0.05, delay = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

function isSfxEnabled() {
  return localStorage.getItem("sfxEnabled") !== "off";
}
function setSfxEnabled(on) {
  localStorage.setItem("sfxEnabled", on ? "on" : "off");
}

const SFX = {
  click() { beep(660, 0.05, "square", 0.045); },
  success() {
    beep(523, 0.08, "square", 0.06);
    beep(659, 0.08, "square", 0.06, 0.08);
    beep(784, 0.16, "square", 0.06, 0.16);
  },
  error() {
    beep(220, 0.15, "sawtooth", 0.055);
    beep(160, 0.22, "sawtooth", 0.055, 0.1);
  },
  chime() {
    beep(880, 0.1, "triangle", 0.05);
    beep(1046, 0.2, "triangle", 0.05, 0.1);
  },
  boot() {
    beep(220, 0.08, "square", 0.05);
    beep(440, 0.08, "square", 0.05, 0.09);
    beep(880, 0.18, "square", 0.05, 0.18);
  },
};

// Panggil ini, bukan SFX.xxx() langsung — supaya menghormati toggle mute.
function playSfx(name) {
  if (!isSfxEnabled()) return;
  const fn = SFX[name];
  if (fn) fn();
}

/* ===== BGM Chiptune (loop pendek, mati secara default) ===== */
const CHIPTUNE_MELODY = [
  523, 587, 659, 523, 659, 698, 784, 659,
  880, 784, 698, 659, 587, 523, 440, 523,
];
const BGM_BEAT_MS = 230;
let _bgmInterval = null;
let _bgmStep = 0;

function isBgmPlaying() {
  return _bgmInterval !== null;
}
function startBgm() {
  if (_bgmInterval) return;
  getAudioCtx(); // pastikan AudioContext ter-resume dari gesture klik user
  _bgmStep = 0;
  _bgmInterval = setInterval(() => {
    beep(CHIPTUNE_MELODY[_bgmStep % CHIPTUNE_MELODY.length], 0.17, "square", 0.028);
    _bgmStep++;
  }, BGM_BEAT_MS);
}
function stopBgm() {
  clearInterval(_bgmInterval);
  _bgmInterval = null;
}
function toggleBgm() {
  if (isBgmPlaying()) stopBgm();
  else startBgm();
  return isBgmPlaying();
}

// Mainkan bunyi klik untuk semua tombol & link umum situs (delegasi event,
// jadi otomatis kena tombol yang dibuat belakangan lewat JS juga).
document.addEventListener("click", (e) => {
  const el = e.target.closest("button, .btn, a[data-nav]");
  if (el) playSfx("click");
});
