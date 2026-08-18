import { bakeAudio, startArpeggiator, playNoise } from './audio.js';

// 1. Pre-bake audio into memory as soon as the file loads
bakeAudio();

// 2. Play the pre-baked audio on first click or keypress
const handleStart = () => startArpeggiator();
window.addEventListener('click', handleStart, { once: true });
window.addEventListener('keydown', handleStart, { once: true });

let x = 10;
let y = 10;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 1. Create a linear gradient (startX, startY, endX, endY)
// Matching your rect: starts at X=10 and ends at X=160 (10 + 150 width)
const rainbow = ctx.createLinearGradient(10, 0, 160, 0);

// 2. Add the standard rainbow color stops (0.0 to 1.0)
rainbow.addColorStop(0, "red");
rainbow.addColorStop(0.17, "orange");
rainbow.addColorStop(0.33, "yellow");
rainbow.addColorStop(0.5, "green");
rainbow.addColorStop(0.67, "blue");
rainbow.addColorStop(0.83, "indigo");
rainbow.addColorStop(1, "violet");


// 3. Apply the gradient and draw
ctx.fillStyle = rainbow;
ctx.fillRect(x, y, 150 + x, 100 + y);
ctx.font = "30px Courier";
ctx.fillStyle = "white"; // Set text color

ctx.fillText("Project Litr", 50, 175);


// Browser requires user interaction before Web Audio plays
window.addEventListener('click', () => startArpeggiator(), { once: true });
window.addEventListener('keydown', () => startArpeggiator(), { once: true });

// Trigger preset sounds on keypress:
window.addEventListener('keydown', (e) => {
  // 1. Explosion (Low frequency, long duration)
  if (e.key === '1') {
    playNoise({ duration: 0.5, frequency: 0.2, pitchSweep: -0.15, volume: 0.3 });
  }

  // 2. Hi-Hat / Snare (High pitch, very short)
  if (e.key === '2') {
    playNoise({ duration: 0.08, frequency: 2.2, volume: 0.15 });
  }

  // 3. Laser / Zap (High pitch with fast downward sweep)
  if (e.key === '3') {
    playNoise({ duration: 0.15, frequency: 1.8, pitchSweep: -1.4, volume: 0.2 });
  }
  
  if (e.key == '4') {
    playNoise({ duration: 2.0, frequency: 1.0, pitchSweep: -20, volume: 0.4});
  }

});
