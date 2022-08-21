import Game from "./Game.js";

import { showView, getGameResults } from "./utils.js";

const init = async () => {
  const challengeId = "20220816"; //getTodayString();
  const response = await fetch(`./challenges/${challengeId}/data.json`);
  let todayChallenge = await response.json();
  todayChallenge.imgFile = `./challenges/${challengeId}/img.jpg`;
  todayChallenge.hitFile = `./challenges/${challengeId}/hit.jpg`;
  todayChallenge.id = challengeId;
  const game = new Game();
  game.init(todayChallenge);

  $(".instructions-button").click(() => {
    showView("instructions");
  });
  $(".game-button").click(() => {
    showView("game");
  });

  $("#start-button").click(() => {
    game.startGame();
    $("#intro").hide();
  });

  if (getGameResults().length > 0) {
    showView("game");
  } else {
    showView("instructions");
  }

  setSize();
};

function setSize() {
  const winW = $(window).width();
  const winH = $(window).height();
  const w = Math.min(winW - 20, winH - 350);
  $(".view").width(w);
  $("#board").width(w - 8);
  $("#board").height(w - 8);

  $("footer p").width(w);
}

init();
