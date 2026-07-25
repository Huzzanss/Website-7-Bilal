/* ===== TEMA GELAP/TERANG (mandiri, sama seperti halaman utama) ===== */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
const themeToggle = document.getElementById("themeToggle");
if (themeToggle){
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
  });
}

function showToast(msg, duration = 2200){
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ===== ELEMEN ===== */
const gameIntro = document.getElementById("gameIntro");
const gameScreen = document.getElementById("gameScreen");
const gameResult = document.getElementById("gameResult");
const gameArea = document.getElementById("gameArea");
const hudScore = document.getElementById("hudScore");
const hudTime = document.getElementById("hudTime");
const highScoreLabel = document.getElementById("highScoreLabel");
const highScoreNote = document.getElementById("highScoreNote");
const finalScore = document.getElementById("finalScore");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const GAME_DURATION = 30;
const ITEM_TYPES = [
  { emoji: "⭐", value: 1, weight: 55 },
  { emoji: "🌙", value: 2, weight: 27 },
  { emoji: "🕋", value: 5, weight: 8 },
  { emoji: "💣", value: -2, weight: 10, bad: true },
];
const TOTAL_WEIGHT = ITEM_TYPES.reduce((sum, t) => sum + t.weight, 0);

let score = 0;
let timeLeft = GAME_DURATION;
let items = [];
let running = false;
let spawnTimeoutId = null;
let tickIntervalId = null;
let rafId = null;
let lastFrameTime = 0;

function getHighScore(){
  return parseInt(localStorage.getItem("minigameHighScore") || "0", 10);
}
function setHighScore(val){
  localStorage.setItem("minigameHighScore", String(val));
}

function pickItemType(){
  let r = Math.random() * TOTAL_WEIGHT;
  for (const t of ITEM_TYPES){
    if (r < t.weight) return t;
    r -= t.weight;
  }
  return ITEM_TYPES[0];
}

function spawnItem(){
  if (!running) return;
  const type = pickItemType();
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const el = document.createElement("span");
  el.className = "falling-item";
  el.textContent = type.emoji;
  const x = 30 + Math.random() * (areaWidth - 60);
  el.style.left = x + "px";
  el.style.top = "-30px";
  gameArea.appendChild(el);

  const progress = 1 - (timeLeft / GAME_DURATION);
  const speed = 60 + progress * 70 + Math.random() * 30;

  const item = { el, x, y: -30, speed, type };
  el.addEventListener("click", () => catchItem(item));
  el.addEventListener("touchstart", (e) => { e.preventDefault(); catchItem(item); }, { passive: false });
  items.push(item);

  const nextDelay = Math.max(320, 850 - progress * 500);
  spawnTimeoutId = setTimeout(spawnItem, nextDelay);
}

function catchItem(item){
  if (!running || item.caught) return;
  item.caught = true;
  score += item.type.value;
  if (score < 0) score = 0;
  hudScore.textContent = score;

  const pop = document.createElement("span");
  pop.className = "score-pop";
  pop.textContent = (item.type.value > 0 ? "+" : "") + item.type.value;
  pop.style.left = item.x + "px";
  pop.style.top = item.y + "px";
  pop.style.color = item.type.bad ? "var(--deadline-red)" : "var(--secondary-dark)";
  gameArea.appendChild(pop);
  setTimeout(() => pop.remove(), 700);

  item.el.remove();
  items = items.filter(i => i !== item);
}

function gameLoop(timestamp){
  if (!running) return;
  const dt = lastFrameTime ? (timestamp - lastFrameTime) / 1000 : 0;
  lastFrameTime = timestamp;
  const areaHeight = gameArea.clientHeight;

  items.forEach(item => {
    item.y += item.speed * dt;
    item.el.style.top = item.y + "px";
  });
  items = items.filter(item => {
    if (item.y > areaHeight + 40){
      item.el.remove();
      return false;
    }
    return true;
  });

  rafId = requestAnimationFrame(gameLoop);
}

function startGame(){
  score = 0;
  timeLeft = GAME_DURATION;
  items = [];
  running = true;
  lastFrameTime = 0;
  gameArea.innerHTML = "";
  hudScore.textContent = "0";
  hudTime.textContent = String(timeLeft);

  gameIntro.style.display = "none";
  gameResult.style.display = "none";
  gameScreen.style.display = "block";

  spawnTimeoutId = setTimeout(spawnItem, 300);
  rafId = requestAnimationFrame(gameLoop);
  tickIntervalId = setInterval(() => {
    timeLeft--;
    hudTime.textContent = String(Math.max(timeLeft, 0));
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame(){
  running = false;
  clearTimeout(spawnTimeoutId);
  clearInterval(tickIntervalId);
  cancelAnimationFrame(rafId);
  items.forEach(i => i.el.remove());
  items = [];

  const high = getHighScore();
  const isNewHigh = score > high;
  if (isNewHigh) setHighScore(score);

  finalScore.textContent = score;
  highScoreNote.textContent = isNewHigh
    ? "🎉 Rekor baru! Skor tertinggi: " + score
    : "Skor tertinggi: " + getHighScore();

  gameScreen.style.display = "none";
  gameResult.style.display = "block";

  if (isNewHigh) showToast("🏆 Skor tertinggi baru!");
}

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

highScoreLabel.textContent = "Skor tertinggi: " + getHighScore();
