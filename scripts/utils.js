function getCanvasCoordinates(mouseX, mouseY, $canvas) {
  const rect = $canvas.offset();
  const elementWidth = $canvas.width();
  const graphicWidth = $canvas.attr("width");

  const x = ((mouseX - rect.left) * graphicWidth) / elementWidth;
  const y = ((mouseY - rect.top) * graphicWidth) / elementWidth;

  return { x, y };
}

const showView = (name) => {
  $(".view").removeClass("shown");
  $("#" + name).addClass("shown");
};

function isInCanvas(mouseX, mouseY, $canvas) {
  const graphicWidth = $canvas.attr("width");
  const { x, y } = getCanvasCoordinates(mouseX, mouseY, $canvas);
  return x >= 0 && y >= 0 && x <= graphicWidth && y <= graphicWidth;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getNewCoordinates(x0, y0, radians, distance) {
  const dy = distance * Math.cos(radians);
  const dx = distance * Math.sin(radians);
  return { x: x0 + dx, y: y0 + dy };
}

const _padTo2Digits = function (num) {
  return num.toString().padStart(2, "0");
};

const getTodayString = function () {
  const date = new Date();
  return [date.getFullYear(), _padTo2Digits(date.getMonth() + 1), _padTo2Digits(date.getDate())].join("");
};

const getTodayFormatted = function () {
  const date = new Date();
  return date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const formatClue = (input) => {
  return input.replace("[", '<span class="bold">').replace("]", "</span>").replace("|", "<br/>");
};

const unformatClue = (input) => {
  return input.replace("[", "").replace("]", "").replace("|", "");
};

function copyToClipboard(text, callback) {
  navigator.clipboard.writeText(text).then(callback);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let gameResults = [];
function saveGameResult(challengeId, timePassed, mistakes, stars) {
  const existingResult = gameResults.find((g) => g.id == challengeId);
  if (!existingResult) {
    gameResults.push({ id: challengeId, timePassed: Math.round(timePassed), mistakes, stars });

    const dataString = gameResults
      .map((r) => {
        return `${r.id}~${r.timePassed}~${r.mistakes}~${r.stars}`;
      })
      .join("^");

    window.localStorage.setItem("gameResults", dataString);
  }
}

function getGameResults() {
  if (gameResults.length > 0) {
    return gameResults;
  } else {
    const data = window.localStorage.getItem("gameResults")?.split("^") || [];
    gameResults = data.map((r) => {
      const d = r.split("~");
      return { id: d[0], timePassed: d[1], mistakes: d[2], stars: d[3] };
    });
    return gameResults;
  }
}

export {
  showView,
  getCanvasCoordinates,
  isInCanvas,
  rgbToHex,
  getNewCoordinates,
  getTodayString,
  getTodayFormatted,
  sleep,
  formatClue,
  unformatClue,
  copyToClipboard,
  getRandom,
  saveGameResult,
  getGameResults,
};
