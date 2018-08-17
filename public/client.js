"use strict";

const COLOR_OWN_MOTHERSHIP_FILL = '#009688';
const COLOR_OPPONENT_MOTHERSHIP_FILL = '#FF5722';

const COLOR_OWN_DRONE_FILL = '#00BFA5';
const COLOR_OPPONENT_DRONE_FILL = '#DD2C00';

class GameClient {

  constructor({ canvasEl, eventHandler }) {
    this.canvasEl = canvasEl;
    this.eventHandler = eventHandler;
    this.isGameRunning = false;
    this.socket = null;
    this.gameData = null;
    this.fps = 0;
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
      // console.log("game-data", data)
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

  drawMothership(whose) {
    let { health, x, y, r } = this.gameData[whose].mothership;
    if (whose === 'own') {
      this.ctx.fillStyle = COLOR_OWN_MOTHERSHIP_FILL;
    } else {
      this.ctx.fillStyle = COLOR_OPPONENT_MOTHERSHIP_FILL;
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    this.ctx.fill();

    let healthX = (x === 0 ? x + r : x - r);
    let healthY = y - r;
    this.drawHealth(healthX, healthY, health, MOTHERSHIP_MAX_HEALTH);
  }

  drawHealth(x, y, value, max) {
    let factor = value / max;
    let height = 20;
    let width = 4;
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(x, y, width, (height * factor));
  }

  drawDrone(drone, whose) {
    let { x, y, r, carryingStone, pathList, id } = drone;
    this.ctx.fillStyle = (whose === 'own' ? COLOR_OWN_DRONE_FILL : COLOR_OPPONENT_DRONE_FILL);
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    this.ctx.fill();
    if (whose === 'own') {
      if (pathList.length > 0) {
        let { x2, y2 } = pathList[0];
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, r, 0, 2 * Math.PI, false);
        this.ctx.stroke();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }
  }

  drawStone(stone) {
    let { x, y, r } = stone;
    this.ctx.fillStyle = 'yellow';

    let width = r;
    let height = r;

    this.ctx.beginPath();
    this.ctx.moveTo(x + width * 0.5, y);
    this.ctx.lineTo(x, y + height * 0.5);
    this.ctx.lineTo(x + width * 0.5, y + height);
    this.ctx.lineTo(x + width, y + height * 0.5);
    this.ctx.lineTo(x + width * 0.5, y);
    this.ctx.closePath();

    // this.ctx.beginPath();
    // this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    // this.ctx.stroke();
    this.ctx.fill();

  }

  updateFps() {
    if (!this.__fps__time) this.__fps__time = Date.now();
    if (Date.now() - this.__fps__time > 1000) {
      document.getElementById('fps').innerHTML = '' + this.fps;
      this.__fps__time = Date.now();
      this.fps = 0;
    }
    this.fps += 1;
  }

  draw() {
    // requestAnimationFrame(() => {
    this.drawBackdrop();
    this.drawMothership('own');
    this.drawMothership('opponent');
    this.gameData.own.droneList.forEach(drone => this.drawDrone(drone, 'own'));
    this.gameData.opponent.droneList.forEach(drone => this.drawDrone(drone, 'opponent'));
    this.gameData.stoneList.forEach(stone => this.drawStone(stone));
    this.updateFps();
    // });
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
