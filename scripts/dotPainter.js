import { rgbToHex, getNewCoordinates, getCanvasCoordinates } from "./utils.js";
import Painter from "./Painter.js";

class DotPainter extends Painter {
  constructor(canvas, cursor) {
    super(canvas, cursor);
    this.layerRadii = [150, 100, 50, 25, 12, 6, 3];
    this.detailStack = [];
    this.detailFactor = 25;
  }

  _doPaint(x, y) {
    const xOffset2 = (Math.random() - 0.5) * 30;
    const yOffset2 = (Math.random() - 0.5) * 30;
    this._doPaint2(x + xOffset2, y + yOffset2);
    this._doPaint2(x + yOffset2, y + xOffset2);

    this._doPaint2(x, y);
  }

  _doPaint2(x, y, hex2) {
    //get the detail level from the detail canvas
    const detailLevel = this._getDetailLevel(x, y) + 1;

    const c = detailLevel * this.detailFactor;
    const hex = "#" + ("000000" + rgbToHex(c, c, c)).slice(-6);
    const w = this.layerRadii[detailLevel];
    const ctx = this.canvas.detail.context;
    this.detailStack.push({ x, y, w, hex, ctx });

    if (this.detailStack.length > 20) {
      const d = this.detailStack.shift();
      this._dot(d.x, d.y, d.w, d.hex, d.ctx);
    }

    if (detailLevel < 7) {
      const p = this.canvas.pic.context.getImageData(x, y, 1, 1).data;
      const hex2 = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      const ctx2 = this.canvas.layers[detailLevel].context;
      this._dot(x, y, this.layerRadii[detailLevel], hex2, ctx2);
      this._dot(x, y, this.layerRadii[detailLevel], hex2, ctx2);
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
        const d =
          ((Math.random() + 0.25) * dimension * appearCounter) / appearFrames +
          v * 10;
        const a = Math.random() * Math.PI * 2;
        const { x: x1, y: y1 } = getNewCoordinates(x, y, a, d);
        if (
          x1 > -margin &&
          y1 > -margin &&
          x1 < dimension + margin &&
          y1 < dimension + margin
        ) {
          this._doPaint(x1, y1);
        }
      }

      if (appearCounter > appearFrames) clearInterval(this.appearInterval);
    }, 5);
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }

  _dot(x, y, r, color, ctx) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export default DotPainter;
