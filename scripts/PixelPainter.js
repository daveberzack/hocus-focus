import { getNewCoordinates, getCoordinatesRelativeToCanvas } from "./utils.js";

class PixelPainter {
  constructor(canvas, cursor, width) {
    this.canvas = canvas;
    this.cursor = cursor;

    this.gridblocksAtDetailLevel = [32, 16, 8, 4, 2, 1];
    this.elementWidth = width;
    this.graphicWidth = width;
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

      const line = Math.floor((width * i) / this.numOfGridLines);
      this.gridLines.push(line);
    }
  }

  paint() {
    const { x, y } = getCoordinatesRelativeToCanvas(this.cursor.x, this.cursor.y, this.canvas.target.$element);
    this._doPaint(x, y, 0, true);
  }

  _doPaint(x, y, startDetailLevel, scatter) {
    const xPercent = x / this.elementWidth;
    const yPercent = y / this.elementWidth;
    if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || xPercent > 1 || yPercent > 1) {
      return;
    }

    const color = this.canvas.getColorAtCoordinates(x, y);
    if (color === null) return;

    //check detail level already painted at each level.
    //If not painted, paint it. Otherwise, check next level
    const gl = this.gridblocksAtDetailLevel.length;
    for (let d = startDetailLevel; d < gl; d++) {
      //refactor to foreach?

      const gb = this.gridblocksAtDetailLevel[d]; //the number of gridlines that a pixel should span
      const gx = Math.floor((xPercent * this.numOfGridLines) / gb) * gb; //index of top gridline of pixel
      const gy = Math.floor((yPercent * this.numOfGridLines) / gb) * gb; //index of left gridline of pixel
      const detailLevel = this.detailLevels[gx][gy]; //get the detaillevel stored for this pixel

      const { x: x2, y: y2, w, h } = this.getGridRectangle(gx, gy, gb);

      if (detailLevel == -1) {
        // this has been set, but is queued up to delay increasing resolution immediately
      } else if (this.detailLevels[gx][gy] < d + 1) {
        if (detailLevel < this.gridblocksAtDetailLevel.length - 1) {
          this.canvas.drawRect(x2, y2, w, h, color);
          //this.canvas.drawTestRect(x2, y2, w, h, "red");
          this.addDetailLevel(gx, gy, d + 1);
        } else {
          if (detailLevel == 9) {
            //already at max detail. fill in some area around it.
            //const { x: x3, y: y3, w: w3, h: h3 } = this.getGridRectangle(gx - 1, gy - 1, gb * 1);
            //this.canvas.stamp(x3, y3, w3, h3);
          } else {
            const { x: x3, y: y3, w: w3, h: h3 } = this.getGridRectangle(gx, gy, gb * 2);
            this.canvas.stamp(x3, y3, w3, h3);
            this.addDetailLevel(gx, gy, 9);
          }
        }
        break; //we've drawn at this detail level. Stop checking for higher detail
      }

      //draw some scatter to speed up and improve painting (but don't recurse!)
      if (scatter) {
        const xOffset = Math.random() > 0.5 ? w : -w;
        const yOffset = Math.random() > 0.5 ? h : -h;
        if (d > 2) this._doPaint(x + xOffset / 2, y + yOffset / 2, startDetailLevel, false);
        if (d > 3) {
          this._doPaint(x + yOffset, y + xOffset, startDetailLevel, false);
          this._doPaint(x - yOffset, y + xOffset, startDetailLevel, false);
        }
        if (d > 4) {
          const xOffset2 = Math.random() > 0.5 ? w : -w;
          const yOffset2 = Math.random() > 0.5 ? h : -h;
          this._doPaint(x + xOffset2, y + yOffset2, startDetailLevel, false);
          this._doPaint(x + yOffset, y - xOffset, startDetailLevel, false);
        }
      }
    }
  }

  addDetailLevel(x, y, d) {
    this.detailLevels[x][y] = -1;
    this.detailQueue.push({ x, y, d });

    if (this.detailQueue.length > 10) {
      const q = this.detailQueue.shift();
      this.detailLevels[q.x][q.y] = Math.max(this.detailLevels[q.x][q.y], q.d);
    }
  }

  getGridRectangle(xIndex, yIndex, size) {
    const x = this.gridLines[xIndex];
    const y = this.gridLines[yIndex];
    const w = this.gridLines[xIndex + size] - this.gridLines[xIndex];
    const h = this.gridLines[yIndex + size] - this.gridLines[yIndex];
    return { x, y, w, h };
  }

  revealAll(clickX, clickY) {
    let counter = 0;
    const { x, y } = getCoordinatesRelativeToCanvas(clickX, clickY, this.canvas.target.$element);
    let revealInterval = setInterval(() => {
      if (counter < 500) {
        for (let i = 0; i < 150; i++) {
          const radians = Math.random() * Math.PI * 2;
          //const distance = Math.max(5, (counter / 300 - Math.random()) * 30 * this.graphicWidth);
          const distance = (counter / 500) * this.graphicWidth * (Math.random() + 0.3);
          const { x: x1, y: y1 } = getNewCoordinates(x, y, radians, distance);
          this._doPaint(x1, y1, 3, false);
        }
      }
      if (counter > 300) {
        const opacity = (counter - 300) / 300;
        $("#source").css("opacity", opacity);
      }

      counter++;
      if (counter > 600) clearInterval(revealInterval);
    }, 10);
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }
}

export default PixelPainter;
