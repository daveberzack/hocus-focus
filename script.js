const clueEl = document.getElementById('clue');
const game = document.getElementById('game');
const pic = document.getElementById('pic');
let picContext;
const hit = document.getElementById('hit');
const timerLabel = document.getElementById('timer-label');
let hitContext;

const gameRect = game.getBoundingClientRect();
console.log(gameRect);
const gameTop = gameRect.x;
const gameLeft = gameRect.y;
let mouseX = -1;
let mouseY = -1;
let prevX = -1;
let prevY = -1;
const naturalPGameWidth = 1000;
const actualGameWidth = pic.offsetWidth;
const maxX = pic.offsetWidth;
const maxY = pic.offsetHeight;
let hasWon = false;
let loopInterval;
let layers;
const gameLoopIncrement = 10;
let timePassed = 0;
let velocity = 0;
let timerWidth = 0;
let hasStarted = false;

function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
}

const drawCircle = (x,y,r,hex,layerIndex) => {
    const ctx = layers[layerIndex];
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 360, false);
    ctx.fill();
}

const drawRect = (x,y,r,hex,layerIndex) => {
    let w;
    let h;
    if (Math.random()>.5) {
        w = r*Math.random()*4;
        h = r*Math.random();
    }
    else {
        h = r*Math.random()*3;
        w = r*Math.random();
    }
    const ctx = layers[layerIndex];
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.rect( x-r, y-r, w, h);
    ctx.fill();
}

//draw circle based on position and color. size and which layer based on velocity
const paint = (x_in,y_in,v) => {
    const x = x_in*naturalPGameWidth/actualGameWidth;
    const y = y_in*naturalPGameWidth/actualGameWidth;
    
    const p = picContext.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

    if (v>30) layerIndex=0;
    else if (v>20) layerIndex=1;
    else if (v>12) layerIndex=2;
    else if (v>8) layerIndex=3;
    else if (v>4) layerIndex=4;
    else if (v>2) layerIndex=5;
    else if (v>1) layerIndex=6;
    else layerIndex=7;
    const r = v;
    if (Math.random()>1) drawRect(x,y,r,hex,layerIndex);
    else drawCircle(x,y,r,hex,layerIndex);
}


const setUpScreen = ({name, clue})=>{
    
    clueEl.textContent = clue;
    //set up canvases, consts and variables
    picContext = pic.getContext('2d');
    const picImage = new Image;
    picImage.onload = function(){
        picContext.drawImage(picImage,0,0, 1000, 1000);
    };
    picImage.src = './img/'+name+'.jpg';

    hitContext = hit.getContext('2d');
    const hitImage = new Image;
    hitImage.onload = function(){
        hitContext.drawImage(hitImage,0,0, 1000, 1000);
    };
    hitImage.src = './img/'+name+'_hit.jpg';

    layers = [];
    for (let i=0; i<8; i++){
        const l = document.getElementById('paint'+i);
        layers[i] = l.getContext('2d');
    }

}

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
            paint(Math.random()*maxX, Math.random()*maxY, Math.random()*vFactor);
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
    const p = hitContext.getImageData(mouseX*naturalPGameWidth/actualGameWidth, mouseY*naturalPGameWidth/actualGameWidth, 1, 1).data;
    const hex = rgbToHex(p[0], p[1], p[2]);
    const hitSuccess = (hex==0);
    if (hitSuccess){
        doWin();
    }
    else {
        doPenalty();
    }
}
const gameLoop = () => {
    if (hasWon) return;
    if (hasStarted) timePassed = timePassed + gameLoopIncrement/1000;
    const w = Math.min(timePassed*100/60, 100);
    timerWidth = (timerWidth*3+w)/4;
    timerLabel.style.width = timerWidth+"%";
    timerLabel.textContent = Math.floor(timePassed);
    const isInArea = mouseX>=0 && mouseY>=0 && mouseX<=maxX && mouseY<=maxY;
    
    if (isInArea){
        hasStarted = true;
        if (prevX>=0 && prevY>=0){
            
            let newV = Math.sqrt( (prevX-mouseX)*(prevX-mouseX) + (prevY-mouseY)*(prevY-mouseY) );
            let v = (velocity*2+newV)/3;
            velocity =v;
            if (v>40) v=40;
            for (let i=0; i<20; i++){
                const paintX = mouseX + (Math.random()-.5)*v*2;
                const paintY = mouseY + (Math.random()-.5)*v*2;
                paint(paintX, paintY, v*(Math.random()*1+.75));
            }
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
    setUpScreen( data[challenge] );

    //constantly update mouse position
    document.addEventListener('mousemove', e => {
        console.log(e.pageX+","+e.pageY);
        mouseX = e.pageX-gameLeft;
        mouseY = e.pageY-gameTop;
    });
    
    game.addEventListener('mouseup', onClick);

    //on interval, use position, velocity and pixel of source to call paint
    loopInterval = setInterval( gameLoop, gameLoopIncrement );
}

fetch("data.json")
  .then(response => response.json())
  .then(json => startGame(json));
