import Game from "./Game.js";

import { showView, getGameResults, getTodayString } from "./utils.js";

const init = async () => {
  const results = await getGameResults();

  let challengeId = getTodayString();

  const testing = true;
  if (testing) {
    const newChallenges = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013"];
    let newIndex = 0;
    let alreadyPlayed = false;
    do {
      challengeId = "new/" + newChallenges[newIndex];
      alreadyPlayed = results.find((r) => r.id == challengeId);
      newIndex++;
    } while (alreadyPlayed);
  }

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
