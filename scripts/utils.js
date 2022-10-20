import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";

const VERSION = 1;
const dbPromise = openDB("data", VERSION, {
  upgrade(db) {
    db.createObjectStore("results", { keyPath: "key", autoIncrement: true });
  },
});

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

function getCoordinatesRelativeToCanvas(x0, y0, $canvas) {
  const rect = $canvas.offset();

  const x = x0 - rect.left;
  const y = y0 - rect.top;
  return { x, y };
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

async function saveGameResult(challengeId, timePassed, mistakes, stars) {
  (await dbPromise).put("results", { id: challengeId, timePassed: Math.round(timePassed), mistakes, stars });
}

function sendAnalytics(type, data) {
  gtag("event", type, data);
}

async function getGameResults() {
  const results = await (await dbPromise).getAll("results");
  return results;
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
  getCoordinatesRelativeToCanvas,
  getRandom,
  saveGameResult,
  getGameResults,
  sendAnalytics,
};
