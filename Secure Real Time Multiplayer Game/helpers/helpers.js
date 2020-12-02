const playersList = [];

function playerJoin(player) {
  playersList.push(player);
  return player;
}

function setPlayerState({ x, y, id, dir, score }) {
  const player = playersList.find((p) => p.id === id);
  player.x = x;
  player.y = y;
  player.dir = dir;
  player.score = score;
  return player;
}

function playerLeave(id) {
  const playerIndex = playersList.findIndex((player) => player.id === id);
  return playersList.splice(playerIndex, 1)[0];
}

function getPlayers() {
  return playersList;
}

function positionPlayer() {
  let x = 640 / 2;
  let y = 480 / 2;
  return [x,y]
}

function positionCollectible(){
  let monsterx = 32 + (Math.random() * (640 - 64));
  let monstery = 32 + (Math.random() * (480 - 64));
  return [monsterx, monstery]
}

module.exports = {
  positionCollectible,
  positionPlayer,
  playerJoin,
  setPlayerState,
  playerLeave,
  getPlayers,
};