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
    layers[0].fillStyle = "#CCCCFF";
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
const paint = (x,y,v) => {
    
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
