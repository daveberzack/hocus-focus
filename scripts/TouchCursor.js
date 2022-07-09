import Cursor from "./Cursor.js";

class TouchCursor extends Cursor {

    constructor(canvasElement, handleCursorClick){
        super(canvasElement, handleCursorClick);
    }
    
    addMouseListeners(){
        const area = document.querySelector('#board');

        area.addEventListener('touchmove', e =>{
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.handleMove(touch.pageX, touch.pageY);
        }, { passive: false })

        area.addEventListener('click', e => {
            this.handleMove(e.pageX, e.pageY);
            this.handleCursorClick();
        });
    }

    handleMove(x, y){
        this.x = x;
        this.y = y;
    }
}
  
export default TouchCursor;