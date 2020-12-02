import {canv} from './canv.mjs'

class Collectible {
  constructor({x, y, value = 10, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
  }

  setState({ x, y, value = 10, id }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
  }

  draw(context, image){
    context.drawImage(image, this.x, this.y, canv.monster.width, canv.monster.height);
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
