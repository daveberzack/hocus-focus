import { rgbToHex, getNewCoordinates, getCanvasCoordinates } from "./utils.js";
import Painter from "./Painter.js";

class PixelPainter extends Painter {
  constructor(canvas, cursor) {
    super(canvas, cursor);
    this.layerResolutions = [256, 128, 64, 32, 16, 8, 4];
    this.detailStack = [];
    this.detailFactor = 25;
  }

  _doPaint(x, y) {
    const xOffset = (Math.random() - 0.5) * 2 * 25;
    const yOffset = (Math.random() - 0.5) * 2 * 25;
    this._doPaint2(x + xOffset, y + yOffset);
    this._doPaint2(x + yOffset, y + xOffset);
    this._doPaint2(x, y);
  }

  _doPaint2(x, y) {
    const detailLevel = this._getDetailLevel(x, y) + 1;

    if (detailLevel < 7) {
      const p = this.canvas.pic.context.getImageData(x, y, 1, 1).data;
      const color = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      const ctx = this.canvas.layers[detailLevel].context;
      let w = this.layerResolutions[detailLevel];
      this._pixel({ x, y, w, color, ctx });
      this._drawToDetailLevel(detailLevel, this._pixel, { x, y, w }, 20);
    } else {
      this._stamp(x, y, 8, this.canvas.layers[detailLevel].context);
    }
  }

  revealAll(clickX, clickY) {
    const $canvas = this.canvas.pic.$element;
    const { x, y } = getCanvasCoordinates(clickX, clickY, $canvas);
    const dimension = $canvas.attr("width");
    const minV = 1;
    const maxV = 20;
    const appearFrames = 1200;
    let appearCounter = 0;
    const margin = 50;

    if (this.appearInterval) clearInterval(this.appearInterval);
    this.appearInterval = setInterval(() => {
      appearCounter++;
      appearCounter++;

      let opacity = Math.pow(appearCounter / appearFrames, 2); //slowly increase exponentially
      pic.style.opacity = Math.max(0, 4 * opacity - 0.75); //only appear during the last 1/4 of the animation

      const vFactor = minV + (maxV - minV) * (1 - appearCounter / appearFrames);
      for (let i = 0; i < 100; i++) {
        const v = (Math.random() * vFactor * 3 * appearCounter) / appearFrames;
        const d = ((Math.random() + 0.25) * dimension * appearCounter) / appearFrames + v * 10;
        const a = Math.random() * Math.PI * 2;
        const { x: x1, y: y1 } = getNewCoordinates(x, y, a, d);
        if (x1 > -margin && y1 > -margin && x1 < dimension + margin && y1 < dimension + margin) {
          this._doPaint(x1, y1);
        }
      }

      if (appearCounter > appearFrames) clearInterval(this.appearInterval);
    }, 10);
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }

  _pixel({ x, y, w, color, ctx }) {
    const paintX = Math.floor(x / w) * w;
    const paintY = Math.floor(y / w) * w;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(paintX, paintY, w, w);
    ctx.fill();
  }
}

export default PixelPainter;
