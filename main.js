const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frames = 0;
const GRAVITY = 0.2 ;
const JUMP = -5 ;
let gameOver = false;

let highScore = localStorage.getItem("highScore_flappy") || 0;
// Pájaro
const birdImage = new Image();
birdImage.src = "img/Pajaro-removebg-preview.png";
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

    // Inclinación al subir o caer
    if (this.velocity < 0) {
      this.angle = -30; // Subiendo (en grados)
    } else {
      this.angle += 2; // Cayendo
      if (this.angle > 90) this.angle = 90; // Máxima inclinación
    }

    // Límite inferior (suelo)
    if (this.y + this.h >= canvas.height) {
      gameOver = true;
    }
  },
  draw() {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.angle * Math.PI / 180); // Convertimos grados a radianes
    ctx.drawImage(birdImage, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  },
  jump() {
    this.velocity = JUMP;
    this.angle = -20; // Al saltar, se inclina hacia arriba
  }
};


// Tuberías
const pipes = [];
const pipeGap = 150;
const pipeWidth = 50;
let score = 0;

function createPipe() {
  const topHeight = Math.floor(Math.random() * 475) + 50;
  const bottomY = topHeight + pipeGap;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: bottomY
  });
}

function drawPipes() {
  ctx.fillStyle = "rgba(211, 84, 0, 0.8)"; // Color de las tuberías
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    pipe.bottom = pipe.top + pipeGap; // Asegurar que el espacio entre tuberías sea constante
  });
}
let pipeSpeed = 3;

function updatePipes() {
  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed; ;

    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
      if (score % 4 === 0) {
        pipeSpeed += 0.5; // Aumentar velocidad cada 7 puntos
      }
    }
    // Colisión
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.w > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.h > pipe.bottom)
    ) {
      gameOver = true;
    }

    // Aumentar puntuación
    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
    }

    // Eliminar tuberías fuera de la pantalla
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
  });
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = " bold 34px sans-serif";
  ctx.textAlign = "center"; // 🔄 Centrado horizontal
    ctx.fillText(`${score}`, canvas.width / 2, 50); // 🔄 Centrado horizontal

}
// Loop principal
function loop() {
  //if (frames % 300 === 0) {
  //  pipeSpeed += 0.2;
  //}

  if (gameOver) {
  // Fondo rojo translúcido
  ctx.fillStyle = "rgba(255,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center"; // 🔄 Centrado horizontal

  // Game Over
  ctx.font = "bold 36px sans-serif";
  ctx.fillText("Game Over", canvas.width / 2, 280);

  // Score encima de mensaje
  ctx.font = "24px sans-serif";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 320);

  // High Score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore_flappy", highScore);
  }
  // Mostrar High Score
  ctx.font = "24px sans-serif";
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 350);

  // Mostrar Botón de reinicio
  document.getElementById("restartBtn").style.display = "block";
  const restartBtn = document.getElementById("restartBtn");
    restartBtn.addEventListener("click", () => {
    location.reload(); // Recarga la página
  });

  document.addEventListener("keydown", e => {
  if (e.code === "Enter" || e.code === "Space") {
    location.reload(); // Recarga la página al presionar Enter o Space
  }
  });
  return;
}

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird.update();
  bird.draw();

  if (frames % 130 === 0) {
    createPipe();
  }

  updatePipes();
  drawPipes();
  drawScore();

  frames++;
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Keyw") {
    bird.jump();
  }
});
document.addEventListener("mousedown", e => {
  if (e.button === 0) { // 0 es el botón izquierdo
    bird.jump();
  }
});

loop();
