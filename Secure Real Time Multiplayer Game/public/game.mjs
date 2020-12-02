import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

import {canv} from './canv.mjs'
let playerImg = new Image();
let collectibleImg = new Image();
let background = new Image();

let currentPlayers = [];
let player;
let currentCollectible;
let rank = "";

socket.on('init',({players})=>{  
  background.src = 'public/utils/background.png';
  playerImg.src = 'public/utils/hero.png';
  collectibleImg.src = 'public/utils/monster.png';
  player = new Player(players);
  currentPlayers.push(player);   
});

socket.on('collectible', collectible => {
  if (currentCollectible != undefined) {
    currentCollectible.setState(collectible);
  }
  else {
    currentCollectible = new Collectible(collectible);
  }
});

socket.on('score', playerupdate =>{
  player.score = playerupdate.score;
  rank = player.calculateRank(currentPlayers);
});

socket.on('update', player =>{
  rank = player.calculateRank(currentPlayers);
});

socket.on('playerleave', id =>{
  currentPlayers.slice(currentPlayers.indexOf(id), 1);
  rank = player.calculateRank(currentPlayers);
});

document.onkeydown = e => {
  let  dir = null
  switch(e.keyCode) {
    case 87:
    case 38:
       dir = 'up';
       break;
    case 83:
    case 40:
       dir = 'down';
       break;
    case 65:
    case 37:
       dir = 'left';
       break;
    case 68:
    case 39:
       dir = 'right';
       break;   
  }
  if (dir) {
    player.movePlayer(dir, player.speed);
    socket.emit('playerState', player);
  }
}

function anim () {
  context.clearRect(0, 0, canv.width, canv.height);
  context.drawImage(background, 0, 0, canv.width, canv.height);
  if(player) {
    player.draw(context, playerImg);
  }
  if(currentCollectible){
    currentCollectible.draw(context, collectibleImg)
  }
 
  // Game control
  context.fillStyle = '#ffffff';
  context.font = `13px 'Press Start 2P'`;
  context.textAlign = 'start';
  context.fillText("Controls:AWSD", 20, 20);

  // Game title
  context.font = `15px 'Press Start 2P'`;
  context.textAlign = 'center';
  context.fillText("Kill the Monster", canv.width/2, 20);

  // Player's rank
  context.font = `13px 'Press Start 2P'`;
  context.textAlign = 'end';
  context.fillText(rank, canv.width - 19, 20);
  // Player score
  if(player) {
    context.font = `13px 'Press Start 2P'`;
    context.fillText('Score:' + player.score, 120, canv.height - 20);
  }
  

  if (player && currentCollectible) {
    if (player.collision(currentCollectible)) {
      socket.emit('collision', player);
    }
  }

  requestAnimationFrame(anim);
}

requestAnimationFrame(anim);