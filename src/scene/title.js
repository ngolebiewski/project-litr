// If extends game, then we should have access to the player without passing the player. 
// But is it weird to override udpate and draw? We want to just have a part be this scene,
// and the rest an always thing
// Should we have a Scene class? wpid make sense to extend that and share destroy()
export default class Title extends Game{
  update(){
  }

  draw(){
  }
}
