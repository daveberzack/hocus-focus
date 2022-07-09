import Cursor from "./Cursor.js";

class TouchCursor extends Cursor {

    constructor(canvasElement, handleCursorClick){
        super(canvasElement, handleCursorClick);
    }
    
    addMouseListeners(){
        const body = document.querySelector('body');

        body.addEventListener('touchmove', (evt) =>{
            evt.preventDefault();

            const touch = evt.changedTouches[0];
            this.handleMove(touch.pageX, touch.pageY);
            
        }, { passive: false })

        $('body').click(e => {
            this.handleCursorClick();
        });
    }

    handleMove(x, y){
        this.x = x;
        this.y = y;
    }
}
  
export default TouchCursor;