const $hitDrawing = $("#hit-drawing");
const $hitApplied = $("#hit-applied");
const hitDrawing = document.getElementById("hit-drawing");
const hitDrawingContext = hitDrawing.getContext("2d");
const hitAppliedContext = document.getElementById("hit-applied").getContext("2d");

let canvasWidth = $hitDrawing.width();
let drawingWidth = 1000;

let currentStroke = { x1: null, y1: null, x2: null, y2: null, w: 120 };
let isDrawing = false;
let strokes = [];

function getCoordinatesRelativeToCanvas(x0, y0) {
  const offset = $hitDrawing.offset();
  const x = ((x0 - offset.left) * drawingWidth) / canvasWidth;
  const y = ((y0 - offset.top) * drawingWidth) / canvasWidth;
  return { x, y };
}

const updateDrawing = () => {
  if (isDrawing) {
    clearCanvas(hitDrawingContext);
    drawLine(hitDrawingContext, currentStroke);
  }
};

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, drawingWidth, drawingWidth);
};
const blackCanvas = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, drawingWidth, drawingWidth);
};

const drawLine = (ctx, { x1, y1, x2, y2, w }) => {
  if (x1 == null || y1 == null || x2 == null || y2 == null) return;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};
const applyDrawing = () => {
  hitAppliedContext.drawImage(hitDrawing, 0, 0);
  if (currentStroke.x1 != null && currentStroke.y1 != null && currentStroke.x2 != null && currentStroke.y2 != null) {
    strokes.push({
      x1: (currentStroke.x1 * 100) / drawingWidth,
      y1: (currentStroke.y1 * 100) / drawingWidth,
      x2: (currentStroke.x2 * 100) / drawingWidth,
      y2: (currentStroke.y2 * 100) / drawingWidth,
      w: (currentStroke.w * 100) / drawingWidth,
    });
  }
};

const handleMove = (x, y) => {
  const { x: newX, y: newY } = getCoordinatesRelativeToCanvas(x, y);
  if (!isDrawing) {
    currentStroke.x1 = newX;
    currentStroke.y1 = newY;
  } else {
    currentStroke.x2 = newX;
    currentStroke.y2 = newY;
  }
};

$("body").on({
  mousemove: (e) => {
    handleMove(e.clientX, e.clientY);
  },
  touchmove: (e) => {
    handleMove(e.clientX, e.clientY);
  },
  mouseup: (e) => {
    isDrawing = false;
    applyDrawing();
    clearCanvas(hitDrawingContext);
    currentStroke.x1 = null;
    currentStroke.y1 = null;
    currentStroke.x2 = null;
    currentStroke.y2 = null;
  },
});
$hitDrawing.mousedown((e) => {
  isDrawing = true;
});

$("#clear-hit").click(() => {
  strokes = [];
  blackCanvas(hitAppliedContext);
});

$("#small-brush").click(() => {
  currentStroke.w = 80;
});
$("#medium-brush").click(() => {
  currentStroke.w = 120;
});
$("#large-brush").click(() => {
  currentStroke.w = 180;
});

blackCanvas(hitAppliedContext);

setInterval(() => {
  updateDrawing();
}, 50);

export { strokes };
