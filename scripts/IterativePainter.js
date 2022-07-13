import {rgbToHex, getNewCoordinates, getCanvasCoordinates} from './utils.js';
import Painter from './Painter.js';

class IterativePainter extends Painter{

    constructor(canvas, cursor){
        super(canvas, cursor);
        this.layerResolutions = [256,128,64,32,16,8,4];
        this.detailStack =[];
        this.detailFactor=25;
    }

    paint() {
        const $elem = this.canvas.pic.$element;
        const rect = $elem.offset();
        const elementWidth = $elem.width();
        const graphicWidth = $elem.attr("width");

        const x = (this.cursor.x-rect.left) * graphicWidth/elementWidth;
        const y = (this.cursor.y-rect.top) * graphicWidth/elementWidth;

        if (x>=0 && y>=0 && x<=this.canvas.graphicWidth && y<=this.canvas.graphicWidth) {
            
            const xOffset = (Math.random()-.5)*2 *15;
            const yOffset = (Math.random()-.5)*2 *15;
            this._doPaint(x+xOffset, y+yOffset);
            this._doPaint(x, y);
            
        }
    }

    _doPaint(x,y){
        //get the detail level from the detail canvas
        const detailLevel = this._getDetailLevel(x, y) +1;

        const c = detailLevel*this.detailFactor;
        const hex = "#"+("000000"+rgbToHex(c, c, c)).slice(-6);
        const w = this.layerResolutions[detailLevel];
        const ctx = this.canvas.detail.context;
        this.detailStack.push({x,y,w,hex,ctx});

        if (this.detailStack.length>3){
            const d = this.detailStack.shift();
            this._pixel(d.x,d.y,d.w,d.hex,d.ctx);
        }
        
        if (detailLevel<7){
            const p = this.canvas.pic.context.getImageData(x, y, 1, 1).data;
            const hex2 = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            const ctx2 = this.canvas.layers[detailLevel].context;
            this._pixel(x,y,this.layerResolutions[detailLevel], hex2, ctx2);
        }
        else {
            this._stamp(x,y,8,this.canvas.layers[detailLevel].context)
        }
    }

    revealAll(clickX, clickY){
            const $canvas = this.canvas.pic.$element;
            const {x, y} = getCanvasCoordinates(clickX, clickY, $canvas);
            const dimension = $canvas.attr("width");
            const minV = 1;
            const maxV = 20;
            const appearFrames = 1200;
            let appearCounter=0;
            const margin=50;
    
            if (this.appearInterval) clearInterval(this.appearInterval);
            this.appearInterval = setInterval(()=>{
                appearCounter++;
                appearCounter++;
    
                let opacity = Math.pow(appearCounter/appearFrames, 2); //slowly increase exponentially
                pic.style.opacity = Math.max(0, 4*opacity-.75); //only appear during the last 1/4 of the animation
    
                const vFactor = minV + (maxV-minV)* (1-appearCounter/appearFrames);
                for (let i=0; i<100; i++){
                    const v = Math.random()*vFactor*3*appearCounter/appearFrames;
                    const d = (Math.random()+.25) * dimension * appearCounter/appearFrames +v*10;
                    const a = Math.random()*Math.PI*2;
                    const {x:x1, y:y1} = getNewCoordinates(x, y, a, d);
                    if (x1>-margin && y1>-margin && x1<dimension+margin && y1<dimension+margin){
                        this._doPaint(x1, y1);
                    }
                    
                }
    
                if (appearCounter>appearFrames) clearInterval(this.appearInterval);
            },10);
        }

    stopReveal(){
        if (this.appearInterval) clearInterval(this.appearInterval);
    }

    _getDetailLevel(x,y){
        const p = this.canvas.detail.context.getImageData(x, y, 1, 1).data;
        return Math.floor(p[0]/this.detailFactor);
    }

    _stamp(x,y,w,ctx){
        const d = this.canvas.pic.context.getImageData(x-w/2, y-w/2, w, w);
        if (d) ctx.putImageData(d, x-w/2, y-w/2);
    }

    _pixel(x,y,w,color,ctx){
        const paintX = Math.floor(x/w)*w;
        const paintY = Math.floor(y/w)*w;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(paintX, paintY, w, w);
        ctx.fill();
    }

}
  
export default IterativePainter;