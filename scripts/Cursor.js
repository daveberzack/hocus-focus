class Cursor {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.x = 0;
    this.y = 0;
  }

  handleMove(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default Cursor;
