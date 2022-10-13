import { getCanvasCoordinates, rgbToHex } from "./utils.js";

class Canvas {
  constructor(challenge) {
    const $sourceElement = $("#source");
    this.graphicWidth = $sourceElement.attr("width");

    const self = this;
    this.source = {
      $element: $sourceElement,
      context: $sourceElement[0].getContext("2d"),
    };
    const sourceImage = new Image();
    sourceImage.onload = function () {
      self.drawImageToLayer(self.source, sourceImage);
    };
    sourceImage.src = challenge.imgFile;

    const $hitElement = $("#hit");
    this.hit = {
      $element: $hitElement,
      context: $hitElement[0].getContext("2d"),
    };
    const hitImage = new Image();
    hitImage.onload = function () {
      self.drawImageToLayer(self.hit, hitImage);
    };
    hitImage.src = challenge.hitFile;

    const $targetElement = $("#target");
    this.target = {
      $element: $targetElement,
      context: $targetElement[0].getContext("2d"),
    };

    const $effectElement = $("#effect");
    this.effect = {
      $element: $effectElement,
      context: $effectElement[0].getContext("2d"),
    };

    this.resetLayers();
  }

  resetLayers() {
    this.fillLayer(this.target, "#FFFFFF");
    this.source.$element.css("opacity", 0);
  }

  checkGuess(mouseX, mouseY) {
    const { x, y } = getCanvasCoordinates(mouseX, mouseY, this.hit.$element);
    const p = this.hit.context.getImageData(x, y, 1, 1).data;
    const hitSuccess = p[0] == 0 && p[1] == 0 && p[2] == 0;
    return hitSuccess;
  }

  fillLayer(layer, color) {
    const ctx = layer.context;
    ctx.beginPath();
    ctx.rect(0, 0, this.graphicWidth, this.graphicWidth);
    ctx.fillStyle = color;
    ctx.fill();
  }

  clearLayer(layer) {
    layer.context.clearRect(0, 0, this.graphicWidth, this.graphicWidth);
  }

  drawImageToLayer(layer, image) {
    layer.context.drawImage(image, 0, 0, this.graphicWidth, this.graphicWidth);
  }

  stamp(x, y, w, h) {
    const d = this.source.context.getImageData(x, y, w, h);
    if (d) this.target.context.putImageData(d, x, y);
  }

  drawRect(x, y, w, h, color) {
    const ctx = this.target.context;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
  }

  drawTestRect(x, y, w, h, color) {
    const ctx = this.effect.context;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
  }

  getColorAtCoordinates(x, y) {
    const p = this.source.context?.getImageData(x, y, 1, 1)?.data;
    if (!p) return null;
    const color = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    return color;
  }
}

export default Canvas;
