import Canvas from './Canvas.js';
import DirectCursor from './DirectCursor.js';
import TouchCursor from './TouchCursor.js';
import PixelPainter from './PixelPainter.js';
import { isInCanvas } from './utils.js';

const GAME_LOOP_INCREMENT = 10;

class Game {

    constructor(){
        this.$timerLabel = $("#timer-label");
        this.$clue = $("#clue");
        this.hasWon = false;
        this.isPlaying = false;
        this.cursor = new TouchCursor($("#pic"), this.handleCursorClick);
    }

    startGame = (challenge)=>{
        this.painter?.stopReveal();
        this.canvas = new Canvas(challenge);
        this.painter = new PixelPainter(this.canvas, this.cursor);

        this.isPlaying=true;
        this.timePassed = 0;
        this.timerWidth = 0;
        this.$clue.html(challenge.clue);
        
        let self = this;
        clearInterval(this.loopInterval);
        this.loopInterval = setInterval( () => { self.doGameLoop(); }, GAME_LOOP_INCREMENT );
        $("#game-buttons").hide();
    }
    
    doGameLoop = ()=>{
        if (!this.isPlaying) return;
        this.painter.paint();
        this.updateTimer();
    }
    
    updateTimer = ()=>{
        this.timePassed = this.timePassed + GAME_LOOP_INCREMENT/1000;
        const w = Math.min(this.timePassed*100/60, 100);
        this.timerWidth = (this.timerWidth*3+w)/4; //animate
        this.$timerLabel.width(this.timerWidth+"%");
        this.$timerLabel.text( Math.floor(this.timePassed) );
    }
    
    handlePenalty = ()=>{
        this.timePassed +=10;
        this.$timerLabel.css("background-color", "#FF0000");
        setTimeout( ()=>{
            this.$timerLabel.css("backgroundColor", "#FFFFFF");
        },500);
    }

    handleWin = ()=>{
        this.hasWon = true;
        this.isPlaying = false;
        clearInterval(this.loopInterval);
        this.painter.revealAll(this.cursor.x, this.cursor.y);
        $("#game-buttons").show();
    }

    handleCursorClick = ()=>{
        if ( this.isPlaying && this.timePassed>1 && isInCanvas(this.cursor.x, this.cursor.y, this.canvas.pic.$element) ){
            const isGuessCorrect = this.canvas.checkGuess(this.cursor.x, this.cursor.y);
            if (isGuessCorrect) this.handleWin();
            else this.handlePenalty();
        }
        
    }
}
  
export default Game;
