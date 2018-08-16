"use strict";

class GameClient {

  constructor({ canvasEl, eventHandler }) {
    this.canvasEl = canvasEl;
    this.eventHandler = eventHandler;

    this.gameData = {
      duration: 0,
      stoneList: [],
      own: {
        droneList: [],
        stoneReserve: 0,
        mothershipHealth: 0
      },
      opponent: {
        droneList: [],
        stoneReserve: 0,
        mothershipHealth: 0
      }
    }

  }

  startMatchmaking() {
    this.eventHandler('message', { message: 'Waiting for opponent...' });
    socket = io({ upgrade: false, transports: ["websocket"] });

    // socket.on("start", () => {
    //   enableButtons();
    //   setMessage("Round " + (points.win + points.lose + points.draw + 1));
    // });

    // socket.on("win", () => {
    //   points.win++;
    //   displayScore("You win!");
    // });

    // socket.on("lose", () => {
    //   points.lose++;
    //   displayScore("You lose!");
    // });

    // socket.on("draw", () => {
    //   points.draw++;
    //   displayScore("Draw!");
    // });

    // socket.on("end", () => {
    //   disableButtons();
    //   setMessage("Waiting for opponent...");
    // });

    socket.on("connect", () => {
      disableButtons();
      setMessage("Waiting for opponent...");
    });

    socket.on("disconnect", () => {
      disableButtons();
      setMessage("Connection lost!");
    });

    socket.on("error", () => {
      disableButtons();
      setMessage("Connection error!");
    });
  }


}





window.addEventListener("load", () => {
  document.querySelector('#playButton').addEventListener('click', () => {
    document.querySelector('#intro').style.display = 'none';
    let gameClient = new GameClient({
      canvasEl: document.querySelector('#canvas'),
      eventHandler: (event, data = {}) => {
        if (event === 'message') {
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
          document.querySelector('#message-box').style.display = 'none';
          document.querySelector('#canvas').style.display = 'block';
        }
      }
    });
  });
});




















// (function () {

//   let socket, //Socket.IO client
//     buttons, //Button elements
//     message, //Message element
//     score, //Score element
//     points = { //Game points
//       draw: 0,
//       win: 0,
//       lose: 0
//     };

//   /**
//    * Disable all button
//    */
//   function disableButtons() {
//     for (let i = 0; i < buttons.length; i++) {
//       buttons[i].setAttribute("disabled", "disabled");
//     }
//   }

//   /**
//    * Enable all button
//    */
//   function enableButtons() {
//     for (let i = 0; i < buttons.length; i++) {
//       buttons[i].removeAttribute("disabled");
//     }
//   }

//   /**
//    * Set message text
//    * @param {string} text
//    */
//   function setMessage(text) {
//     message.innerHTML = text;
//   }

//   /**
//    * Set score text
//    * @param {string} text
//    */
//   function displayScore(text) {
//     score.innerHTML = [
//       "<h2>" + text + "</h2>",
//       "Won: " + points.win,
//       "Lost: " + points.lose,
//       "Draw: " + points.draw
//     ].join("<br>");
//   }

//   /**
//    * Binde Socket.IO and button events
//    */
//   function bind() {

//     socket.on("start", () => {
//       enableButtons();
//       setMessage("Round " + (points.win + points.lose + points.draw + 1));
//     });

//     socket.on("win", () => {
//       points.win++;
//       displayScore("You win!");
//     });

//     socket.on("lose", () => {
//       points.lose++;
//       displayScore("You lose!");
//     });

//     socket.on("draw", () => {
//       points.draw++;
//       displayScore("Draw!");
//     });

//     socket.on("end", () => {
//       disableButtons();
//       setMessage("Waiting for opponent...");
//     });

//     socket.on("connect", () => {
//       disableButtons();
//       setMessage("Waiting for opponent...");
//     });

//     socket.on("disconnect", () => {
//       disableButtons();
//       setMessage("Connection lost!");
//     });

//     socket.on("error", () => {
//       disableButtons();
//       setMessage("Connection error!");
//     });

//     for (let i = 0; i < buttons.length; i++) {
//       ((button, guess) => {
//         button.addEventListener("click", function (e) {
//           disableButtons();
//           socket.emit("guess", guess);
//         }, false);
//       })(buttons[i], i + 1);
//     }
//   }

//   /**
//    * Client module init
//    */
//   function init() {
//     socket = io({ upgrade: false, transports: ["websocket"] });
//     buttons = document.getElementsByTagName("button");
//     message = document.getElementById("message");
//     score = document.getElementById("score");
//     disableButtons();
//     bind();
//   }

//   window.addEventListener("load", init, false);

// })();
