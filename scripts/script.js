import Game from "./Game.js";

import { showView, getGameResults, getTodayString, getParameter } from "./utils.js";

const init = async () => {
  if (navigator && navigator.serviceWorker) {
    navigator.serviceWorker.register("../sw.js");
  }

  const results = await getGameResults();

  let challengeId = getTodayString();
  challengeId = "20221022";

  //if tester param provided, then set id to the next unplayed challenge from the specified set
  const testerId = getParameter("tester");
  if (testerId) {
    const newChallenges = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015", "016", "017"];
    let newIndex = 0;
    let alreadyPlayed = false;
    do {
      challengeId = newChallenges[newIndex];
      alreadyPlayed = results.find((r) => r.id == challengeId);
      newIndex++;
    } while (alreadyPlayed);
  }

  let todayChallenge;
  try {
    const response = await fetch(`./challenges/${challengeId}/data.json`);
    todayChallenge = await response.json();
  } catch {
    challengeId = "error";
    todayChallenge = {
      clue: "Error loading",
      credit: "",
      url: "#",
      goals: [],
    };
  }
  console.log(todayChallenge);

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
  game.init(todayChallenge, canvasWidth, testerId);
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
