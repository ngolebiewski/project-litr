import Scene from './Scene.js';
import { drawText } from './font.js';

const width = 150;
const height = 100;

function init(){
  // load sprites or whatever
}

function update(game){
  const p = game.player
  const keys = game.keys
  const canvas = game.canvas
  
  if (keys.ArrowUp)    p.y -= p.speed;  
  if (keys.ArrowDown)  p.y += p.speed;
  if (keys.ArrowLeft)  p.x -= p.speed;
  if (keys.ArrowRight) p.x += p.speed;

  // Keep player within canvas boundaries
  p.x = Math.max(0, Math.min(canvas.width - width, p.x));
  p.y = Math.max(0, Math.min(canvas.height - height, p.y));

 }

function draw(ctx, keys, p){
  drawText(ctx, "1 2 3 4 5 6 7 8 9 0", 10, 30, 3, "#f00");
  drawText(ctx, "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?:", 10, 50, 2, "#0F0");
  drawText(ctx, "PROJECT LITR", 10, 140, 8, "#FFF");
  drawText(ctx, "1,2,3,4 to make noise!",10, 210,2);
  drawText(ctx, "Arrows to move the rainbow",10,230,2);

  if (keys.ArrowUp) {
    drawText(ctx, "Arrow Up",10,240,12,"#fa0");
  }

  const rainbow = ctx.createLinearGradient(p.x, 0, p.x + width, 0);

  // 2. Add standard rainbow color stops (0.0 to 1.0)
  const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

  colors.forEach((color, index) => {
    rainbow.addColorStop(index / (colors.length - 1), color);
  });

  // 3. Apply gradient and draw moving rectangle
  ctx.fillStyle = rainbow;
  ctx.fillRect(p.x, p.y, width, height);
}

export default function Demo(){
  return new Scene("demo", init, update, draw);
}
