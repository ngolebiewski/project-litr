export default class Scene{

  constructor(name, init, update, draw) {
    this.name = name;
    this.init = init;
    this.update = update;
    this.draw = draw;
  }
}
