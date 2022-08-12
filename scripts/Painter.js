class Painter {
  constructor(canvas, cursor) {
    this.canvas = canvas;
    this.cursor = cursor;
  }

  paint() {
    const $elem = this.canvas.pic.$element;
    const rect = $elem.offset();
    const elementWidth = $elem.width();
    const graphicWidth = $elem.attr("width");

    const x = ((this.cursor.x - rect.left) * graphicWidth) / elementWidth;
    const y = ((this.cursor.y - rect.top) * graphicWidth) / elementWidth;

    if (
      x >= 0 &&
      y >= 0 &&
      x <= this.canvas.graphicWidth &&
      y <= this.canvas.graphicWidth
    ) {
      this._doPaint(x, y);
    }
  }

  _doPaint() {}

  revealAll() {}

  stopReveal() {}

  _getDetailLevel(x, y) {
    const p = this.canvas.detail.context.getImageData(x, y, 1, 1).data;
    return Math.floor(p[0] / this.detailFactor);
  }

  _stamp(x, y, w, ctx) {
    const d = this.canvas.pic.context.getImageData(x - w / 2, y - w / 2, w, w);
    if (d) ctx.putImageData(d, x - w / 2, y - w / 2);
  }
}

export default Painter;
