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

async function sendAnalytics(type, data) {
  console.log("analytics", data);
  const url = `https://dave-simplecrud.herokuapp.com/${type}`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log("...", response);
}

async function getGameResults() {
  const results = await (await dbPromise).getAll("results");
  return results;
}

function getParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

async function getTestChallenge() {
  const results = await getGameResults();
  let challengeId = null;
  const testChallenges = ["001", "002", "003", "004", "005"];
  for (let i = 0; i < testChallenges.length; i++) {
    const testChallenge = testChallenges[i];
    if (!results.find((r) => r.id == testChallenge)) {
      challengeId = testChallenge;
      break;
    }
  }
  return challengeId;
}

function isTouchDevice() {
  const isTouch = window.ontouchstart !== undefined;
  return isTouch;
}

function logPageView() {
  sendAnalytics("pageview", { page: "hocusfocus", userAgent: navigator.userAgent });
}

async function resetData() {
  if (confirm("Clear all your game data?")) {
    (await dbPromise).clear("results");
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
  getCoordinatesRelativeToCanvas,
  getRandom,
  saveGameResult,
  getGameResults,
  sendAnalytics,
  getParameter,
  getTestChallenge,
  isTouchDevice,
  logPageView,
  resetData,
};
