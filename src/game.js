export class Game {

  constructor(){
    this.scene = Null //expects a scene. We will then call scene.update and scene.draw
    this.player = Null //should make a player here
  }

  update(){
    this.scene.update()
    //other always update stuff 
  }

  draw(){
    this.scene.draw()
  }
}
