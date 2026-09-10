// Quick demo of how to pass a new update function into the Game Class
class Scene {
  constructor(update) {
  this.update = update}
}

class Game{
  constructor(scene=null){
    this.scene = scene
  }


  update(){
    if (this.scene != null) {
      this.scene.update()
    } else {
    console.log("no scene yet")
    }
  }  
}

const updateI = () => {
  console.log("scene 1");
}

function updateII() {
  console.log("scene 2 now, we passed a function!!!");
}

scene_1 = new Scene(updateI)
scene_2 = new Scene(updateII)

function main(){
// just change the scene so that we can pass in new update functions to the Game instance.
  game = new Game();
  game.update();
  game.scene = scene_1;
  game.update()
  game.scene = scene_2;
  game.update()
}

main()
