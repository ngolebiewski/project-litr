import { drawText } from './font.js';
import Player from './Player.js';

export default class Game {
  constructor(canvas, ctx, keys){
    this.scene = null; //expects a scene. We will then call scene.update and scene.draw
    this.player = new Player();
    this.canvas = canvas;
    this.ctx = ctx;
    this.keys = keys;
  }

  update(){
    if (!this.scene){
      console.log("no scene selected!"); //or do default stuff
      drawText(this.ctx, "PROJECT LITR", 10, 140, 8, "#444");
      return;
    }
      this.scene._update(this);
  }

  draw(){
    if (!this.scene){
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.scene.draw(this.ctx, this.keys, this.player);
    }

  destroy(){
    this.scene = null;
  }
}
