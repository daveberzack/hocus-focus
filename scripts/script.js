import Game from "./Game.js";
import { getTodayString } from "./utils.js";

const showView = (name) => {
  $(".view").removeClass("shown");
  $("#" + name).addClass("shown");
};

const init = async () => {
  const todayString = "20220817"; //getTodayString();
  const response = await fetch(`./challenges/${todayString}/data.json`);
  let todayChallenge = await response.json();
  todayChallenge.imgFile = `./challenges/${todayString}/img.jpg`;
  todayChallenge.hitFile = `./challenges/${todayString}/hit.jpg`;
  $("#credit").text(todayChallenge.credit).attr("href", todayChallenge.url);
  const game = new Game(todayChallenge);

  $("#instructions-button").click(() => {
    showView("instructions");
  });

  $("#start-button").click(() => {
    game.startGame();
    $("#intro").hide();
  });
};

function onResize() {
  const winW = $(window).width();
  const winH = $(window).height();
  const w = Math.min(winW - 20, winH - 350);
  $(".view").width(w);
  $("#board").width(w - 8);
  $("#board").height(w - 8);

  $("footer p").width(w);
}

onResize();
$(window).resize(onResize);
init();
