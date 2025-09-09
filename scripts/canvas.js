import { getCanvasCoordinates, rgbToHex } from "./utils.js";

class Canvas {
  
  constructor(challenge) {
    const $sourceElement = $("#source");
    this.graphicWidth = $sourceElement.attr("width");

    this.isSourceLoaded = false;
    const self = this;
    this.source = {
      $element: $sourceElement,
      context: $sourceElement[0].getContext("2d", {
        willReadFrequently: true,
      }),
    };
    const sourceImage = new Image();
    sourceImage.crossOrigin = "Anonymous";
    sourceImage.onload = function () {
      self.drawImageToLayer(self.source, sourceImage);
      self.isSourceLoaded = true;
    };
    
    // Handle both tutorial challenges (with imageUrl) and regular challenges (with imageKey)
    if (challenge.imageUrl) {
      sourceImage.src = challenge.imageUrl;
    } else if (challenge.imageKey) {
      sourceImage.src = "./data/images/"+challenge.imageKey+".jpeg";
    } else {
      console.error("Challenge has no imageUrl or imageKey:", challenge);
    }

    const $hitElement = $("#hit");
    this.hit = {
      $element: $hitElement,
      context: $hitElement[0].getContext("2d", {
        willReadFrequently: true,
      }),
    };
    this.fillLayer(this.hit, "#000000");
    challenge.hitAreas?.forEach((h) => {
      this.drawLineToLayer(this.hit, h.x1, h.y1, h.x2, h.y2, h.w);
    });

    const $targetElement = $("#target");
    this.target = {
      $element: $targetElement,
      context: $targetElement[0].getContext("2d", {
        alpha: false,
      }),
    };

    const $target2Element = $("#target2");
    this.target2 = {
      $element: $target2Element,
      context: $target2Element[0].getContext("2d", {
        alpha: true,
      }),
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
    this.clearLayer(this.target2);
    this.source.$element.css("opacity", 0);
    this.hit.$element.css("opacity", 0);
  }

  checkGuess(mouseX, mouseY) {
    const { x, y } = getCanvasCoordinates(mouseX, mouseY, this.hit.$element);
    const p = this.hit.context.getImageData(x, y, 1, 1).data;
    const hitSuccess = p[0] > 0 || p[1] > 0 || p[2] > 0;
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

  drawLineToLayer(layer, x1, y1, x2, y2, width) {
    const g = this.graphicWidth / 100;
    const ctx = layer.context;
    ctx.beginPath();
    ctx.moveTo(x1 * g, y1 * g);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = width * g;
    ctx.lineCap = "round";
    ctx.lineTo(x2 * g, y2 * g);
    ctx.stroke();
  }

  stamp(x, y, w, h) {
    const d = this.source.context.getImageData(x, y, w, h);
    if (d) this.target2.context.putImageData(d, x, y);
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
