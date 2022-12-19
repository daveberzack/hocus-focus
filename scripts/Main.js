import Game from "./Game.js";

import { showView, testerId, setTester } from "./utils.js";
import { getNextChallenge, sendAnalytics, logPageView, resetData } from "./data.js";
if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js");
}

const game = new Game();
let challengeId = "error";

const init = async () => {
  initUI();
  setTester();
  showView("game");
  logPageView();
  reset();
  initModal();
};

const initModal = () => {
  $("#global-modal button").click( ()=> { $("#global-modal").hide(); });

  console.log("init", navigator.userAgent);
  if (navigator.userAgent.indexOf("Firefox")>=0) {
    $("#global-modal h2").html("Firefox, huh?");
    $("#global-modal p").html("Sorry. This game doesn't work reliably in Firefox.<br/>You can give it a shot. If things don't go so well, maybe try another browser.<br/>Sorry.");
    $("#global-modal button").html("OK.");
    $("#global-modal").css("display","flex");
  }

}

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
  });

  $("#before-button").click(() => {
    if (nextBeforeMessage < challenge.beforeMessages.length){
      showBeforeMessage();
    }
    else {
      showView("game");
    }
    
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

let challenge;
let nextBeforeMessage;
const reset = async () => {
  
  const winW = $(window).width();
  const winH = $(window).height();
  const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
  const isLandscape = winW>winH;
  if (isMobile && isLandscape) $("body").addClass("landscape");
  else $("body").removeClass("landscape");

  $("#stars").hide();
  const canvasWidth = setSize(winW, winH);

  showView("loading");
  challenge = await getNextChallenge();
  nextBeforeMessage=0;

  if (challenge._id == "played") {
    $("#played").css("display", "flex");
    $("#timer").hide();
    showView("game");
    $("#win-content").hide();
  } else {
    if (challenge.beforeMessages?.length>0) {
      showBeforeMessage();
    }
    else {
      showView("game");
    }
    $("#intro").css("display", "flex");
    game.init(challenge, canvasWidth);
    if (challenge._id == "error") {
      $("#timer, #start-button").hide();
    }
  }
};

function showBeforeMessage() {
  $("#before-message .title").show().html(challenge.beforeMessages[nextBeforeMessage].title);
  $("#before-message .content").show().html(challenge.beforeMessages[nextBeforeMessage].body);
  $("#before-message button").show().html(challenge.beforeMessages[nextBeforeMessage].button);
  const imageUrl = challenge.beforeMessages[nextBeforeMessage]?.backgroundImageUrl;
  if (imageUrl) $("#before-message").css("background-image", "url(" + imageUrl + ")");
  else $("#before-message").css("background-image", "none");
  showView("before-message");
  nextBeforeMessage++;
}

function setSize(winW, winH) {
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
  else $("body").removeClass("small");

  return w - 8;
}

init();

let resizeTimeout;
$( window ).resize(function() {
  clearInterval(resizeTimeout);
  resizeTimeout = setTimeout(reset, 500);
});