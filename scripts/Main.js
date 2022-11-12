import Game from "./Game.js";

import { showView, getGameResults, getTodayString, getParameter, sendAnalytics, getTestChallenge, isTouchDevice, logPageView, resetData } from "./utils.js";

if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js");
}

const game = new Game();
let testerId = null;
let challengeId = "error";
let hasPlayedToday = false;
let hasCompletedTutorials = false;

const init = async () => {
  challengeId = getTodayString();
  const results = await getGameResults();

  initUI();

  //if tester param provided, then set id to the next unplayed challenge from the specified set
  testerId = getParameter("tester");
  if (testerId) {
    challengeId = (await getTestChallenge()) || challengeId;
  }

  let tutorialsCompleted = 0;
  results.forEach((r) => {
    if (r.id.indexOf("tutorial") >= 0) tutorialsCompleted++;
  });
  if (tutorialsCompleted >= 3) hasCompletedTutorials = true;
  if (!hasCompletedTutorials) {
    if (isTouchDevice()) challengeId = "tutorial0_mobile";
    else challengeId = "tutorial0";
  }

  results.forEach((r) => {
    if (r.id == challengeId) hasPlayedToday = true;
  });

  showView("game");
  logPageView();
  reset(challengeId);
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
    reset($(this).attr("data-next"));
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
    const ch = (await getTestChallenge()) || getTodayString();
    reset(ch);
  });
};

const reset = async (challengeId) => {
  if (challengeId == "TODAY") {
    hasCompletedTutorials = true;
    hasPlayedToday = false;
    challengeId = getTodayString();
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

  todayChallenge.imgFile = `./challenges/${challengeId}/img.jpg`;
  todayChallenge.hitFile = `./challenges/${challengeId}/hit.jpg`;
  todayChallenge.id = challengeId;

  const canvasWidth = setSize();
  if (!hasCompletedTutorials && todayChallenge.beforeTitle && todayChallenge.beforeMessage) {
    showBeforeMessage(todayChallenge);
    $("#intro").css("display", "flex");
  } else if (hasPlayedToday) {
    $("#played").css("display", "flex");
  } else {
    $("#intro").css("display", "flex");
  }
  $("#stars").hide();

  game.init(todayChallenge, canvasWidth, testerId);
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
  $("#before-message").css({ "min-height": w - 8, "max-height": winH - 120 });
  $("#tester-form").css({ "max-height": winH - 110 });

  if (w < 360) $("body").addClass("small");
  return w - 8;
}

init();