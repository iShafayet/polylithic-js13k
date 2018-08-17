"use strict";

class GameClient {

  constructor({ canvasEl, eventHandler }) {
    this.canvasEl = canvasEl;
    this.eventHandler = eventHandler;
    this.isGameRunning = false;
    this.socket = null;
    this.gameData = null;
    this.joinMatchmaking();
  }

  joinMatchmaking() {
    this.eventHandler('message', { message: 'Waiting for opponent...' });
    let socket = this.socket = io({ upgrade: false, transports: ["websocket"], reconnection: false });

    socket.on("disconnect", () => {
      this.isGameRunning = false;
      this.eventHandler('message', { message: 'DISCONNECT! <br><br> You forfeited the game.', level: 'error' });
    });

    socket.on("error", (err) => {
      this.isGameRunning = false;
      this.eventHandler('message', { message: 'ERROR! <br><br> You forfeited the game.', level: 'error' });
    });

    socket.on("connect", () => {
      'pass';
    });

    socket.on("game-data", (data) => {
      console.log("game-data", data)
      if (!this.isGameRunning) {
        this.isGameRunning = true;
        this.eventHandler('game-start');
      }
      this.gameData = data;
      this.prepareCanvas();
      this.draw();
    });
  }

  prepareCanvas() {
    this.ctx = this.canvasEl.getContext('2d');
    this.canvasWidth = this.canvasEl.width;
    this.canvasHeight = this.canvasEl.height;
  }

  drawBackdrop() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  drawMothership(which) {
    let { health, x, y, r } = this.gameData[which].mothership;
    if (which === 'own') {
      this.ctx.strokeStyle = 'blue';
      this.ctx.fillStyle = 'blue';
    } else {
      this.ctx.strokeStyle = 'red';
      this.ctx.fillStyle = 'red';
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    this.ctx.stroke();
    this.ctx.fill();
  }

  draw() {
    this.drawBackdrop();
    this.drawMothership('own');
    this.drawMothership('opponent');
  }

}

window.addEventListener("load", () => {
  document.querySelector('#playButton').addEventListener('click', () => {
    document.querySelector('#intro').style.display = 'none';
    let gameClient = new GameClient({
      canvasEl: document.querySelector('#canvas'),
      eventHandler: (event, data = {}) => {
        if (event === 'message') {
          document.querySelector('#menu').style.display = 'flex';
          document.querySelector('#message-box').style.display = 'block';
          document.querySelector('#canvas').style.display = 'none';
          let { message, level = 'info' } = data;
          let color = {
            'info': 'blue',
            'error': 'red'
          }[level];
          document.querySelector('#message').style.color = color;
          document.querySelector('#message').innerHTML = message;
        } else if (event === 'game-start') {
          document.querySelector('#menu').style.display = 'none';
          document.querySelector('#canvas').style.display = 'block';
        }
      }
    });
  });
  document.querySelector('#playButton').click();
});
