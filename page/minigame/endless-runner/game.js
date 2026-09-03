const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreVal = document.getElementById('scoreVal');
const startMenu = document.getElementById('startMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const finalScore = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 40;

canvas.width = 800;
canvas.height = 400;

let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let gameSpeed = 5;
let frameCount = 0;

const player = {
    x: 50,
    y: canvas.height - GROUND_HEIGHT - 40,
    w: 40,
    h: 40,
    dy: 0,
    jumped: false,
    color: '#ffcc00'
};

let obstacles = [];

function spawnObstacle() {
    const size = Math.random() * (60 - 30) + 30;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - GROUND_HEIGHT - size,
        w: 30,
        h: size,
        color: '#ff4444'
    });
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    obstacles = [];
    player.y = canvas.height - GROUND_HEIGHT - 40;
    player.dy = 0;
    scoreVal.textContent = '0';
}

function jump() {
    if (gameState === 'PLAYING' && !player.jumped) {
        player.dy = JUMP_FORCE;
        player.jumped = true;
    }
}

window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

startBtn.onclick = () => {
    gameState = 'PLAYING';
    startMenu.classList.add('hidden');
    resetGame();
};

restartBtn.onclick = () => {
    gameState = 'PLAYING';
    gameOverMenu.classList.add('hidden');
    resetGame();
};

function update() {
    if (gameState !== 'PLAYING') return;

    frameCount++;
    if (frameCount % 100 === 0) {
        spawnObstacle();
        if (gameSpeed < 15) gameSpeed += 0.2;
    }

    // Player Physics
    player.dy += GRAVITY;
    player.y += player.dy;

    if (player.y > canvas.height - GROUND_HEIGHT - player.h) {
        player.y = canvas.height - GROUND_HEIGHT - player.h;
        player.dy = 0;
        player.jumped = false;
    }

    // Obstacles
    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;
        
        // Collision Detection
        if (player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y) {
            gameState = 'GAMEOVER';
            finalScore.textContent = Math.floor(score);
            gameOverMenu.classList.remove('hidden');
        }
    });

    obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
    
    score += 0.1;
    scoreVal.textContent = Math.floor(score);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

    // Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(player.x, player.y, player.w, player.h);

    // Obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
