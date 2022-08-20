import { sleep, getRandom, formatClue, unformatClue, getTodayFormatted, showView, copyToClipboard } from "./utils.js";

class WinContent {
  constructor() {
    this.$winMessage = $("#win-message");
    this.$winModal = $("#win-modal");
    this.$timerBar = $("#timer-bar");
    this.$winMessage.hide();
    this.$winModal.hide();

    $("#win-links").hide();
  }

  async show({ timePassed, challenge }) {
    const NUM_FRAMES = 200;
    let winCounter = 0;
    const passedPercent = timePassed / challenge.lastGoal;

    let goalsMet = challenge.goals.filter((g) => g > timePassed);

    let goalsMetIndex = 0;
    const winInterval = setInterval(() => {
      winCounter++;
      const percent = passedPercent + ((1 - passedPercent) * winCounter) / NUM_FRAMES;

      this.$timerBar.width(percent * 100 + "%");

      if (percent > goalsMet[goalsMetIndex] / challenge.lastGoal) {
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
        goalsMetIndex++;
      }

      if (percent >= 1.1) clearInterval(winInterval);
    }, 10);

    await sleep(3000);

    const messages = ["Good job!", "Very nice!", "Excellent work!", "Beautiful."];
    const message = getRandom(messages);
    const time = Math.round(timePassed * 10) / 10;
    this.$winMessage.find("h2").html(`<span class="bold">${time} Seconds.</span><span class="comment"> ${message}</span>`);
    this.$winMessage.fadeIn(300);
    this.$winMessage.find(".comment").hide().delay(1000).fadeIn(300);

    $("#win-links >*").hide();
    $("#win-links").show();
    //$("#win-replay-link").delay(2600).fadeIn(500);
    $("#win-stats-link").delay(2400).fadeIn(500);
    $("#win-share-link").delay(2200).fadeIn(500);
    $("#win-donate-link").delay(2000).fadeIn(500);

    $("#win-stats-link")
      .mouseover(() => {
        this.showWinModal(formatClue("View your [stats]"), 300);
      })
      .mouseout(() => {
        this.hideWinModal(300);
      })
      .click(() => {
        showView("stats");
      });

    $("#win-donate-link")
      .mouseover(() => {
        this.showWinModal(formatClue("[Support] the developer"), 300);
      })
      .mouseout(() => {
        this.hideWinModal(300);
      });

    $("#win-share-link")
      .mouseover(() => {
        this.showWinModal(formatClue("[Share] your Results"), 300);
      })
      .mouseout(() => {
        this.hideWinModal(300);
      })
      .click(() => {
        let stars = "";
        goalsMet.forEach((s) => (stars += "⭐"));

        const shareText = `🔍 Hocus Focus [${getTodayFormatted()}]
🧩 - ${unformatClue(challenge.clue)}
🏆 - ${stars} (${time} Seconds)

Solve the riddle in a hidden picture:
https://www.5minute.games/hocus-focus`;

        copyToClipboard(shareText, () => {});
        this.showHideWinModal(formatClue("[Copied] to clipboard"), 500, 2000, 500);
      });
  }

  showHideWinModal(msg, fadeIn, duration, fadeOut) {
    this.$winModal.find("h2").html(msg);
    this.$winModal.hide().fadeIn(fadeIn).delay(duration).fadeOut(fadeOut);
  }

  showWinModal(msg, fadeIn) {
    this.$winModal.find("h2").html(msg);
    this.$winModal.hide().fadeIn(fadeIn);
  }

  hideWinModal(fadeOut) {
    this.$winModal.fadeOut(fadeOut);
  }
}

export default WinContent;
