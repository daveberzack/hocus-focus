class PixelPainter {
  constructor(canvas, cursor, width) {
    this.canvas = canvas;
    this.cursor = cursor;

    this.gridblocksAtDetailLevel = [32, 16, 8, 4, 2, 1];
    this.w = width;
    this.numOfGridLines = 128;
    this.detailQueue = [];

    this.detailLevels = [];
    this.gridLines = [];
    for (let i = 0; i <= this.numOfGridLines; i++) {
      let row = [];
      for (let j = 0; j < this.numOfGridLines; j++) {
        row.push(0);
      }
      this.detailLevels.push(row);

      const line = Math.floor((512 * i) / this.numOfGridLines);
      this.gridLines.push(line);
    }
  }

  paint() {
    const $elem = this.canvas.source.$element;
    const rect = $elem.offset();

    const x = this.cursor.x - rect.left;
    const y = this.cursor.y - rect.top;

    this._doPaint(x, y, 0, false);
  }

  _doPaint(x, y, startDetailLevel, isScatter) {
    const xPercent = x / this.w;
    const yPercent = y / this.w;
    if (x < 0 || y < 0 || xPercent > 1 || yPercent > 1) {
      return;
    }
    const color = this.canvas.getColorAtCoordinates(x, y);

    //check detail level already painted at each level.
    //If not painted, paint it. Otherwise, check next level
    const gl = this.gridblocksAtDetailLevel.length;
    for (let d = startDetailLevel; d < gl; d++) {
      //refactor to foreach?

      const gb = this.gridblocksAtDetailLevel[d]; //the number of gridlines that a pixel should span
      const gx = Math.floor((xPercent * this.numOfGridLines) / gb) * gb; //index of top gridline of pixel
      const gy = Math.floor((yPercent * this.numOfGridLines) / gb) * gb; //index of left gridline of pixel

      const detailLevel = this.detailLevels[gx][gy]; //get the detaillevel stored for this pixel
      if (detailLevel == -1 || detailLevel == 9) {
        // this has been stamped with max detail, or...
        // this has been set, but is queued up to delay increasing resolution immediately
      } else if (this.detailLevels[gx][gy] < d + 1) {
        const x2 = this.gridLines[gx];
        const y2 = this.gridLines[gy];
        const w = this.gridLines[gx + gb] - this.gridLines[gx];
        const h = this.gridLines[gy + gb] - this.gridLines[gy];

        if (detailLevel < this.gridblocksAtDetailLevel.length - 1) {
          this.canvas.drawRect(x2, y2, w, h, color);
          //this.canvas.drawTestRect(x2, y2, w, h, "red");
          this.addDetailLevel(gx, gy, d + 1);
        } else {
          this._stamp(x2, y2, w * 2, h * 2); //Why *2? I don't know...
          this.addDetailLevel(gx, gy, 9);
        }

        //draw some scatter to speed up and improve painting (but don't recurse!)
        // if (!isScatter) {
        //   const xOffset = Math.random() > 0.5 ? w : -w;
        //   const yOffset = Math.random() > 0.5 ? h : -h;
        //   this._doPaint(x + xOffset, y + yOffset, startDetailLevel, true);
        //   if (d > 3) this._doPaint(x + yOffset * 2, y + xOffset * 2, startDetailLevel, true);
        // }
        break; //we've drawn at this detail level. Stop checking for higher detail
      }
    }
  }

  revealAll() {
    console.log("reveal");
  }

  _stamp(x, y, w, h) {
    const d = this.canvas.source.context.getImageData(x, y, w, h);
    if (d) this.canvas.target.context.putImageData(d, x, y);
  }

  addDetailLevel(x, y, d) {
    this.detailLevels[x][y] = -1;
    this.detailQueue.push({ x, y, d });

    if (this.detailQueue.length > 30) {
      const q = this.detailQueue.shift();
      this.detailLevels[q.x][q.y] = q.d;
    }
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }
}

export default PixelPainter;
