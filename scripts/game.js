import Canvas from "./canvas.js";
import Cursor from "./cursor.js";
import PixelPainter from "./pixelPainter.js";
import { isInCanvas, sleep, formatClue, getCanvasCoordinates, getFormattedDateFromDateString } from "./utils.js";
import { saveGameResult, sendAnalytics } from "./data.js";

import WinContent from "./winContent.js";

const GAME_LOOP_INCREMENT = 10;

class Game {
  constructor() {
    this.$timerBar = $("#timer-bar");
    this.$timerSwipe1 = $("#timer-swipe1");
    this.$timerSwipe2 = $("#timer-swipe2");
    this.$clue = $("#clue");
    this.$giveUp = $("#give-up");
    this.$introClue = $("#intro-clue");
    this.$startButton = $("#start-button");
    this.$introArchiveMessage = $("#intro-archive-message");
    this.addMouseListeners();
    this.winContent = new WinContent();
  }

  init(challenge, canvasWidth) {
    this.canvas = new Canvas(challenge);
    this.cursor = new Cursor($("#pic"));
    this.painter = new PixelPainter(this.canvas, this.cursor, canvasWidth);
    this.timePassed = 0;
    this.mistakes = 0;
    this.gaveUp = false;
    this.isPlaying = false;
    this.resetTimer();
    clearInterval(this.loopInterval);
    let clue = formatClue(challenge.clue);
    const subtitle = formatClue(challenge.subtitle || "");
    if (subtitle) clue = clue + '<span id="subtitle">' + subtitle + "</span>";
    if (challenge.hideButton) $("#start-button").hide();
    this.$clue.hide().html(clue);
    this.$introClue.html(clue);

    this.$startButton.toggle(!challenge.isError);
    if (challenge.isArchive){
      const archiveDateString = getFormattedDateFromDateString(challenge.date);
      this.$introArchiveMessage.show().html("You've played today's puzzle.<br/>Here's the puzzle from<br/><b>"+archiveDateString+"</b>");
    }
    else this.$introArchiveMessage.hide()


    this.goals = challenge.goals;
    this.challenge = challenge;
    if (challenge.goals){
      challenge.lastGoal = challenge.goals[challenge.goals.length - 1];
      this.goals.forEach((g, i) => {
        const w = (g / this.goals[4]) * 100 + "%";
        $(`#timer-goal${i}`).width(w);
        $(`#timer-goal${i} h3`).html(g);
      });
    }
    

    
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
      }
    });

    $("#board").on({
      click: (e) => {
        if (this.isPlaying) this.handleCursorClick();
      },
    });
  }

  startGame() {
    let self = this;
    if (!this.canvas.isSourceLoaded){
      $("#start-button").html("Loading");
      setTimeout(() => {
        self.startGame();
      }, 1000);
      return;
    }
    
    $("#intro").hide();
    $("#start-button").html("Start");
    
    this.isPlaying = true;
    this.gaveUp = false;

    this.$clue.fadeIn();
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
    if (percent >= 100 && !this.gaveUp) {
      this.$giveUp.show();
    }
  }
  resetTimer() {
    this.timerWidth = 0;
    this.$timerBar.width("0%");
  }

  handleCursorClick() {
    if (this.isPlaying && isInCanvas(this.cursor.x, this.cursor.y, this.canvas.source.$element)) {
      const isGuessCorrect = this.canvas.checkGuess(this.cursor.x, this.cursor.y);
      const { x, y } = getCanvasCoordinates(this.cursor.x, this.cursor.y, this.canvas.source.$element);
      if (isGuessCorrect) this.handleWin();
      else this.handlePenalty(x, y);
    }
  }

  handlePenalty(x, y) {
    this.mistakes++;

    const $errorMarker = $('<img src="./img/x.png" class="error-marker"/>');
    $("#board").append($errorMarker);
    let errorTimer = 0;
    let errorInfo = { x, y, w: 1 };
    const errorInterval = setInterval(() => {
      errorTimer++;
      if (errorTimer > 80) {
        $errorMarker.remove();
        clearInterval(errorInterval);

        let xImages = "";
        for (let i = 0; i < this.mistakes; i++) {
          xImages += '<img class="timer-error" src="./img/x.png"/>';
        }
        this.$timerBar.html(xImages);
      } else if (errorTimer > 60) {
        errorInfo.x++;
        errorInfo.y++;
        errorInfo.w -= 2;
        $errorMarker.css({ left: errorInfo.x, top: errorInfo.y, width: errorInfo.w, height: errorInfo.w });
      } else if (errorTimer < 20) {
        errorInfo.x--;
        errorInfo.y--;
        errorInfo.w += 2;
        $errorMarker.css({ display: "block", left: errorInfo.x, top: errorInfo.y, width: errorInfo.w, height: errorInfo.w });
      }
    }, 10);
  }

  async handleWin() {
    const effectiveTimePassed = this.timePassed + this.mistakes * 10;
    const goalsMet = this.challenge.goals.filter((g) => g > effectiveTimePassed);

    this.$giveUp.hide();   

    saveGameResult(this.challenge.date, this.timePassed, this.mistakes, goalsMet.length);
    sendAnalytics("solve", { challengeId: this.challenge.date, timePassed: Math.round(this.timePassed), mistakes: this.mistakes, stars: goalsMet.length, gaveUp: this.gaveUp });

    this.isPlaying = false;
    clearInterval(this.loopInterval);
    this.painter.revealAll(this.cursor.x, this.cursor.y);
    this.$clue.fadeOut(1000);

    await sleep(3000);
    if (this.gaveUp) {
      $("#hit").fadeTo(1000, 0.7);
      await sleep(1000);
    }

    this.winContent.show({
      challenge: this.challenge,
      effectiveTimePassed,
      goalsMet,
      gaveUp: this.gaveUp,
    });
  }
}

export default Game;

