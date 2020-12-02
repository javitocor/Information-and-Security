import {canv} from './canv.mjs'

class Player {
  constructor({x, y, score = 0, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.speed = 5;
    this.dir = null;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y = this.y - speed >= 0 ? this.y - speed : 0;
        break;
      case 'down':
        this.y =
          this.y + speed <= canv.height - canv.hero.height
            ? this.y + speed
            : canv.height - canv.hero.height;
        break;
      case 'right':
        this.x =
          this.x + speed <= canv.width - canv.hero.width
            ? this.x + speed
            : canv.width - canv.hero.width;
        break;
      case 'left':
        this.x = this.x - speed >= 0 ? this.x - speed : 0;
      default:
        this.x = this.x;
        this.y = this.y;
    }
  }

  draw(context, image){
    context.drawImage(image, this.x, this.y, canv.hero.width, canv.hero.height);
  }

  collision(item) {
    if (this.x <= (item.x + canv.monster.width)
    && item.x <= (this.x + canv.monster.width)
    && this.y <= (item.y + canv.monster.height)
    && item.y <= (this.y + canv.monster.height)) {
      return true;
    }
    return false;
  }

  calculateRank(players) {
    const numOfPlayers = players.length;
    let rank;

    if (this.score === 0) {
      rank = numOfPlayers;
    } else {
      const sortedPlayers = players.sort(
        (playerA, playerB) => playerB.score - playerA.score
      );
      rank = sortedPlayers.findIndex((player) => player.id === this.id) + 1;
    }
    return `Rank: ${rank} / ${numOfPlayers}`;
  }
}


try {
  module.exports = Player;
} catch(e) {}

export default Player;
