import { bakeAudio, startArpeggiator, playNoise } from './audio.js';
import { drawText } from './font.js';
import Game from './Game.js';
import Scene from './Scene.js';
import Demo from './sceneDemo.js';

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

function gameLoop(g) {
  g.update();
  g.draw();
  requestAnimationFrame(() => gameLoop(g));
  }

function main() {
  const demo = Demo()
  const g = new Game(canvas, ctx, keys);
  g.update();
  g.scene = demo;
  console.log(g.scene.name)
  gameLoop(g);
}

main()
