import Stats from "./Stats.js";
import { sleep, getRandom, unformatClue, getTodayFormatted, showView, copyToClipboard } from "./utils.js";
import { getGameResults } from "./data.js";

class WinContent {
  constructor() {
    this.$winMessage = $("#win-message");
    this.$timerBar = $("#timer-bar");
    this.$stars = $("#stars");
    this.$testerForm = $("#tester-form");
    this.stats = new Stats();
    this.winInterval = 0;
    this.reset();
  }

  reset() {
    this.$stars.hide();
    this.$winMessage.hide();
    $("#win-content").hide();
    $("#after-button").hide();
    $("#after-message").hide();
    $("#credit-block").hide();
    $("#win-links").hide();
    $("#clipboard-message").hide();
    clearInterval(this.winInterval);
  }

  async show({ challenge, effectiveTimePassed, goalsMet, gaveUp, testerId }) {
    $("#win-content").show();
    $("#after-message").hide();
    const timeFormatted = Math.round(effectiveTimePassed);

    this.showStars(effectiveTimePassed, goalsMet, challenge);

    await sleep(2000);

    this.showWinMessage(timeFormatted, goalsMet, gaveUp);

    await sleep(2000);
    this.showWinLinks(goalsMet, timeFormatted, challenge);

    await sleep(1000);
    if (challenge.isTest || challenge.isTutorial || challenge.isSpecified) {
      $("#after-button").fadeIn();
    }
    else {
      $("#after-message").fadeIn();
    }

    if (testerId) {
      $("#tester-form input:radio").prop("checked", false);
      $("#tester-form textarea").val("");
      this.$testerForm.show();
    }
  }

  showStars(effectiveTimePassed, goalsMet, challenge) {
    this.$stars.show();
    this.$stars.empty();
    const passedPercent = effectiveTimePassed / challenge.lastGoal;
    const NUM_FRAMES = 200;
    let winCounter = 0;
    let goalsMetIndex = 0;
    this.winInterval = setInterval(() => {
      winCounter++;
      const percent = passedPercent + ((1 - passedPercent) * winCounter) / NUM_FRAMES;

      this.$timerBar.width(percent * 100 + "%");
      if (percent > goalsMet[goalsMetIndex] / challenge.lastGoal) {
        if (percent > passedPercent) {
          const $newStar = $('<svg class="star" x="0px" y="0px" width="98px" height="94px" viewBox="-0.5 -0.75 98 94"><polygon fill="#FFFFFF" points="0,35.75 33.5,30.25 48.75,0 63.25,30 96.75,35.5 73,59.25 78.5,92.75 48.5,77.25 18.25,92.75 24.25,59 "/></svg>');
          this.$stars.append($newStar);
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

      if (percent >= 1.1) clearInterval(this.winInterval);
    }, 10);
  }

  showWinMessage(timeFormatted, goalsMet, gaveUp) {
    const messages = [
      ["You got there.", "No stars this time.", "Good going.", "Got it!"],
      ["Not too shabby.", "Not bad.", "", "Alright!", "Solid effort."],
      ["Nice.", "Good for you.", "Solid.", "There you go!", "Lovely."],
      ["Good job!", "Very nice.", "Nice touch.", "Yay!", "Hurrah!"],
      ["Great job!", "Excellent work!", "Bravo!", "Beautiful.", "Splendid!"],
      ["Outstanding!", "Masterful.", "Truly virtuosic.", "Brilliant!", "Genius!"],
    ];
    let messageSubset = messages[goalsMet.length];
    if (timeFormatted * 1 < 3) messageSubset = ["Really?", "Crazy luck!", "Huh...", "For real?"];
    if (gaveUp) messageSubset = ["Good effort.", "Not this time.", "Keep at it!", "Maybe next time."];

    $(".timer-error").remove();
    const message = getRandom(messageSubset);
    const timeUnit = timeFormatted==1 ? "Second" : "Seconds";
    this.$winMessage.find("h2").html(`<span class="bold">${timeFormatted} ${timeUnit}.</span><span class="comment"> ${message}</span>`);
    this.$winMessage.fadeIn(300);
    this.$winMessage.find(".comment").hide().delay(1000).fadeIn(300);
  }

  showWinLinks(goalsMet, timeFormatted, challenge) {
    $("#win-links").css({ bottom: -100 }).show().animate({ bottom: 0 }, 500);
    $("#win-stats-link").click(async () => {
      showView("stats");
      const results = await getGameResults();
      this.stats.showRecord(results);
    });

    $("#win-donate-link");

    $("#win-share-link").click(() => {
      let stars = "";
      goalsMet.forEach((s) => (stars += "⭐"));

      let shareText = `🔍 Hocus Focus [${getTodayFormatted()}]
🧩 - ${unformatClue(challenge.clue)}
🏆 - ${stars} (${timeFormatted} Seconds)

Solve the riddle in a hidden picture:
https://www.hocusfocus.fun`;

      if (challenge.isSpecified) shareText = "https://www.hocusfocus.fun/?id=639636736b3ee2ea3c813cb2";

      copyToClipboard(shareText, () => {});
      $("#clipboard-message").show();
    });

    if (challenge.credit) {
      $("#credit-block").css({ top: -50 }).show().animate({ top: 0 }, 500);
      $("#credit").text(challenge.credit);
      $("#credit").attr("href", challenge.creditUrl);
    }
  }
}

export default WinContent;
