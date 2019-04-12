var config = {
    apiKey: "AIzaSyDjjUO-7Gpv1uctdcr-pCH2lo6BUFKRA3M",
    authDomain: "trilogy-bootcamp.firebaseapp.com",
    databaseURL: "https://trilogy-bootcamp.firebaseio.com",
    projectId: "trilogy-bootcamp",
    storageBucket: "",
    messagingSenderId: "35658232274"
};

firebase.initializeApp(config);
var db = firebase.database();


var wins = 0;
var losses = 0;
var ties = 0;

var choices = ["r", "p", "s"];
var playerNumber = null;
var oneHand = null;
var twoHand = null;
var userHand = null;
var opponentHand = null;
var playerId = null;
var gameId = null;

var chat = [];

var $playerNumber = $('#player-number');
var $playerId = $('#player-id');
var $opponentId = $('#opponent-id');
var $gameId = $('#game-id');
var $userChoice = $('#user-choice');
var $opponentChoice = $('#opponent-choice');
var $wins = $('#wins');
var $losses = $('#losses');
var $ties = $('#ties');
var $chatlog = $('#chat-log');
//var $chatButton = $('#chat-submit');

function clearBoard() {

    //if i don't timeout the user chose from key click is updated before printing
    setTimeout(function () {
        var oldChoice = userHand;
        var oldOppChoice = opponentHand;

        userHand = null;
        opponentHand = null;
        $userChoice.text('You have yet to choose');
        $opponentChoice.text("Opponent is chosing");

        $('#old-opponent-choice').html("Opponent's last choice: " + handChoiceToIcon(oldOppChoice))
        $('#old-user-choice').html("Players's last choice: " + handChoiceToIcon(oldChoice))

    }, 1000)
}
function clearGameMoves(){
    db.ref('/games').child(gameId).child('moves').set({})
}
function showResults(resultsType){
    if(resultsType === 'win'){
        console.log('win')
        Swal.fire({
            type: 'success',
            title: 'YOU WIN!!!',
            text: 'Great job!',
            footer: createScoreDisplay()
        })
    } else if( resultsType === 'lose'){
        console.log('lose')
        Swal.fire({
            type: 'error',
            title: 'You lose...',
            text: 'nice...',
            footer: createScoreDisplay()
        })
    } else if ( resultsType === 'tie'){
        console.log('tie')
        Swal.fire({
            title: 'Tie',
            text: '',
            footer: createScoreDisplay()
        })
    }
}
function createScoreDisplay(){
    return "<div id='wins'>Wins: "+ wins + "</div>"+"<div id='ties'>Ties: "+ ties + "</div>"+"<div id='losses'>Losses: "+ losses + "</div>";
}

function createGameListeners() {
    db.ref('/games').child(gameId).child('moves').on("value", function (snapshot) {
        var values = snapshot.val();
        console.log(values);

        if (values !== null && values[playerId] && Object.keys(values).length > 1) {

            var chosen = Object.keys(values);
            var filtered = chosen.filter(function (value) {
                return value !== playerId;
            })
            var opponentId = filtered[0];
            $opponentId.text('opponenet ' + opponentId)
            opponentHand = values[opponentId].choice;
            
            $opponentChoice.html(handChoiceToIcon(opponentHand))

            if ((userHand === "r" && opponentHand === "s") ||
                (userHand === "s" && opponentHand === "p") ||
                (userHand === "p" && opponentHand === "r")) {
                
                wins++;
                showResults('win');
                clearGameMoves();
                clearBoard()

            } else if (userHand === opponentHand) {
                
                ties++;
                showResults('tie');
                clearGameMoves();
                clearBoard()

            } else {

                losses++;
                showResults('lose');
                clearGameMoves();
                clearBoard()

            }

            //$wins.text(wins);
            //$losses.text(losses);
            //$ties.text(ties);

        }

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


    db.ref('/games').child(gameId).child('chat').on("child_added", function (snapshot, prevChildKey) {
        var value = snapshot.val();
        console.log( value );
        chat.push( value.message )

        $chatlog.empty();
        for(var i =0; i< chat.length; i++){
            $chatlog.append( '<p>'+ chat[i] + '</p>')
        }
    })
}



db.ref(".info/connected").on("value", function (snap) {
    var isConnected = snap.val();
    if (isConnected) {
        var con = db.ref("/connections").push(true);
        playerId = con.getKey();
        $playerId.text('playerId: ' + playerId)
        con.onDisconnect().remove();

        if (gameId === null) {
            db.ref("/games").once('value', function (gamesObj) { 
                gamesObj.forEach(function (gameObj) {
                    var gameKey = gameObj.key;
                    var playersList = gameObj.child('players').val();
                    
                    if (Object.keys(playersList).length < 2) {
                        db.ref('/games').child(gameKey).child('players').push(playerId)
                        gameId = gameKey;
                        return true;
                    }
                })
                if (gameId === null) { //create game
                    var gameObj = db.ref("/games").push(true);
                    gameObj.child('players').push(playerId)
                    gameId = gameObj.key;

                    gameObj.onDisconnect().remove();
                }
                $gameId.text('GameId: '+ gameId )
                createGameListeners();
            })
        }
    }
});

db.ref("/connections").on("value", function (snapshot) {
    playerNumber = Object.keys(snapshot.val()).indexOf(playerId) + 1;
    $playerNumber.text('You are player: ' + playerNumber)
});


/*
/////Cant chat if this is constantly 'stealing' key presses
document.onkeyup = function (event) {
    if (!userHand) {
        var userGuess = event.key;
        pickPlayerChoice(userGuess)
    } else {
        alert('already played, wait on player 2')
    }
}
*/
$(document).on('click', '.click-choice', function () {
    var userGuess = $(this).attr('data-click-val');
    pickPlayerChoice(userGuess)
})
$(document).on('click', '#chat-submit', function () {
    var input = $('#chat-input').val().trim();
    $('#chat-input').val('')
    if( gameId ){
        db.ref('/games').child(gameId).child('chat').push({
            message: input
        })
    } else {
        Swal.fire({
            type: 'warning',
            title: 'Not in game',
            text: 'You have no opponent to send a message to...'
        })
    }
    
})

var chatShowing = false;
$(document).on('click', '#chat-expand', function () {
    if( chatShowing ){
        $('#chat-window').attr('style', "width: 0")
        chatShowing = false;
    } else {
        $('#chat-window').attr('style', "width: 300px")
        chatShowing = true;
    }
    
})

function pickPlayerChoice(userGuess) {
    if ((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) {
        userHand = userGuess;

        /*db.ref('/game').child(playerId).set({
            choice: userHand
        })*/
        db.ref('/games').child(gameId).child('moves').child(playerId).set({
            choice: userHand
        })

        //$userChoice.text('You choose: ' + userHand)
        $userChoice.html(handChoiceToIcon(userHand))
    }
}

function handChoiceToIcon(handChoiceString, color) {
    var html = '';
    if (handChoiceString === "r") {
        html = '<i class="fas fa-hand-rock fa-10x"></i>'
    } else if (handChoiceString === "p") {
        html = '<i class="fas fa-hand-paper fa-10x"></i>'
    } else if (handChoiceString === "s") {
        html = '<i class="fas fa-hand-scissors fa-10x"></i>'
    }
    return html;
}

/*
function startToGame() {
    setTimeout(function () {
        $('#start-screen').removeClass('screen--active');
        $('#game-screen').addClass('screen--active');
    }, 1000)

}
function gameToResults() {

    setTimeout(function () {
        $('#game-screen').removeClass('screen--active');
        $('#results-screen').addClass('screen--active');
        setTimeout(function () {
            $('#game-screen').addClass('screen--active');
            $('#results-screen').removeClass('screen--active');
        }, 1000)
    }, 1000)


}

startToGame();*/


/*
// https://stackoverflow.com/questions/3796025/fill-svg-path-element-with-a-background-image


VARIABLES
var roundType;
var gameSession = {
    roundType, roundsPlayed, wins, losses
}

SCREENS
start screen + roundButt
round instructions + startButt
online lobby
round
results
leaderboard
about


FUNCTIONS
start
showRoundButtons()
    on click goToRoundStart()
        setRoundType(x)
showLeaderboardButton()
showAboutButton()

roundStart
showNav()
showInstructions()
showStartButton()
    on click goToR
if online showSearchForOpponentButton()

lobby
showNav()
showSearching()
getNumberOnline()
showPlayWhileWaiting()

round
showNav()
displayStage(){}
pickHand(){}
submitHand(){}
checkForOpponentHand(){}
playWaitingAnimation(){}
playResultsAnimation(){}
goToResultsScreen(){}
showChat()
checkForChatUpdate()
submitChat()

victory
showNav()
showWinLossRatio() //session and total
showVictoryState()
showPlayAgain()
showQuitButton()
showLeaderboardButton()
if gamesPlayed > 4 askForUsername()

leaderboard
getStats()
displayStats(tab){
    if tab is ai
        first line = user stats
        rest = ranking desc
    if tab is online
    ...
showNav()
}
*/
/*
leaderboards:
    online
    ...
games: []
    1: {
        user1
        user2
        rounds: []
            { 1: r, 2: s, winner: 1}
    }
users: []
    tempId
    enteredName
    wins
    loses
    games

*/