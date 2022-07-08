function getCanvasCoordinates(mouseX, mouseY, $canvas){
    const rect = $canvas.offset();
    const elementWidth = $canvas.width();
    const graphicWidth = $canvas.attr("width");

    const x = (mouseX-rect.left) * graphicWidth/elementWidth;
    const y = (mouseY-rect.top) * graphicWidth/elementWidth;

    return {x, y};
}

function isInCanvas(mouseX, mouseY, $canvas){
    const graphicWidth = $canvas.attr("width");
    const {x, y} = getCanvasCoordinates(mouseX, mouseY, $canvas);
    return (x>=0 && y>=0 && x<=graphicWidth && y<=graphicWidth);
}

function rgbToHex(r, g, b){
    return ((r << 16) | (g << 8) | b).toString(16);
}

function getNewCoordinates(x0,y0,radians,distance){
    const dy = distance*Math.cos(radians);
    const dx = distance*Math.sin(radians);
    return {x:x0+dx, y:y0+dy};
}

export {getCanvasCoordinates, isInCanvas, rgbToHex, getNewCoordinates};