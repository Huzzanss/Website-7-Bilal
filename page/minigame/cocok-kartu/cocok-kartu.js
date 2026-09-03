/* Tema, toast, dan efek suara disediakan bareng oleh app.js & sound.js
   (dimuat sebelum file ini) — di sini fokus ke logic game Cocokkan Kartu. */

const gameIntro = document.getElementById("gameIntro");
const gameScreen = document.getElementById("gameScreen");
const gameResult = document.getElementById("gameResult");
const board = document.getElementById("memoryBoard");
const hudMoves = document.getElementById("hudMoves");
const hudTimer = document.getElementById("hudTimer");
const highScoreLabel = document.getElementById("highScoreLabel");
const highScoreNote = document.getElementById("highScoreNote");
const finalStats = document.getElementById("finalStats");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

// Tema kartu bebas — ikon arcade klasik, bukan simbol khusus apa pun.
const ICONS = ["🕹️", "👾", "🎮", "💎", "🏆", "⚡", "🎯", "🔥"];

let flipped = [];
let matchedCount = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let locked = false;
let started = false;

function getBest(){
  const raw = localStorage.getItem("memoryMatchBest");
  return raw ? JSON.parse(raw) : null;
}
function setBest(m, s){
  localStorage.setItem("memoryMatchBest", JSON.stringify({ moves: m, seconds: s }));
}
function formatBest(best){
  return best ? `${best.moves} langkah \u00b7 ${best.seconds} detik` : "-";
}

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBoard(){
  const deck = shuffle([...ICONS, ...ICONS]);
  board.innerHTML = "";
  deck.forEach((icon) => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-face memory-card-back">?</div>
        <div class="memory-card-face memory-card-front">${icon}</div>
      </div>
    `;
    card.addEventListener("click", () => handleCardClick(card));
    board.appendChild(card);
  });
}

function handleCardClick(card){
  if (locked) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (flipped.length === 2) return;

  if (!started){
    started = true;
    seconds = 0;
    hudTimer.textContent = "0";
    timerInterval = setInterval(() => {
      seconds++;
      hudTimer.textContent = String(seconds);
    }, 1000);
  }

  card.classList.add("flipped");
  if (typeof playSfx === "function") playSfx("click");
  flipped.push(card);

  if (flipped.length === 2){
    moves++;
    hudMoves.textContent = String(moves);
    const [a, b] = flipped;

    if (a.dataset.icon === b.dataset.icon){
      a.classList.add("matched");
      b.classList.add("matched");
      flipped = [];
      matchedCount++;
      if (typeof playSfx === "function") playSfx("success");
      if (matchedCount === ICONS.length) endGame();
    } else {
      locked = true;
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        flipped = [];
        locked = false;
        if (typeof playSfx === "function") playSfx("error");
      }, 700);
    }
  }
}

function startGame(){
  matchedCount = 0;
  moves = 0;
  seconds = 0;
  flipped = [];
  locked = false;
  started = false;
  hudMoves.textContent = "0";
  hudTimer.textContent = "0";
  clearInterval(timerInterval);

  buildBoard();

  gameIntro.style.display = "none";
  gameResult.style.display = "none";
  gameScreen.style.display = "block";

  if (typeof playSfx === "function") playSfx("chime");
}

function endGame(){
  clearInterval(timerInterval);
  const best = getBest();
  const isNewBest = !best || moves < best.moves || (moves === best.moves && seconds < best.seconds);
  if (isNewBest) setBest(moves, seconds);

  finalStats.textContent = `${moves} langkah \u00b7 ${seconds} detik`;
  highScoreNote.textContent = "Rekor terbaik: " + formatBest(getBest());

  gameScreen.style.display = "none";
  gameResult.style.display = "block";

  if (isNewBest){
    if (typeof playSfx === "function") playSfx("success");
    if (typeof showToast === "function") showToast("\ud83c\udfc6 Rekor baru!");
  }
}

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

highScoreLabel.textContent = "Rekor terbaik: " + formatBest(getBest());
