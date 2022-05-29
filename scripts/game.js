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
let isInGameArea=false;
let hasWon = false;

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

const onClick = (e) => {
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

$game.mousemove(e => {
    var rect = e.target.getBoundingClientRect();
    xPos = (e.clientX - rect.left) * canvasDimensions/gameWidth;
    yPos = (e.clientY - rect.top) * canvasDimensions/gameWidth;
});

$game.mouseenter(e => {
    isInGameArea=true;
});

$game.mouseleave(e => {
    isInGameArea=false;
});

$game.click(onClick);

$reset.click(startGame);

fetch("data.json")
  .then(response => response.json())
  .then(json => {
      challengeIndex = Math.floor( Math.random()*json.length );
      challenge = json[challengeIndex];
      startGame();
  });