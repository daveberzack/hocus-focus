import { getCanvasCoordinates, rgbToHex } from "./utils.js";

class Canvas {
  constructor(challenge) {
    const { name } = challenge;
    const $picElement = $("#pic");
    this.graphicWidth = $picElement.attr("width");

    const self = this;
    this.pic = {
      $element: $picElement,
      context: $picElement[0].getContext("2d"),
    };
    const picImage = new Image();
    picImage.onload = function () {
      self.drawImageToLayer(self.pic, picImage);
    };
    picImage.src = challenge.imgFile;

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

    this.layers = [];
    for (let i = 0; i < 8; i++) {
      const $layerElement = $("#paint" + i);
      this.layers[i] = {
        $element: $layerElement,
        context: $layerElement[0].getContext("2d"),
      };
    }

    const $detailElement = $("#detail");
    const detailContext = $detailElement[0].getContext("2d");
    this.detail = {
      $element: $detailElement,
      context: detailContext,
    };
    detailContext.globalCompositeOperation = "lighten";

    this.resetLayers();
  }

  resetLayers() {
    for (let i = 0; i < 8; i++) {
      this.clearLayer(this.layers[i]);
    }
    this.fillLayer(this.layers[0], "#FFFFFF");

    this.clearLayer(this.detail);
    this.fillLayer(this.detail, "#000000");
    this.pic.$element.css("opacity", 0);
  }

  checkGuess(mouseX, mouseY) {
    const { x, y } = getCanvasCoordinates(mouseX, mouseY, this.pic.$element);
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
}

export default Canvas;
