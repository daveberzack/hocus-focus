import { rgbToHex, getNewCoordinates, getCanvasCoordinates } from "./utils.js";
import Painter from "./Painter.js";

class PixelPainter extends Painter {
  constructor(canvas, cursor, width) {
    super(canvas, cursor);
    this.gridblocksAtDetailLevel = [16, 8, 4, 2, 1];
    this.w = width;
    this.numOfGridLines = 64;
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

  _doPaint(x, y) {
    const xPercent = x / this.w;
    const yPercent = y / this.w;

    //check detail level already painted at each level.
    //If not painted, paint it. Otherwise, check next level
    const gl = this.gridblocksAtDetailLevel.length;
    for (let d = 0; d < gl; d++) {
      //refactor to foreach?

      const gb = this.gridblocksAtDetailLevel[d];
      const gx = Math.floor((xPercent * (this.numOfGridLines - 1)) / gb) * gb;
      const gy = Math.floor((yPercent * (this.numOfGridLines - 1)) / gb) * gb;

      const detailLevel = this.detailLevels[gx][gy];
      if (detailLevel == -1) {
        //break;
      } else if (this.detailLevels[gx][gy] < d + 1) {
        const x2 = this.gridLines[gx];
        const y2 = this.gridLines[gy];
        const w = this.gridLines[gx + gb] - this.gridLines[gx];
        const h = this.gridLines[gy + gb] - this.gridLines[gy];

        const color = this.canvas.getColorAtCoordinates(x, y);

        this.canvas.drawRect(x2, y2, w, h, color);
        this.addDetailLevel(gx, gy, d + 1);
        break;
      } else if (detailLevel == gl - 1) {
        this._stamp(x, y, 4);
        // const xOffset = Math.random() > 0.5 ? -4 : 4;
        // const yOffset = Math.random() > 0.5 ? -4 : 4;
        // this._stamp(x + xOffset, y + yOffset, 4);
      }
    }
  }

  addDetailLevel(x, y, d) {
    this.detailLevels[x][y] = -1;
    this.detailQueue.push({ x, y, d });

    if (this.detailQueue.length > 250) {
      const q = this.detailQueue.shift();
      this.detailLevels[q.x][q.y] = q.d;
    }
  }

  stopReveal() {
    if (this.appearInterval) clearInterval(this.appearInterval);
  }
}

export default PixelPainter;
