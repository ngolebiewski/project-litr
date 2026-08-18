import { bakeAudio, startArpeggiator, playNoise } from './audio.js';
import { drawText } from './font.js';

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
const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

colors.forEach((color, index) => {
  rainbow.addColorStop(index / (colors.length - 1), color);
});

  // 3. Apply gradient and draw moving rectangle
  ctx.fillStyle = rainbow;
  ctx.fillRect(x, y, width, height);

  // 4. Draw Title Text
  drawText(ctx, "SCORE: 666!", 10, 10, 3, "#ff0");
  drawText(ctx, "1 2 3 4 5 6 7 8 9 0 :", 10, 30, 3, "#f00");
  drawText(ctx, "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?", 10, 50, 2, "#0F0");
  drawText(ctx, "PROJECT LITR", 10, 140, 8, "#FFF");
  drawText(ctx, "1,2,3,4 to make noise!",10, 210,2);
  drawText(ctx, "Arrows to move the rainbow",10,230,2);
}

// Synchronized Game Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
