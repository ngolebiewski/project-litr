import Scene from './scene.js';
import { drawText } from './font.js';

function init(){
}

function update(){
}

function draw(ctx, keys){
  drawText(ctx, "1 2 3 4 5 6 7 8 9 0 :", 10, 30, 3, "#f00");
  drawText(ctx, "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?:", 10, 50, 2, "#0F0");
  drawText(ctx, "PROJECT LITR", 10, 140, 8, "#FFF");
  drawText(ctx, "1,2,3,4 to make noise!",10, 210,2);
  drawText(ctx, "Arrows to move the rainbow",10,230,2);

  if (keys.ArrowUp) {
    drawText(ctx, "Arrow Up",10,240,12,"#fa0");
    console.log("up")
  }
}

export default function Demo(){
  return new Scene("demo", init, update, draw);
}
