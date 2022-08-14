import { rgbToHex, getNewCoordinates, getCanvasCoordinates } from "./utils.js";
import Painter from "./Painter.js";

class DotPainter extends Painter {
  constructor(canvas, cursor) {
    super(canvas, cursor);
    this.layerRadii = [50, 20, 10, 5];
    this.detailStack = [];
  }

  _doPaint(x, y) {
    //get the detail level from the detail canvas
    const detailLevel = this._getDetailLevel(x, y) + 1;
    const r = this.layerRadii[detailLevel];
    const scatter = r * (detailLevel + 3);

    if (detailLevel < 4) {
      const ctx = this.canvas.layers[detailLevel].context;

      for (let k = 0; k < 5; k++) {
        const x2 = x + (Math.random() - 0.5) * scatter;
        const y2 = y + (Math.random() - 0.5) * scatter;
        const p = this.canvas.pic.context.getImageData(x2, y2, 1, 1).data;
        const color = rgbToHex(p[0], p[1], p[2]);
        this._dot({ x: x2, y: y2, r, color, ctx });
        this._drawToDetailLevel(detailLevel, this._dot, { x: x2, y: y2, r }, 60);
      }
    } else {
      for (let k = 0; k < 4; k++) {
        const x2 = x + (Math.random() - 0.5) * 8;
        const y2 = y + (Math.random() - 0.5) * 8;
        this._stamp(x2, y2, 4, this.canvas.layers[7].context);
      }
    }
  }

  _dot({ x, y, r, color, ctx }) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
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
    }, 5);
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }
}

export default DotPainter;
