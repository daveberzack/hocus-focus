import Game from './Game.js';
import practiceChallenges from '../data/practiceChallenges.js';
import allChallenges from '../data/allChallenges.js';

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}


const showView = (name) => {
    $(".view").removeClass("shown");
    $("#"+name).addClass("shown");
}

let currentPracticeChallengeIndex = 0;
let currentChallenge = null;

const todayChallenge = {"name":"basket", "clue":"Click on the basket"};
const game = new Game();

$("#reset-button").click( ()=> { 
    game.startGame(currentChallenge);
});

$("#next-button").click( ()=> { 
    if (challengeIndexSelected){
        challengeIndexSelected++;
        if (challengeIndexSelected>= allChallenges.length) challengeIndexSelected=0;
        currentChallenge = allChallenges[challengeIndexSelected];
    }
    else {
        currentPracticeChallengeIndex++;
        if (currentPracticeChallengeIndex>= practiceChallenges.length) currentPracticeChallengeIndex=0;
        currentChallenge = practiceChallenges[currentPracticeChallengeIndex];
    }
    
    game.startGame(currentChallenge);
});

$("#play-button").click( ()=> { 
    currentChallenge = todayChallenge;
    game.startGame(currentChallenge);
    showView("game");
    $("#game-buttons").hide();
});

$("#practice-button").click( ()=> { 
    currentChallenge = practiceChallenges[currentPracticeChallengeIndex];
    game.startGame(currentChallenge);
    showView("game");
    $("#game-buttons").show();
});

$("#intro-button").click( ()=> { 
    showView("intro");
});

$("#instructions-button").click( ()=> { 
    showView("instructions");
});


let challengeIndexSelected = $.urlParam('id')
if (challengeIndexSelected) {
    currentChallenge = allChallenges[challengeIndexSelected];
    game.startGame(currentChallenge);
    showView("game");
    $("#game-buttons").hide();
}