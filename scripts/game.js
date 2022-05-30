const $timerLabel = $("#timer-label");
const $clue = $("#clue");
const $game = $("#game");
const $reset = $("#reset");
const gameWidth = $game.width();

const canvasDimensions = 512;
const gameLoopIncrement = 10;
let loopInterval;
let xPos=0;
let yPos=0;
let prevX = -1;
let prevY = -1;
let velocity = 0;
let isInGameArea=true;
let hasWon = false;
const isTouchDevice = (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));

const doWin =()=>{
    hasWon = true;
    clearInterval(loopInterval);
    revealAll(xPos, yPos, canvasDimensions);
}

const doPenalty =()=>{
    timePassed +=10;
    $timerLabel.css("background-color", "#FF0000");
    setTimeout( ()=>{
        $timerLabel.css("backgroundColor", "#FFFFFF");
    },500);
}

const handleGuess = (e) => {
    if (hasWon) return;

    const p = hitContext.getImageData(xPos, yPos, 1, 1).data;
    const hex = rgbToHex(p[0], p[1], p[2]);
    const hitSuccess = (hex==0);
    if (hitSuccess){
        doWin();
    }
    else {
        doPenalty();
    }
}


let timePassed = 0;
let timerWidth = 0;
let hasStarted = false;
const updateTimer = () => {
    timePassed = timePassed + gameLoopIncrement/1000;
    const w = Math.min(timePassed*100/60, 100);
    timerWidth = (timerWidth*3+w)/4; //animate
    $timerLabel.width(timerWidth+"%");
    $timerLabel.text( Math.floor(timePassed) );
}

const gameLoop = () => {
    if (hasWon) return;
    
    let newV = Math.sqrt( (prevX-xPos)*(prevX-xPos) + (prevY-yPos)*(prevY-yPos) );
    let v = (velocity*8+newV)/9;
    velocity = Math.min(40, v);
    if (velocity<.1) velocity=0;

    if (isInGameArea){
        hasStarted = true;
        
        doPaint(xPos, yPos, velocity);
        prevX=xPos;
        prevY=yPos;
    }
    
    if (hasStarted) {
        updateTimer();
    }

}

let challenge;
const startGame = () => {
    hidePic();
    hasWon=false;
    timePassed = 0;
    timerWidth = 0;
    hasStarted = false;
    //document.addEventListener("touchmove", (e)=> {e.preventDefault();}, {passive: false});
    $clue.html(challenge.clue);
    setUpCanvases( challenge.name, canvasDimensions );
    clearInterval(loopInterval);
    loopInterval = setInterval( gameLoop, gameLoopIncrement );
}

const updateMousePosition = (x, y)=> {
    var rect = $game.offset();
    xPos  = (x - rect.left) * canvasDimensions/gameWidth;
    yPos = (y - rect.top) * canvasDimensions/gameWidth;
}

if (!isTouchDevice){
    $game.mousemove(e => {
        updateMousePosition(e.clientX, e.clientY);
     });
}
else {
    $('body').on('touchmove', e => {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY-80);
    });
}



// $game.mouseenter(e => {
//     isInGameArea=true;
// });

// $game.mouseleave(e => {
//     isInGameArea=false;
// });


// $('body').on('touchstart', function(e){
//     isInGameArea=true;
// });

// $('body').on('touchend', function(e){
//     isInGameArea=false;
// });


$game.click(handleGuess);

$reset.click(startGame);


fetch("data.json")
  .then(response => response.json())
  .then(json => {
      challengeIndex = Math.floor( Math.random()*json.length );
      challenge = json[challengeIndex];
      startGame();
  });