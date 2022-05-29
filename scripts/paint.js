const pic = document.getElementById('pic');
let picContext;
const hit = document.getElementById('hit');
let hitContext;
let layers;


const setUpCanvases = (imageName, d)=>{

    // set these up in gameEl, with dynamic number of layers
    // <canvas width="1000" height="1000" id="paint0"></canvas>
    // <canvas width="1000" height="1000" id="paint1"></canvas>
    // <canvas width="1000" height="1000" id="paint2"></canvas>
    // <canvas width="1000" height="1000" id="paint3"></canvas>
    // <canvas width="1000" height="1000" id="paint4"></canvas>
    // <canvas width="1000" height="1000" id="paint5"></canvas>
    // <canvas width="1000" height="1000" id="paint6"></canvas>
    // <canvas width="1000" height="1000" id="paint7"></canvas>
    // <canvas width="1000" height="1000" id="pic"></canvas>
    // <canvas width="1000" height="1000" id="hit"></canvas>

    
    picContext = pic.getContext('2d');
    const picImage = new Image;
    picImage.onload = function(){
        picContext.drawImage(picImage,0,0, d, d);
    };
    picImage.src = './img/'+imageName+'.jpg';

    hitContext = hit.getContext('2d');
    const hitImage = new Image;
    hitImage.onload = function(){
        hitContext.drawImage(hitImage,0,0, d, d);
    };
    hitImage.src = './img/'+imageName+'_hit.jpg';

    layers = [];
    for (let i=0; i<8; i++){
        const l = document.getElementById('paint'+i);
        layers[i] = l.getContext('2d');
    }

    layers[0].beginPath();
    layers[0].rect(0, 0, d, d);
    layers[0].fillStyle = "#FFFFFF";
    layers[0].fill();

}


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
        w = r*Math.random()*2;
        h = r*Math.random()/2;
    }
    else {
        h = r*Math.random()*2;
        w = r*Math.random()/2;
    }
    const ctx = layers[layerIndex];
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.rect( x-r, y-r, w, h);
    ctx.fill();
}


const doPaint = (x, y, v) => {

    if (v<10){
        for (let i=0; i<3; i++){
            const paintX = x + (Math.random()-.5)*v*2;
            const paintY = y + (Math.random()-.5)*v*2;
            paint(paintX, paintY, v*(Math.random()*2)+1);

            const stampX = x + (Math.random()-.5)*v*2;
            const stampY = y + (Math.random()-.5)*v*2;
            stamp(stampX,stampY,50/v,50/v,7);
        }
    }
    else if (v<20){
        for (let i=0; i<3; i++){
            const paintX = x + (Math.random()-.5)*v*2;
            const paintY = y + (Math.random()-.5)*v*2;
            paint(paintX, paintY, v*(Math.random()*2)+1);

            const stampX = x + (Math.random()-.5)*v*2;
            const stampY = y + (Math.random()-.5)*v*2;
            stamp(stampX,stampY,50/v,50/v,5);
        }
    }
    else if (v<30){
        for (let i=0; i<2; i++){
            const paintX = x + (Math.random()-.5)*v*2;
            const paintY = y + (Math.random()-.5)*v*2;
            paint(paintX, paintY, v*(Math.random()*2)+1);

            const stampX = x + (Math.random()-.5)*v*2;
            const stampY = y + (Math.random()-.5)*v*2;
            stamp(stampX,stampY,50/v,50/v,3);
        }
    }
    else {
        const numDots = Math.min(60, 40/Math.sqrt(v));
        for (let i=0; i<numDots; i++){
            const paintX = x + (Math.random()-.5)*v*2;
            const paintY = y + (Math.random()-.5)*v*2;
            paint(paintX, paintY, v*(Math.random()*1+.75));
        }
    }
    
}

//draw circle based on position and color. size and which layer based on velocity
const paint = (x,y,v) => {
    
    const p = picContext.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

    if (v>30) layerIndex=0;
    else if (v>20) layerIndex=1;
    else if (v>15) layerIndex=2;
    else if (v>10) layerIndex=3;
    else if (v>6) layerIndex=4;
    else if (v>3) layerIndex=5;
    else if (v>1) layerIndex=6;
    else layerIndex=7;
    const r = v;
    if (Math.random()>.7) drawRect(x,y,r,hex,layerIndex);
    else drawCircle(x,y,r,hex,layerIndex);
}

const stamp = (x, y, w, h, l) => {
    const x1 = x-Math.floor(w/2);
    const y1 = y-Math.floor(w/2);

    const data = picContext.getImageData(x1, y1, w, h);
    console.log("?", data)
    if (data){
        layers[l].putImageData(data, x1, y1);
    }
    
}

const revealAll = (clickX, clickY, dimension)=> {
    
    const minV = 1;
    const maxV = 60;
    const appearFrames = 400;
    let appearCounter=0;
    const margin=50;

    let appearInterval = setInterval(()=>{
        appearCounter++;

        let opacity = Math.pow(appearCounter/appearFrames, 2)+.1;
        pic.style.opacity = opacity;

        vFactor = minV + (maxV-minV)* (1-appearCounter/appearFrames);
        for (let i=0; i<50; i++){
            const v = Math.random()*vFactor*3*appearCounter/appearFrames;
            const d = (Math.random()+1) * dimension * appearCounter/appearFrames +v*10;
            const a = Math.random()*Math.PI*2;
            const {x, y} = getNewCoordinates(clickX, clickY, a, d);
            if (x>-margin && y>-margin && x<dimension+margin && y<dimension+margin){
                paint(x, y, v);
            }
            
        }

        if (appearCounter>appearFrames) clearInterval(appearInterval);
    },10);
    
}


const getNewCoordinates = (x0,y0,radians,distance) => {
    const dy = distance*Math.cos(radians);
    const dx = distance*Math.sin(radians);
    return {x:x0+dx, y:y0+dy};
}