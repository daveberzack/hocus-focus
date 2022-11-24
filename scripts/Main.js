import Game from "./Game.js";

import { showView, getParameter, sendAnalytics, logPageView, resetData } from "./utils.js";
import { getChallengeById, getNextChallengeId } from "./data.js";
if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js");
}

const game = new Game();
let testerId = null;
let challengeId = "error";

const init = async () => {
  initUI();

  //if tester param provided, then set id to the next unplayed challenge from the specified set
  testerId = getParameter("tester");

  showView("game");
  logPageView();
  reset();
};

const initUI = () => {
  $("#version").click(resetData);

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

  $("#before-button").click(() => {
    showView("game");
  });
  $("#after-button").click(function () {
    $("#after-message").hide();
    reset();
  });

  $("#give-up-button").click(() => {
    game.gaveUp = true;
    game.handleWin();
  });

  $("#form-button").click(async () => {
    const data = {
      challengeId: challengeId,
      tester: testerId,
      fun: $("input:radio[name ='fun']:checked").val(),
      difficulty: $("input:radio[name ='difficulty']:checked").val(),
      feedback: $("#feedback").val(),
    };

    sendAnalytics("hocusfeedback", data);
    $("#tester-form").hide();
  });
};

const reset = async () => {
  challengeId = await getNextChallengeId();

  const canvasWidth = setSize();

  $("#stars").hide();
  if (challengeId == "played") {
    $("#played").css("display", "flex");
    $("#timer").hide();
  } else {
    const challenge = await getChallengeById(challengeId);
    if (challenge.beforeTitle && challenge.beforeMessage) {
      showBeforeMessage(challenge);
    }
    $("#intro").css("display", "flex");
    game.init(challenge, canvasWidth, testerId);
    if (challenge.id == "error") $("#timer").hide();
  }
};

function showBeforeMessage(challenge) {
  $("#before-message .title").show().html(challenge.beforeTitle);
  $("#before-message .content").show().html(challenge.beforeMessage);
  showView("before-message");
}

function setSize() {
  const winW = $(window).width();
  const winH = $(window).height();
  const w = Math.min(winW - 20, winH - 240);
  $(".view").width(w);
  $("#board")
    .width(w - 8)
    .height(w - 8);

  const statsH = Math.max(400, w);
  $("#stats-graph")
    .width(w - 120)
    .height(statsH - 90);
  $("#stats-graph-block button").width(w - 120);

  $("#board canvas")
    .width(w - 8)
    .height(w - 8)
    .prop("width", w - 8)
    .prop("height", w - 8);

  $("footer p").width(w);
  $("#before-message").css({ "min-height": w - 8, "max-height": winH - 120 });
  $("#tester-form").css({ "max-height": winH - 110 });
  $("#instructions-block").css({ "max-height": winH - 130 });

  if (w < 360) $("body").addClass("small");
  return w - 8;
}

init();
