import Canvas from "./Canvas.js";
import DirectCursor from "./DirectCursor.js";
import PixelPainter from "./PixelPainter.js";
import DotPainter from "./DotPainter.js";
import { isInCanvas } from "./utils.js";

const GAME_LOOP_INCREMENT = 10;

class Game {
  constructor() {
    this.$timerLabel = $("#timer-label");
    this.hasWon = false;
    this.isPlaying = false;
    this.addMouseListeners();
    this.goalTime = 100;
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

  startGame(challenge) {
    this.canvas = new Canvas(challenge);
    this.cursor = new DirectCursor($("#pic"));

    if (challenge.type == "pixel") {
      this.painter = new PixelPainter(this.canvas, this.cursor);
    } else {
      this.painter = new DotPainter(this.canvas, this.cursor);
      $("#board").addClass("dot");
    }

    this.isPlaying = true;
    this.timePassed = 0;
    this.timerWidth = 0;

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
    const w = Math.min((this.timePassed / this.goalTime) * 100, 100);
    this.timerWidth = (this.timerWidth * 3 + w) / 4; //animate
    this.$timerLabel.width(this.timerWidth + "%");
    this.$timerLabel.text(Math.floor(this.timePassed));
  }

  handlePenalty() {
    this.timePassed += 10;
    this.$timerLabel.css("background-color", "#FF0000");
    setTimeout(() => {
      this.$timerLabel.css("backgroundColor", "#FFFFFF");
    }, 500);
  }

  handleWin() {
    this.hasWon = true;
    this.isPlaying = false;
    clearInterval(this.loopInterval);
    this.painter.revealAll(this.cursor.x, this.cursor.y);
  }

  handleCursorClick() {
    if (isInCanvas(this.cursor.x, this.cursor.y, this.canvas.pic.$element)) {
      const isGuessCorrect = this.canvas.checkGuess(this.cursor.x, this.cursor.y);
      if (isGuessCorrect) this.handleWin();
      else this.handlePenalty();
    }
  }
}

export default Game;
