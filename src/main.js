import { bakeAudio, startArpeggiator, playNoise } from './audio.js';
import { drawText } from './font.js';

// 1. Pre-bake audio into memory on load
bakeAudio();

// 2. Browser requires user interaction before Web Audio plays
const handleStart = () => startArpeggiator();
window.addEventListener('click', handleStart, { once: true });
window.addEventListener('keydown', handleStart, { once: true });

// Player / Game State
let x = 90;
let y = 360;
const width = 20;
const height = 25;
const speed = 4;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Virtual design resolution. All game code below draws in these units.
// NOTE: must stay in sync with aspect-ratio/height in style.css.
const VW = 180, VH = 360;

// Match the bitmap to the CSS box at native device resolution. CSS already
// enforces the aspect ratio, so there is no letterboxing math to do here.
function fit() {
  const d = devicePixelRatio;
  const r = canvas.getBoundingClientRect();
  const w = Math.round(r.width * d), h = Math.round(r.height * d);
  if (w === canvas.width && h === canvas.height) return;
  canvas.width = w;
  canvas.height = h;
  // Assigning width/height resets the transform and imageSmoothingEnabled.
  const s = Math.min(w / VW, h / VH);
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

new ResizeObserver(fit).observe(canvas);
addEventListener("resize", fit);

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
  x = Math.max(0, Math.min(VW - width, x));
  y = Math.max(0, Math.min(VH - height, y));
}

function draw() {
  // Clear frame
  ctx.clearRect(0, 0, VW, VH);

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

  // 4. Draw Title Text (coords are virtual units; right edge = x + (4*len-1)*scale)
  drawText(ctx, "SCORE: 666!", 10, 10, 3, "#ff0");
  drawText(ctx, "1 2 3 4 5 6 7 8 9 0 :", 5, 30, 2, "#f00");
  drawText(ctx, "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?:", 10, 45, 1, "#0F0");
  drawText(ctx, "PROJECT LITR", 19, 60, 3, "#FFF");
  drawText(ctx, "1,2,3,4 to make noise!", 10, 300, 1);
  drawText(ctx, "Arrows to move the rainbow", 10, 310, 1);
}

// Synchronized Game Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
