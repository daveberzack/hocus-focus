import Game from "./Game.js";

import { showView, getGameResults } from "./utils.js";

const init = async () => {
  const queryString = window.location.search;
  const rand = Math.floor(Math.random() * 7);
  const chId = queryString.substring(1) || rand;
  const challengeIds = ["20220814", "20220815", "20220816", "20220817", "20220818", "20220819", "20220820"];
  const challengeId = challengeIds[chId]; //getTodayString();
  const response = await fetch(`./challenges/${challengeId}/data.json`);
  let todayChallenge = await response.json();
  todayChallenge.imgFile = `./challenges/${challengeId}/img.jpg`;
  todayChallenge.hitFile = `./challenges/${challengeId}/hit.jpg`;
  todayChallenge.id = challengeId;
  const game = new Game();

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

  const results = await getGameResults();
  if (results.length > 0) {
    showView("game");
  } else {
    showView("instructions");
  }

  const canvasWidth = setSize();
  game.init(todayChallenge, canvasWidth);
};

function setSize() {
  const winW = $(window).width();
  const winH = $(window).height();
  const w = Math.min(winW - 20, winH - 350);
  $(".view").width(w);
  $("#board")
    .width(w - 8)
    .height(w - 8);

  const statsH = Math.max(400, w);
  $("#stats-graph-block")
    .width(w - 8)
    .height(statsH - 8);
  $("#stats-graph")
    .width(w - 120)
    .height(statsH - 90);
  $("#board canvas")
    .width(w - 8)
    .height(w - 8)
    .prop("width", w - 8)
    .prop("height", w - 8);

  $("footer p").width(w);

  return w - 8;
}

init();
