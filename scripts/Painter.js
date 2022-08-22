import { rgbToHex } from "./utils.js";
class Painter {
  constructor(canvas, cursor) {
    this.canvas = canvas;
    this.cursor = cursor;
    this.detailFactor = 25;
  }

  paint() {
    const $elem = this.canvas.source.$element;
    const rect = $elem.offset();
    const elementWidth = $elem.width();
    const graphicWidth = $elem.attr("width");

    //const x = ((this.cursor.x - rect.left) * graphicWidth) / elementWidth;
    //const y = ((this.cursor.y - rect.top) * graphicWidth) / elementWidth;

    const x = this.cursor.x - rect.left;
    const y = this.cursor.y - rect.top;

    if (x >= 0 && y >= 0 && x <= this.canvas.graphicWidth && y <= this.canvas.graphicWidth) {
      this._doPaint(x, y);
    }
  }

  _drawToDetailLevel(detailLevel, drawFunction, drawParameters, delay) {
    const c = detailLevel * this.detailFactor;
    drawParameters.color = rgbToHex(c, c, c);
    drawParameters.ctx = this.canvas.detail.context;
    this.detailStack.push(drawParameters);

    if (this.detailStack.length > delay) {
      const d = this.detailStack.shift();
      drawFunction(d);
    }
  }

  _getDetailLevel(x, y) {
    const p = this.canvas.detail.context.getImageData(x, y, 1, 1).data;
    return Math.floor(p[0] / this.detailFactor);
  }

  _stamp(x, y, w) {
    const d = this.canvas.source.context.getImageData(x - w / 2, y - w / 2, w, w);
    if (d) this.canvas.target.context.putImageData(d, x - w / 2, y - w / 2);
  }

  _doPaint() {}

  revealAll() {}

  stopReveal() {}
}

export default Painter;
