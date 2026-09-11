export default class Game {

  constructor(canvas, ctx, keys){
    this.scene = null //expects a scene. We will then call scene.update and scene.draw
    this.player = null //should make a player here
    this.canvas = canvas;
    this.ctx = ctx;
    this.keys = keys;
  }

  update(){
    if (!this.scene){
      console.log("no scene selected!") //or do default stuff
      return;
    }
      this.scene.update()
  }

  draw(){
    if (!this.scene){
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.scene.draw(this.ctx, this.keys);
    }

  destroy(){
    this.scene = null;
  }
}
