import { formatClue } from "./utils.js";

class Stats {
  constructor() {}

  showRecord(results) {
    const scores = [0, 0, 0, 0, 0, 0];
    results.forEach((r) => {
      scores[r.stars]++;
    });

    this.setScoreGraph(scores);
    $("#stats-title").html("Your Stats");
    $("#stats-copy").html("The number of puzzles you solved with 5 Stars, with 4, etc.");
    $("#stats-record-button").show();
    $("#stats-yesterday-button").hide();
  }
  
  showYesterday(scoreData, playerResult) {
    this.setScoreGraph(scoreData.scores);
    $("#stats-title").html(formatClue(scoreData.clue));
    $("#stats-copy").html("Here's how others fared on yesterday's puzzle<br><b>(You got "+playerResult.stars+" stars)</b>");
    $("#stats-record-button").hide();
    $("#stats-yesterday-button").show();
  }

  setScoreGraph(scores) {
    
    const maxScore = Math.max(...scores)*1.1;
    let html = "";
    for (let i = 5; i >= 0; i--) {
      const w = Math.round((scores[i] * 100) / maxScore);
      const zeroStyle = scores[i] > 0 ? "" : "zero";
      html += `<div id="stats-bar-${i}" class="stats-bar ${zeroStyle}" style="width:${w}%;">
        <h3 class="stats-label">${i}</h3>
        <h3 class="stats-value">${scores[i]}</h3>
      </div>`;
    }

    $("#stats-graph").html(html);

  }
}

export default Stats;
