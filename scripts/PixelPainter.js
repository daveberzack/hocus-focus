import {rgbToHex, getNewCoordinates, getCanvasCoordinates} from './utils.js';
import Painter from './Painter.js';

class PixelPainter extends Painter{

    constructor(canvas, cursor){
        super(canvas, cursor);
        this.layerResolutions = [256,128,64,32,16,8,4];
    }

    paint() {
        const $elem = this.canvas.pic.$element;
        const rect = $elem.offset();
        const elementWidth = $elem.width();
        const graphicWidth = $elem.attr("width");

        const x = (this.cursor.x-rect.left) * graphicWidth/elementWidth;
        const y = (this.cursor.y-rect.top) * graphicWidth/elementWidth;

        if (x>=0 && y>=0 && x<=this.canvas.graphicWidth && y<=this.canvas.graphicWidth || this.prevX!==undefined) {
            
            const v = Math.sqrt( (x-this.prevX)*(x-this.prevX) +(y-this.prevY)*(y-this.prevY) );
            if (v<.1) return;
            else if (v<2){
                for (let i=0; i<5; i++){
                    const px = x + (Math.random()-.5)*20;
                    const py = y + (Math.random()-.5)*20;
                    const r = Math.random()>.5 ? 1:2;
                    this._stamp(px,py,r,7);
                }
                this._sprayPixels(x,y,this.layerResolutions[6],6, 1);
                this._sprayPixels(x,y,this.layerResolutions[5],5, 1);
            }
            else {
                const layerIndex= this._getLayerIndex(v);
                this._sprayPixels(x,y,this.layerResolutions[layerIndex],layerIndex, 2);
                if(layerIndex>0) this._sprayPixels(x,y,this.layerResolutions[layerIndex-1],layerIndex-1, 1);
            }

        }
        this.prevX=x;
        this.prevY=y;
    }

    revealAll(clickX, clickY){
        const $canvas = this.canvas.pic.$element;
        const {x, y} = getCanvasCoordinates(clickX, clickY, $canvas);
        const dimension = $canvas.attr("width");
        const minV = 1;
        const maxV = 20;
        const appearFrames = 300;
        let appearCounter=0;
        const margin=50;

        if (this.appearInterval) clearInterval(this.appearInterval);
        this.appearInterval = setInterval(()=>{
            appearCounter++;
            appearCounter++;

            let opacity = Math.pow(appearCounter/appearFrames, 2);
            pic.style.opacity = opacity;

            const vFactor = minV + (maxV-minV)* (1-appearCounter/appearFrames);
            for (let i=0; i<200; i++){
                const v = Math.random()*vFactor*3*appearCounter/appearFrames;
                const d = (Math.random()+.25) * dimension * appearCounter/appearFrames +v*10;
                const a = Math.random()*Math.PI*2;
                const {x:x1, y:y1} = getNewCoordinates(x, y, a, d);
                const layerIndex = this._getLayerIndex(v);
                const res = this.layerResolutions[layerIndex];
                if (x1>-margin && y1>-margin && x1<dimension+margin && y1<dimension+margin){
                    this._pixel(x1, y1, res, layerIndex);
                }
                
            }

            if (appearCounter>appearFrames) clearInterval(this.appearInterval);
        },10);
        
    }

    stopReveal(){
        if (this.appearInterval) clearInterval(this.appearInterval);
    }

    _stamp(x,y,r,layer){
        const d = this.canvas.pic.context.getImageData(x-r, y-r, 2*r+1, 2*r+1);
        if (d) this.canvas.layers[layer].context.putImageData(d, x-r, y-r);
    }

    _pixel(x,y,res,layerIndex){
        const p = this.canvas.pic.context.getImageData(x, y, 1, 1).data;
        const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        const paintX = Math.floor(x/res)*res;
        const paintY = Math.floor(y/res)*res;

        const ctx = this.canvas.layers[layerIndex].context;
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.rect(paintX, paintY, res, res);
        ctx.fill();
    }

    _sprayPixels(x,y,res,layerIndex, n){
        this._pixel(x, y, res, layerIndex);
        for (let i=0; i<n-1; i++){
            let px = Math.max(0, x + (Math.random()-.5) *res*3 );
            let py = Math.max(0, y + (Math.random()-.5) *res*3 );
            this._pixel(px, py, res, layerIndex);
        }
    }

    _getLayerIndex(v){
        if      (v<2)  return 6;
        else if (v<4)  return 5;
        else if (v<7) return 4;
        else if (v<12) return 3;
        else if (v<20) return 2;
        else if (v<35) return 1;
        else return 0;
    }
}
  
export default PixelPainter;