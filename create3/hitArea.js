const $hitDrawing = $("#hit-drawing");
const $hitApplied = $("#hit-applied");
const hitDrawing = document.getElementById("hit-drawing");
const hitDrawingContext = hitDrawing.getContext("2d");
const hitAppliedContext = document.getElementById("hit-applied").getContext("2d");

let drawingWidth = 1000;
let isActive = false;
const setHitActive = (value)=> {
  isActive = value;
}

let currentStroke = { x1: null, y1: null, x2: null, y2: null, w: 120 };
let isDrawing = false;
let strokes = [];
const clearStrokes = ()=> {
  strokes = [];
  blackCanvas(hitAppliedContext);
}
function getCoordinatesRelativeToCanvas(x0, y0) {
  const canvasWidth = $hitDrawing.width();
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
  if (isDrawing) {
    currentStroke.x2 = newX;
    currentStroke.y2 = newY;
  }
};

$("body").on({
  mousemove: (e) => {
    handleMove(e.clientX, e.clientY);
  },
  touchmove: (e) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}).bind("mouseup touchend", (e) => {
  isDrawing = false;
  applyDrawing();
  clearCanvas(hitDrawingContext);
  currentStroke.x1 = null;
  currentStroke.y1 = null;
  currentStroke.x2 = null;
  currentStroke.y2 = null;
});
$hitDrawing.bind("mousedown", (e) => {
  startDrawing(e.clientX, e.clientY);
});
$hitDrawing.bind("touchstart", (e) => {
  startDrawing(e.touches[0].clientX, e.touches[0].clientY);
});
const startDrawing = (x1,y1)=>{
  isDrawing = true;
  const {x,y} = getCoordinatesRelativeToCanvas(x1,y1);
  currentStroke.x1 = x
  currentStroke.y1 = y;
}
$("#clear-hit").click((e) => {
  e.preventDefault();
  strokes = [];
  blackCanvas(hitAppliedContext);
});

blackCanvas(hitAppliedContext);

let hitInterval;
const startHitInterval = ()=>{
  clearInterval(hitInterval);
  hitInterval = setInterval(() => {
    updateDrawing();
  }, 50);
}
const clearHitInterval = ()=>{
  clearInterval(hitInterval);
}



export { strokes, clearStrokes, setHitActive, startHitInterval, clearHitInterval };