import Game from "./Game.js";
import allChallenges from "../data/allChallenges.js";

const showView = (name) => {
  $(".view").removeClass("shown");
  $("#" + name).addClass("shown");
};

const formatClue = (input) => {
  return input.replace("[", '<span class="bold">').replace("]", "</span>");
};

const todayChallenge =
  allChallenges[Math.floor(Math.random() * allChallenges.length)];

const game = new Game();

$("#clue").html(formatClue(todayChallenge.clue));

$("#instructions-button").click(() => {
  showView("instructions");
});

$("#start-button").click(() => {
  game.startGame(todayChallenge);
  $("#intro").hide();
});
