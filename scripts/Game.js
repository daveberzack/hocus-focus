import Canvas from "./Canvas.js";
import DirectCursor from "./DirectCursor.js";
import PixelPainter from "./PixelPainter.js";
import { isInCanvas, sleep, formatClue } from "./utils.js";

const GAME_LOOP_INCREMENT = 10;

class Game {
  constructor(challenge) {
    this.$timerBar = $("#timer-bar");
    this.$timerSwipe1 = $("#timer-swipe1");
    this.$timerSwipe2 = $("#timer-swipe2");
    this.$clue = $("#clue");
    this.$winMessage = $("#win-message");
    this.$winMessage.hide();

    this.hasWon = false;
    this.isPlaying = false;
    this.timerWidth = 0;
    this.timePassed = 0;
    this.addMouseListeners();
    this.canvas = new Canvas(challenge);
    this.cursor = new DirectCursor($("#pic"));
    this.painter = new PixelPainter(this.canvas, this.cursor);

    this.$clue.html(formatClue(challenge.clue));
    this.goals = challenge.goals;

    this.lastGoal = this.goals[4];
    this.goals.forEach((g, i) => {
      const w = (g / this.lastGoal) * 100 + "%";
      $(`#timer-goal${i}`).width(w);
      $(`#timer-goal${i} h3`).html(g);
    });
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
    const percent = Math.min((this.timePassed / this.lastGoal) * 100, 100);
    this.timerWidth = (this.timerWidth * 3 + percent) / 4; //animate
    this.$timerBar.width(this.timerWidth + "%");
  }

  handlePenalty() {
    this.timePassed += 10;
  }

  async handleWin() {
    this.hasWon = true;
    this.isPlaying = false;
    clearInterval(this.loopInterval);
    this.painter.revealAll(this.cursor.x, this.cursor.y);
    this.$clue.fadeOut(1000);
    await sleep(3000);

    const NUM_FRAMES = 200;
    let winCounter = 0;
    const passedPercent = this.timePassed / this.lastGoal;

    let goalsMet = this.goals.filter((g) => g > this.timePassed);

    const winInterval = setInterval(() => {
      winCounter++;
      const percent = passedPercent + ((1 - passedPercent) * winCounter) / NUM_FRAMES;

      this.$timerBar.width(percent * 100 + "%");

      if (percent > goalsMet[0] / this.lastGoal) {
        if (percent > passedPercent) {
          const $newStar = $(
            '<svg class="star" x="0px" y="0px" width="98px" height="94px" viewBox="-0.5 -0.75 98 94"><polygon fill="#FFFFFF" points="0,35.75 33.5,30.25 48.75,0 63.25,30 96.75,35.5 73,59.25 78.5,92.75 48.5,77.25 18.25,92.75 24.25,59 "/></svg>'
          );
          $("#stars").append($newStar);
          $newStar.animate(
            {
              height: 40,
              width: 40,
            },
            300,
            "easeOutQuad"
          );
        }
        goalsMet.shift();
      }

      if (percent >= 1.1) clearInterval(winInterval);
    }, 10);

    await sleep(3000);
    this.$winMessage.text("Good Job!");
    this.$winMessage.fadeIn(300);
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
