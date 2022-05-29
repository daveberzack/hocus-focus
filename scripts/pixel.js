const pic = document.getElementById('pic');
let picContext;
const hit = document.getElementById('hit');
let hitContext;
let layers;
const layerResolutions = [256,128,64,32,16,8,4];

const setUpCanvases = (imageName, d)=>{

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
        layers[i].clearRect(0, 0, d, d);
    }

    layers[0].beginPath();
    layers[0].rect(0, 0, d, d);
    layers[0].fillStyle = "#FFFFFF";
    layers[0].fill();

}

function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
}


const stamp = (x,y,r,layer) => {
        const d = picContext.getImageData(x-r, y-r, 2*r+1, 2*r+1);
        if (d) layers[layer].putImageData(d, x-r, y-r);
}

const pixel = (x,y,res,layerIndex) => {
    const p = picContext.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    const paintX = Math.floor(x/res)*res;
    const paintY = Math.floor(y/res)*res;

    const ctx = layers[layerIndex];
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.rect(paintX, paintY, res, res);
    ctx.fill();
}

const sprayPixels = (x,y,res,layerIndex, n) => {
    pixel(x, y, res, layerIndex);
    for (let i=0; i<n-1; i++){
        let px = Math.max(0, x + (Math.random()-.5) *res*3 );
        let py = Math.max(0, y + (Math.random()-.5) *res*3 );
        pixel(px, py, res, layerIndex);
    }
}

const getLayerIndex = (v)=>{
    if      (v<3)  return 6;
    else if (v<6)  return 5;
    else if (v<10) return 4;
    else if (v<15) return 3;
    else if (v<25) return 2;
    else if (v<35) return 1;
    else return 0;
}


const doPaint = (x, y, v) => {

    if (v<.1) return;
    else if (v<3){
        for (let i=0; i<3; i++){
            let px = x + (Math.random()-.5)*10;
            let py = y + (Math.random()-.5)*10;
            stamp(px,py,1,7);
            sprayPixels(x,y,layerResolutions[5],layerIndex, 1);
        }
    }
    else {
        let layerIndex= getLayerIndex(v);
        sprayPixels(x,y,layerResolutions[layerIndex],layerIndex, 2);
        if(layerIndex>0) sprayPixels(x,y,layerResolutions[layerIndex-1],layerIndex-1, 1);
    }

}

const hidePic = ()=> {
    pic.style.opacity = 0;
}

const revealAll = (clickX, clickY, dimension)=> {
    
    const minV = 1;
    const maxV = 20;
    const appearFrames = 300;
    let appearCounter=0;
    const margin=50;

    let appearInterval = setInterval(()=>{
        appearCounter++;

        let opacity = Math.pow(appearCounter/appearFrames, 2);
        pic.style.opacity = opacity;

        vFactor = minV + (maxV-minV)* (1-appearCounter/appearFrames);
        for (let i=0; i<200; i++){
            const v = Math.random()*vFactor*3*appearCounter/appearFrames;
            const d = (Math.random()+.25) * dimension * appearCounter/appearFrames +v*10;
            const a = Math.random()*Math.PI*2;
            const {x, y} = getNewCoordinates(clickX, clickY, a, d);
            const layerIndex = getLayerIndex(v);
            const res = layerResolutions[layerIndex];
            if (x>-margin && y>-margin && x<dimension+margin && y<dimension+margin){
                pixel(x, y, res, layerIndex);
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