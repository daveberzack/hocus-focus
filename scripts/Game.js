import Canvas from "./Canvas.js";
import Cursor from "./Cursor.js";
import PixelPainter from "./PixelPainter.js";
import { isInCanvas, sleep, formatClue, saveGameResult, sendAnalytics } from "./utils.js";
import WinContent from "./WinContent.js";

const GAME_LOOP_INCREMENT = 10;

class Game {
  constructor() {
    this.$timerBar = $("#timer-bar");
    this.$timerSwipe1 = $("#timer-swipe1");
    this.$timerSwipe2 = $("#timer-swipe2");
    this.$clue = $("#clue");
    this.$introClue = $("#intro-clue");
    this.$testerForm = $("#tester-form");
    this.$testerForm.hide();
    this.addMouseListeners();
    this.winContent = new WinContent();
  }

  init(challenge, canvasWidth, testerId) {
    this.canvas = new Canvas(challenge);
    this.cursor = new Cursor($("#pic"));
    this.painter = new PixelPainter(this.canvas, this.cursor, canvasWidth);
    this.timePassed = 0;
    this.mistakes = 0;
    this.testerId = testerId;
    this.isPlaying = false;
    this.resetTimer();
    clearInterval(this.loopInterval);
    $("#credit").html(challenge.credit);
    $("#credit").attr("href", challenge.url);
    const clue = formatClue(challenge.clue);
    this.$clue.hide().html(clue);
    this.$introClue.html(clue);
    this.goals = challenge.goals;

    challenge.lastGoal = challenge.goals[challenge.goals.length - 1];
    this.challenge = challenge;

    this.goals.forEach((g, i) => {
      const w = (g / this.goals[4]) * 100 + "%";
      $(`#timer-goal${i}`).width(w);
      $(`#timer-goal${i} h3`).html(g);
    });
    this.painter.stopReveal();
    $("#source").css("opacity", 0);
    this.winContent.reset();
  }

  addMouseListeners() {
    $("body").mousemove((e) => {
      if (this.isPlaying) this.cursor.handleMove(e.clientX, e.clientY);
    });

    $("body").on({
      mousemove: (e) => {
        if (this.isPlaying) this.cursor.handleMove(e.clientX, e.clientY);
      },

      touchmove: (e) => {
        if (this.isPlaying) this.cursor.handleMove(e.touches[0].clientX, e.touches[0].clientY);
      },

      click: (e) => {
        if (this.isPlaying) this.handleCursorClick();
      },
    });
  }

  startGame() {
    this.isPlaying = true;

    this.$clue.fadeIn();
    let self = this;
    clearInterval(this.loopInterval);
    this.loopInterval = setInterval(() => {
      self.doGameLoop();
    }, GAME_LOOP_INCREMENT);
  }

  doGameLoop() {
    if (!this.isPlaying) return;
    this.painter.paint();
    this.updateTimer();
  }

  updateTimer() {
    this.timePassed = this.timePassed + GAME_LOOP_INCREMENT / 1000;
    const effectiveTimePassed = this.timePassed + this.mistakes * 10;
    const percent = Math.min((effectiveTimePassed / this.challenge.lastGoal) * 100, 100);
    this.timerWidth = (this.timerWidth * 3 + percent) / 4; //animate
    this.$timerBar.width(this.timerWidth + "%");
  }
  resetTimer() {
    this.timerWidth = 0;
    this.$timerBar.width("0%");
  }

  handlePenalty() {
    this.mistakes++;
  }

  async handleWin() {
    const effectiveTimePassed = this.timePassed + this.mistakes * 10;
    const goalsMet = this.challenge.goals.filter((g) => g > effectiveTimePassed);

    saveGameResult(this.challenge.id, this.timePassed, this.mistakes, goalsMet.length);
    sendAnalytics("hocussolve", { tester: this.testerId, challengeId: this.challenge.id, timePassed: Math.round(this.timePassed), mistakes: this.mistakes, stars: goalsMet.length });

    this.isPlaying = false;
    clearInterval(this.loopInterval);
    this.painter.revealAll(this.cursor.x, this.cursor.y);
    this.$clue.fadeOut(1000);

    await sleep(3000);

    this.winContent.show({
      challenge: this.challenge,
      effectiveTimePassed,
      goalsMet,
    });

    if (this.testerId) {
      await sleep(3000);
      $("#tester-form input:radio").prop("checked", false);
      this.$testerForm.show();
    }
  }

  handleCursorClick() {
    if (isInCanvas(this.cursor.x, this.cursor.y, this.canvas.source.$element)) {
      const isGuessCorrect = this.canvas.checkGuess(this.cursor.x, this.cursor.y);
      if (isGuessCorrect) this.handleWin();
      else this.handlePenalty();
    }
  }
}

export default Game;
