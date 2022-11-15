import Game from "./Game.js";

import { showView, getGameResults, getTodayString, getParameter, sendAnalytics, getTestChallenge, isTouchDevice, logPageView, resetData } from "./utils.js";

if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js");
}

const game = new Game();
let testerId = null;
let challengeId = "error";

const init = async () => {
  //challengeId = getTodayString();

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

const getNextChallengeId = async () => {
  const r = await getGameResults();

  //return the first uncompleted tutorial
  const foundTutorial = r.find((e) => e.id == "tutorial2") || r.find((e) => e.id == "tutorial1") || r.find((e) => e.id.includes("tutorial0"));
  if (!foundTutorial) {
    console.log("not found", r);
    if (isTouchDevice()) return "tutorial0_mobile";
    else return "tutorial0";
  } else if (foundTutorial.id == "tutorial1") return "tutorial2";
  else if (foundTutorial.id.includes("tutorial0")) return "tutorial1";

  //if tester, return the first uncompleted test
  if (testerId) {
    const testChallenge = await getTestChallenge();
    if (testChallenge) return testChallenge;
    else testerId = null;
  }
  //else return today's challenge or "played" if already played
  const todayString = getTodayString();
  const foundToday = r.find((e) => e.id == todayString);
  if (!foundToday) return todayString;
  else return "played";
};

const getChallengeById = async (challengeId) => {
  if (challengeId == "played") return null;
  let challenge = {};
  try {
    const response = await fetch(`./challenges/${challengeId}/data.json`);
    challenge = await response.json();
  } catch {
    challengeId = "error";
    challenge = {
      id: challengeId,
      clue: "Error loading",
      credit: "",
      url: "#",
      goals: [],
    };
  }

  challenge.nextChallenge = challengeId.includes("tutorial") || !!testerId;
  challenge.imgFile = `./challenges/${challengeId}/img.jpg`;
  challenge.hitFile = `./challenges/${challengeId}/hit.jpg`;
  challenge.id = challengeId;
  return challenge;
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
