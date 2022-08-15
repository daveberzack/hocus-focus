function getCanvasCoordinates(mouseX, mouseY, $canvas) {
  const rect = $canvas.offset();
  const elementWidth = $canvas.width();
  const graphicWidth = $canvas.attr("width");

  const x = ((mouseX - rect.left) * graphicWidth) / elementWidth;
  const y = ((mouseY - rect.top) * graphicWidth) / elementWidth;

  return { x, y };
}

function isInCanvas(mouseX, mouseY, $canvas) {
  const graphicWidth = $canvas.attr("width");
  const { x, y } = getCanvasCoordinates(mouseX, mouseY, $canvas);
  return x >= 0 && y >= 0 && x <= graphicWidth && y <= graphicWidth;
}

// function rgbToHex(r, g, b){
//     return "#" + ((r << 16) | (g << 8) | b).toString(16);
// }

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const formatClue = (input) => {
  return input.replace("[", '<span class="bold">').replace("]", "</span>");
};

export { getCanvasCoordinates, isInCanvas, rgbToHex, getNewCoordinates, getTodayString, sleep, formatClue };
