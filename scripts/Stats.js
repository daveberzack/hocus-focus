class Stats {
  constructor() {}

  show(results) {
    const scores = [0, 0, 0, 0, 0, 0];
    results.forEach((r) => {
      scores[r.stars]++;
    });
    const maxScore = Math.max(...scores);
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
