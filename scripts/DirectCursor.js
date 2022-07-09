import Cursor from "./Cursor.js";

class DirectCursor extends Cursor {

    constructor(canvasElement, handleCursorClick){
        super(canvasElement, handleCursorClick);
    }
    
    addMouseListeners(){
        $('body').mousemove(e => {
            this.handleMove(e.clientX,e.clientY);
        });

        $('body').mousedown(e => {
            this.handleCursorClick();
        });
    }

    handleMove(x, y){
        this.x = x;
        this.y = y;
    }
}
  
export default DirectCursor;