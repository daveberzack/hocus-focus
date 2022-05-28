const clueEl = document.getElementById('clue');
const game = document.getElementById('game');
const pic = document.getElementById('pic');
let picContext;
const hit = document.getElementById('hit');
const timerLabel = document.getElementById('timer-label');
let hitContext;

const gameRect = game.getBoundingClientRect();
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