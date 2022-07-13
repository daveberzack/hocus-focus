import Cursor from "./Cursor.js";

class DirectCursor extends Cursor {

    constructor(canvasElement){
        super(canvasElement);
    }
    
    handleMove(x, y){
        this.x = x;
        this.y = y;
    }
}
  
export default DirectCursor;