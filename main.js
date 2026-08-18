import { bakeAudio, startArpeggiator, playNoise } from './audio.js';

// 1. Pre-bake audio into memory on load
bakeAudio();

// 2. Browser requires user interaction before Web Audio plays
const handleStart = () => startArpeggiator();
window.addEventListener('click', handleStart, { once: true });
window.addEventListener('keydown', handleStart, { once: true });

// Player / Game State
let x = 10;
let y = 10;
const width = 150;
const height = 100;
const speed = 4;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Keyboard Input Tracking
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

window.addEventListener('keydown', (e) => {
  if (e.key in keys) {
    keys[e.key] = true;
    e.preventDefault(); // Prevent page scrolling
  }

  // Preset Noise SFX Triggers
  if (e.key === '1') {
    playNoise({ duration: 0.5, frequency: 0.2, pitchSweep: -0.15, volume: 0.3 });
  }

  if (e.key === '2') {
    playNoise({ duration: 0.08, frequency: 2.2, volume: 0.15 });
  }

  if (e.key === '3') {
    playNoise({ duration: 0.15, frequency: 1.8, pitchSweep: -1.4, volume: 0.2 });
  }

  if (e.key === '4') {
    playNoise({ duration: 2.0, frequency: 1.0, pitchSweep: -20, volume: 0.4 });
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys) {
    keys[e.key] = false;
  }
});

function update() {
  if (keys.ArrowUp)    y -= speed;
  if (keys.ArrowDown)  y += speed;
  if (keys.ArrowLeft)  x -= speed;
  if (keys.ArrowRight) x += speed;

  // Keep player within canvas boundaries
  x = Math.max(0, Math.min(canvas.width - width, x));
  y = Math.max(0, Math.min(canvas.height - height, y));
}

function draw() {
  // Clear frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Create a linear gradient relative to rect's current position
  const rainbow = ctx.createLinearGradient(x, 0, x + width, 0);

  // 2. Add standard rainbow color stops (0.0 to 1.0)
  rainbow.addColorStop(0, "red");
  rainbow.addColorStop(0.17, "orange");
  rainbow.addColorStop(0.33, "yellow");
  rainbow.addColorStop(0.5, "green");
  rainbow.addColorStop(0.67, "blue");
  rainbow.addColorStop(0.83, "indigo");
  rainbow.addColorStop(1, "violet");

  // 3. Apply gradient and draw moving rectangle
  ctx.fillStyle = rainbow;
  ctx.fillRect(x, y, width, height);

  // 4. Draw Title Text
  ctx.font = "30px Courier";
  ctx.fillStyle = "white";
  ctx.fillText("Project Litr", 50, 175);
  ctx.font = "20px Courier";
  ctx.fillText("1,2,3,4 to make noise!",10, 210);
  ctx.fillText("Arrows to move the rainbow",10,230);
}

// Synchronized Game Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
