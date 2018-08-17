"use strict";

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

class Game {

  constructor({ player1, player2, eventHandler }) {
    this.player1 = player1;
    this.player2 = player2;
    this.eventHandler = eventHandler;
    this.data = null;
    this.isOngoing = false;
  }

  start() {
    this.data = {
      startDatetimeStamp: Date.now(),
      stoneList: [],
      player1: {
        droneList: [],
        stoneReserve: 20,
        mothership: {
          health: 1000,
          x: 0,
          y: GAME_HEIGHT / 2,
          r: 50
        }
      },
      player2: {
        droneList: [],
        stoneReserve: 20,
        mothership: {
          health: 1000,
          x: GAME_WIDTH,
          y: GAME_HEIGHT / 2,
          r: 50
        }
      }
    };
    this.isOngoing = true;
    this.loop();
  }

  spawnDrone(player) {

  }

  publishGameData() {
    let { player1, player2, stoneList, startDatetimeStamp } = this.data;
    let duration = Date.now() - startDatetimeStamp;
    let data = {
      duration,
      stoneList,
      player1,
      player2
    };
    this.eventHandler('game-data', [this.player1, this.player2], data);
  }

  loop() {
    if (!this.isOngoing) return;
    this.publishGameData();
  }

  forfeit(player, reason) {

  }

}






















let pendingPlayer = null;

module.exports = {

  io: (socket) => {
    console.log(`${socket.id} - Connected.`);

    socket.once('disconnect', () => {
      console.log(`${socket.id} - Disconnected.`);
      socket.removeAllListeners();
      if (pendingPlayer && (socket.id === pendingPlayer.id)) {
        console.log(`${socket.id} - Leaves after waiting.`);
        pendingPlayer = null;
      } else if (!socket.game) {
        console.log(`${socket.id} - Leaves before joining a game or waiting.`);
      } else if (socket.game.isOngoing) {
        console.log(`${socket.id} - Forfeits.`);
        socket.game.forfeit(socket.playerIs, 'disconnect');
      } else {
        console.log(`${socket.id} - Leaves as winner.`);
      }
    });

    if (!pendingPlayer) {
      pendingPlayer = socket;
      console.log(`${socket.id} - Waiting.`);
      return;
    }

    console.log('New game:', socket.id, 'vs', pendingPlayer.id);

    let playerList = [socket, pendingPlayer];
    pendingPlayer = null;

    let game = new Game({
      playerList,
      eventHandler: (event, playerList, data) => {
        console.log(event, playerList, data);
        // if (event === 'game-data') {
        //   playerList.forEach(player => {
        //     let clone = JSON.parse(JSON.stringify(data));
        //     if (player === player1) {
        //       clone.own = clone['player1'];
        //       clone.opponent = clone['player2'];
        //       clone.own.is = 'player1';
        //       clone.opponent.is = 'player2';
        //     } else {
        //       clone.own = clone['player2'];
        //       clone.opponent = clone['player1'];
        //       clone.own.is = 'player2';
        //       clone.opponent.is = 'player1';
        //     }
        //     delete clone['player1'];
        //     delete clone['player2'];
        //     player.socket.emit("game-data", clone);
        //   });
        // }
      }
    });

    playerList.forEach((player, playerNumber) => {
      player.game = game;

    });

  }

};