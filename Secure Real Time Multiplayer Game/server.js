require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require("helmet")

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }))
app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.noCache())
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const {
  playerJoin,
  getPlayers,
  playerLeave,
  setPlayerState,
  positionPlayer,
  positionCollectible
} = require('./helpers/helpers');
const Player = require('./public/Player');
const Collectible = require('./public/Collectible');
let connections = [];
let playerUpdate;
let collectible;



const io = socket(server);
io.on('connection', function(socket){
    console.log("New client has connected with id:",socket.id);
    connections.push(socket);
    console.log('Connected: %s sockets connected.',connections.length);
    const position = positionPlayer();
    let positionX = position[0];
    let positionY = position[1];
    let player = new Player({x:positionX,y:positionY,score:0,id:socket.id});
    collectible = new Collectible({x: positionCollectible()[0], y: positionCollectible()[1], id: new Date() });
    playerJoin(player);
    socket.emit('init', {players: player});
    socket.emit('collectible', collectible); 

    socket.on('collision', player =>{
      player.score += collectible.value;
      socket.emit('score', player);
      playerUpdate = setPlayerState(player);
      socket.broadcast.emit('update', playerUpdate);
      collectible = new Collectible({x: positionCollectible()[0], y: positionCollectible()[1], id: new Date()});
      socket.emit('collectible', collectible);
    });

    socket.on('playerState', player =>{
      playerUpdate = setPlayerState(player);
      socket.broadcast.emit('update', playerUpdate);
    });
    
    socket.on('disconnect', () => {
      console.log(`disconnection ${socket.id}`);
      playerLeave(socket.id);  
      socket.broadcast.emit('playerleave', socket.id);    
      connections.splice(connections.indexOf(socket), 1);
      console.log('Disconnected: %s sockets connected.', connections.length);
    });
});

module.exports = app; 
