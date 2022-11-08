import Game from "./Game.js";

import { showView, getGameResults, getTodayString, getParameter, sendAnalytics, getTestChallenge, isTouchDevice } from "./utils.js";

if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js");
}

const game = new Game();
let testerId = null;
let challengeId = "error";
let hasPlayedToday = false;
let hasPlayedAtAll = false;

const init = async () => {
  challengeId = getTodayString();
  const results = await getGameResults();

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
    $("#before-message").hide();
    $("#intro").css("display", "flex");
  });
  $("#after-button").click(function () {
    $("#after-message").hide();
    reset($(this).attr("data-next"));
  });

  $("#form-button").click(async () => {
    const data = {
      challengeId: challengeId,
      name: testerId,
      isFun: $("input:radio[name ='fun']:checked").val(),
      isFair: $("input:radio[name ='fair']:checked").val(),
      shouldPublish: $("input:radio[name ='publish']:checked").val(),
    };

    sendAnalytics("hocusfeedback", data);
    $("#tester-form").hide();
    const ch = (await getTestChallenge()) || getTodayString();
    reset(ch);
  });

  //if tester param provided, then set id to the next unplayed challenge from the specified set
  testerId = getParameter("tester");
  if (testerId) {
    challengeId = (await getTestChallenge()) || challengeId;
  }

  if (results.length >= 3) hasPlayedAtAll = true;
  if (!hasPlayedAtAll) {
    if (isTouchDevice()) challengeId = "tutorial0_mobile";
    else challengeId = "tutorial0";
  }

  results.forEach((r) => {
    if (r.id == challengeId) hasPlayedToday = true;
  });

  reset(challengeId);
  showView("game");
};

const reset = async (challengeId) => {
  if (challengeId == "TODAY") {
    hasPlayedAtAll = true;
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

  if (!hasPlayedAtAll) {
    showBeforeMessage(todayChallenge);
  } else if (hasPlayedToday) {
    $("#played").css("display", "flex");
  } else {
    $("#intro").css("display", "flex");
  }
  $("#stars").hide();

  game.init(todayChallenge, canvasWidth, testerId);
};

function showBeforeMessage(challenge) {
  $("#before-message .title")
    .toggle(challenge.beforeTitle?.length > 0)
    .text(challenge.beforeTitle);
  $("#before-message .content")
    .toggle(challenge.beforeMessage?.length > 0)
    .html(challenge.beforeMessage);
  $("#before-button")
    .toggle(challenge.beforeButton?.length > 0)
    .text(challenge.beforeButton);
  $("#before-message").css("display", "flex");
}

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

  if (w < 360) $(".message-board, header").addClass("small");
  return w - 8;
}

init();
