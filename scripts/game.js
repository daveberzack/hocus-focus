
const $timerLabel = $("#timer-label");

const $clue = $("#clue");
const $game = $("#game");
const gameWidth = $game.width();

const canvasDimensions = 1000;
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
        $timerLabel.css("backgroundColor", "#000000");
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
    
    if (isInGameArea){
        hasStarted = true;
        if (prevX>=0 && prevY>=0){
            let newV = Math.sqrt( (prevX-xPos)*(prevX-xPos) + (prevY-yPos)*(prevY-yPos) );
            let v = (velocity*2+newV)/3;
            velocity = Math.min(40, v);
            doPaint();
        }
        prevX=xPos;
        prevY=yPos;
    }
    else {
        prevX=-1;
        prevY=-1;
    }
    
    if (hasStarted) {
        updateTimer();
    }

}

const doPaint = () => {
    for (let i=0; i<20; i++){
        const paintX = xPos + (Math.random()-.5)*velocity*2;
        const paintY = yPos + (Math.random()-.5)*velocity*2;
        paint(paintX, paintY, velocity*(Math.random()*1+.75));
    }
}

const startGame = (data) => {

    document.addEventListener("touchmove", (e)=> {e.preventDefault();}, {passive: false});

    const challenge = Math.floor( Math.random()*data.length );
    $clue.html(data[challenge].clue);
    setUpCanvases( data[challenge].name, canvasDimensions );

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

    loopInterval = setInterval( gameLoop, gameLoopIncrement );
}

fetch("data.json")
  .then(response => response.json())
  .then(json => startGame(json));