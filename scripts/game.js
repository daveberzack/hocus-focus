const clueEl = document.getElementById('clue');
const game = document.getElementById('game');
const timerLabel = document.getElementById('timer-label');

const canvasDimensions = 1000;
const gameRect = game.getBoundingClientRect();

console.log(gameRect);
const gameTop = gameRect.x;
const gameLeft = gameRect.y;

let hasWon = false;
let loopInterval;
const gameLoopIncrement = 10;
let velocity = 0;

const doWin =()=>{
    hasWon = true;
    clearInterval(loopInterval);

    const minV = 1;
    const maxV = 60;
    const appearFrames = 400;
    let appearCounter=0;
    let appearInterval = setInterval(()=>{
        vFactor = minV + (maxV-minV)* (1-appearCounter/appearFrames);
        for (let i=0; i<15; i++){
            //const x = x_in*naturalGameWidth/actualGameWidth;
            paint(Math.random()*canvasDimensions, Math.random()*canvasDimensions, Math.random()*vFactor);
        }
        if (appearCounter>appearFrames) clearInterval(appearInterval);
        pic.style.opacity = Math.pow(appearCounter/appearFrames, 2) ;
        appearCounter++;
    },10);

}

const doPenalty =()=>{
    timePassed +=10;
    timerLabel.style.backgroundColor = "#FF0000";
    setTimeout( ()=>{
        timerLabel.style.backgroundColor = "#000000";
    },500);
}

const onClick = () => {
    if (hasWon) return;
    const p = hitContext.getImageData(mouseX*canvasDimensions/actualGameWidth, mouseY*canvasDimensions/actualGameWidth, 1, 1).data;
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
    timerLabel.style.width = timerWidth+"%";
    timerLabel.textContent = Math.floor(timePassed);
}


let mouseX = -1;
let mouseY = -1;
const gameLoop = () => {
    if (hasWon) return;
    
    const {x, y} = pageCoordinatesToCanvasCoordinates(mouseX, mouseY);
    const inArea = (x>=0 && y >=0);
    if (inArea){
        hasStarted = true;
        doPaint(x, y);
    }
    
    if (hasStarted) {
        updateTimer();
    }

}

const actualGameWidth = pic.offsetWidth;
const maxX = pic.offsetWidth;
const maxY = pic.offsetHeight;
const pageCoordinatesToCanvasCoordinates = (mx, my) => {

    //subtract the top/left margin. then multiply by dimensions/visualWidth
    const x=mx;
    const y = my;
    console.log(x+","+y);
    return {x, y};
}


let prevX = -1;
let prevY = -1;
const doPaint = (x, y) => {

    if (prevX>=0 && prevY>=0){
            
        let newV = Math.sqrt( (prevX-mouseX)*(prevX-mouseX) + (prevY-mouseY)*(prevY-mouseY) );
        let v = (velocity*2+newV)/3;
        velocity =v;
        if (v>40) v=40;
        for (let i=0; i<20; i++){
            const paintX = mouseX + (Math.random()-.5)*v*2;
            const paintY = mouseY + (Math.random()-.5)*v*2;
            paint(paintX*canvasDimensions/actualGameWidth, paintY*canvasDimensions/actualGameWidth, v*(Math.random()*1+.75));
        }
        
        prevX=mouseX;
        prevY=mouseY;
    }
    else {
        prevX=-1;
        prevY=-1;
    }

}



const startGame = (data) => {

    const challenge = Math.floor( Math.random()*data.length );
    clueEl.textContent = data[challenge].clue;
    setUpCanvases( data[challenge].name, canvasDimensions );

    document.addEventListener('mousemove', e => {
        //console.log(e.pageX+","+e.pageY);
        mouseX = e.pageX;
        mouseY = e.pageY;
    });
    
    game.addEventListener('mouseup', onClick);
    loopInterval = setInterval( gameLoop, gameLoopIncrement );
}

fetch("data.json")
  .then(response => response.json())
  .then(json => startGame(json));
