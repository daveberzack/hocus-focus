function getCanvasCoordinates(mouseX, mouseY, $canvas) {
  const rect = $canvas.offset();
  const elementWidth = $canvas.width();
  const graphicWidth = $canvas.attr("width");

  const x = ((mouseX - rect.left) * graphicWidth) / elementWidth;
  const y = ((mouseY - rect.top) * graphicWidth) / elementWidth;

  return { x, y };
}

const showView = (name) => {
  $(".view").addClass("hidden");
  $("#" + name).removeClass("hidden");
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

const _addDays = function (date, days) {
  return new Date(date.getTime() + days * 1000*60*60*24); //convert to milliseconds
};

const getDateFormatted = function (offset, forDisplay) {
  const date = _addDays(new Date(), -offset);

  if (forDisplay) {
    return [
      _padTo2Digits(date.getMonth() + 1),
      _padTo2Digits(date.getDate()),
      date.getFullYear()
    ].join("-");
  }
  else {
    return [
      date.getFullYear(),
      _padTo2Digits(date.getMonth() + 1),
      _padTo2Digits(date.getDate())
    ].join("");
  }
  
};


const getFormattedDateFromDateString = function (dateString) {
  return dateString.substr(2,2)+"-"+dateString.substr(4,2)+"-20"+dateString.substr(0,2)
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

function isTouchDevice() {
  const isTouch = window.ontouchstart !== undefined;
  return isTouch;
}

export { showView, getCanvasCoordinates, isInCanvas, rgbToHex, getNewCoordinates, getDateFormatted, sleep, formatClue, unformatClue, copyToClipboard, getCoordinatesRelativeToCanvas, getRandom, isTouchDevice, getParameter, getFormattedDateFromDateString };
