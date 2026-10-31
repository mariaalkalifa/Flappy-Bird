
const game = document.getElementById("game");
const bird = document.getElementById("bird");
const pipesContainer = document.getElementById("pipes");
const scoreDisplay = document.getElementById("score");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

// GAME SETTINGS
const gravity = 0.28;
const jumpPower = -5.5;
const pipeSpeed = 2;
const pipeGap = 180;
const pipeWidth = 65;

let birdY = 200;
let velocity = 0;
let score = 0;
let pipes = [];
let running = false;
let frame = 0;
let animationId = null;

// START OR RESTART GAME
function startGame() {
  cancelAnimationFrame(animationId);

  birdY = 200;
  velocity = 0;
  score = 0;
  frame = 0;
  pipes = [];

  pipesContainer.innerHTML = "";
  scoreDisplay.textContent = "Score: 0";

  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  bird.style.top = birdY + "px";
  bird.style.transform = "rotate(0deg)";

  running = true;
  animationId = requestAnimationFrame(gameLoop);
}

// MAKE BIRD JUMP
function flap() {
  if (!running) return;
  velocity = jumpPower;
}

// CREATE NEW PIPES
function createPipe() {
  const groundY = game.clientHeight * 0.75;
  const minTop = 40;
  const maxTop = groundY - pipeGap - 40;

  if (maxTop <= minTop) return;

  const topHeight =
    Math.random() * (maxTop - minTop) + minTop;

  const bottomY = topHeight + pipeGap;

  const topPipe = document.createElement("div");
  topPipe.className = "pipe top-pipe";
  topPipe.style.height = topHeight + "px";

  const bottomPipe = document.createElement("div");
  bottomPipe.className = "pipe bottom-pipe";
  bottomPipe.style.height =
    game.clientHeight - bottomY - "px";

  // Correct bottom pipe height
  bottomPipe.style.height =
    (game.clientHeight - bottomY) + "px";

  pipesContainer.appendChild(topPipe);
  pipesContainer.appendChild(bottomPipe);

  pipes.push({
    x: game.clientWidth,
    topHeight: topHeight,
    bottomY: bottomY,
    top: topPipe,
    bottom: bottomPipe,
    scored: false
  });
}

// MOVE PIPES AND CHECK COLLISIONS
function updatePipes() {
  const birdX = bird.offsetLeft;
  const birdWidth = bird.offsetWidth;
  const birdHeight = bird.offsetHeight;
  const padding = 5;

  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];

    pipe.x -= pipeSpeed;

    pipe.top.style.left = pipe.x + "px";
    pipe.bottom.style.left = pipe.x + "px";

    const hitHorizontally =
      birdX + birdWidth - padding > pipe.x &&
      birdX + padding < pipe.x + pipeWidth;

    const hitVertically =
      birdY + padding < pipe.topHeight ||
      birdY + birdHeight - padding > pipe.bottomY;

    if (hitHorizontally && hitVertically) {
      endGame();
      return;
    }

    // SCORE POINTS
    if (!pipe.scored && pipe.x + pipeWidth < birdX) {
      score++;
      scoreDisplay.textContent = "Score: " + score;
      pipe.scored = true;
    }

    // REMOVE PIPES THAT LEFT SCREEN
    if (pipe.x + pipeWidth < 0) {
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);
    }
  }
}

// MAIN GAME LOOP
function gameLoop() {
  if (!running) return;

  frame++;

  // APPLY GRAVITY
  velocity += gravity;
  birdY += velocity;

  // PREVENT FLYING ABOVE SCREEN
  if (birdY < 0) {
    birdY = 0;
    velocity = 0;
  }

  bird.style.top = birdY + "px";

  // ROTATE BIRD
  const rotation = Math.max(
    -25,
    Math.min(70, velocity * 5)
  );

  bird.style.transform = `rotate(${rotation}deg)`;

  // CHECK GROUND
  const groundY = game.clientHeight * 0.75;

  if (birdY + bird.offsetHeight >= groundY) {
    endGame();
    return;
  }

  // SPAWN PIPES
  if (frame % 120 === 0) {
    createPipe();
  }

  updatePipes();

  if (running) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

// GAME OVER
function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  finalScore.textContent = "Score: " + score;
  gameOverScreen.style.display = "block";
}

// SPACEBAR CONTROLS
document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

// MOUSE AND TOUCH CONTROLS
game.addEventListener("pointerdown", function(event) {
  if (event.target.closest("button")) return;
  flap();
});

// START BUTTON
startButton.addEventListener("click", startGame);

// RESTART BUTTON
restartButton.addEventListener("click", startGame);

