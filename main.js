const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🎵 Audios
const gameOverSound = new Audio ("audio/game-over.mp3");
const pointSound = new Audio ("audio/point.mp3");
// Opcional: que se repita la música de fondo
pointSound.preload = "auto";
pointSound.volume = 0.7; // Puedes ajustar el volumen

// === VARIABLES GLOBALES ===
let frames = 0;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore_flappy") || 0;

const GRAVITY = 0.2;
const JUMP = -5;
const pipeGap = 150;
const pipeWidth = 50;
let pipeSpeed = 3;

const pipes = [];

const birdImage = new Image();
birdImage.src = "img/Pajaro-removebg-preview.png";

// === REINICIAR JUEGO ===
function resetGame() {
  frames = 0;
  score = 0;
  gameOver = false;
  pipeSpeed = 3;
  pipes.length = 0;

  bird.y = 200;
  bird.velocity = 0;
  bird.angle = 0;

  document.getElementById("restartBtn").style.display = "none";

  loop(); // reinicia el bucle
}

// === OBJETOS DEL JUEGO ===
const bird = {
  x: 60,
  y: 200,
  w: 40,
  h: 30,
  angle: 0,
  velocity: 0,

  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;

    if (this.velocity < 0) {
      this.angle = -30;
    } else {
      this.angle += 2;
      if (this.angle > 90) this.angle = 90;
    }

    if (this.y + this.h >= canvas.height) {
      if (!gameOver) {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
      }
      gameOver = true;
    }
  },

  draw() {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.drawImage(birdImage, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  },

  jump() {
    this.velocity = JUMP;
    this.angle = -20;
  }
};

// === FUNCIONES DE PIPES ===
function createPipe() {
  const topHeight = Math.floor(Math.random() * 475) + 50;
  const bottomY = topHeight + pipeGap;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: bottomY,
    passed: false
  });
}

function updatePipes() {
  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed;

    if (!gameOver && !pipe.passed && bird.x + bird.w > pipe.x && bird.x < pipe.x + pipeWidth && bird.y > pipe.top && bird.y + bird.h < pipe.bottom) {
    pipe.passed = true;
    score++;
    pointSound.pause();
    pointSound.currentTime = 0;
    pointSound.play();

  if (score % 4 === 0) pipeSpeed += 0.5;
}

    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.w > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.h > pipe.bottom)
    ) {
      if (!gameOver) {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
      }
      gameOver = true;
    }

    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
  });
}

function drawPipes() {
  ctx.fillStyle = "rgba(211, 84, 0, 0.8)";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });
}

// === FUNCIONES DE DIBUJO ===
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${score}`, canvas.width / 2, 50);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(255,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "bold 36px sans-serif";
  ctx.fillText("Has Chocado", canvas.width / 2, 280);

  ctx.font = "24px sans-serif";
  ctx.fillText(`Puntuacion: ${score}`, canvas.width / 2, 320);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore_flappy", highScore);
  }

  ctx.fillText(`Puntuacion Maxima ${highScore}`, canvas.width / 2, 350);

  document.getElementById("restartBtn").style.display = "block";
}

// === BUCLE PRINCIPAL ===
function update() {
  bird.update();
  updatePipes();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird.draw();
  drawPipes();
  drawScore();
}

function loop() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  if (frames % 130 === 0) createPipe();

  update();
  draw();

  frames++;
  requestAnimationFrame(loop);
}

// === CONTROLADORES DE EVENTOS ===
function setupEventListeners() {
  document.addEventListener("keydown", e => {
    if (["Space", "ArrowUp", "KeyW", "Keyw"].includes(e.code)) {
      bird.jump();
    }

    if (gameOver && (e.code === "Enter" || e.code === "Space")) {
      resetGame();
    }
  });

  document.addEventListener("mousedown", e => {
    if (!gameOver && e.button === 0) bird.jump();
  });

  document.getElementById("restartBtn").addEventListener("click", resetGame);


  document.getElementById("Start_game").addEventListener("click", () => {
    document.getElementById("START").style.display = "none";
    canvas.style.display = "block";
    loop();
  });
}

const controlsModal = document.getElementById("controlsModal");
const closeModalBtn = document.getElementById("closeModal");
const seeControlsBtn = document.getElementById("see_controls");

seeControlsBtn.addEventListener("click", () => {
controlsModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
controlsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === controlsModal) {
    controlsModal.style.display = "none";
  }
});

// === INICIALIZACIÓN ===
function init() {
  canvas.style.display = "none";
  setupEventListeners();
}

init();
