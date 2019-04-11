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

var $playerNumber = $('#player-number');
var $playerId = $('#player-id');
var $opponentId = $('#opponent-id');
var $gameId = $('#game-id');
var $userChoice = $('#user-choice');
var $opponentChoice = $('#opponent-choice');
var $wins = $('#wins');
var $losses = $('#losses');
var $ties = $('#ties');

function clearBoard() {
    //if i don't timeout the user chose from key click is updated before printing
    setTimeout(function () {
        var oldChoice = userHand;
        var oldOppChoice = opponentHand;

        userHand = null;
        opponentHand = null;
        $userChoice.text('You have yet to choose');
        $opponentChoice.text("Opponent is chosing");

        $('#old-opponent-choice').text("Opponent's last choice: " + oldOppChoice)
        $('#old-user-choice').text("Players's last choice: " + oldChoice)

    }, 1000)
}

db.ref('/game').on("value", function (snapshot) {
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
        $opponentChoice.text('Your opponent choose: ' + opponentHand)

        if ((userHand === "r" && opponentHand === "s") ||
            (userHand === "s" && opponentHand === "p") ||
            (userHand === "p" && opponentHand === "r")) {
            console.log('win')
            wins++;
            db.ref('/game').set({})
            clearBoard()
        } else if (userHand === opponentHand) {
            console.log('tie')
            ties++;
            db.ref('/game').set({})
            clearBoard()
        } else {
            console.log('lose')
            losses++;
            db.ref('/game').set({})
            clearBoard()
        }

        $wins.text(wins);
        $losses.text(losses);
        $ties.text(ties);

    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});



db.ref(".info/connected").on("value", function (snap) {
    if (snap.val()) {
        var con = db.ref("/connections").push(true);
        playerId = con.getKey();
        console.log(playerId);
        $playerId.text('player ' + playerId)
        con.onDisconnect().remove();

        if (gameId === null) {
            db.ref("/games").once('value', function (gamesObj) { //).then(
                gamesObj.forEach(function (gameObj) {
                    var gameKey = gameObj.key;
                    var playersList = gameObj.child('players').val();
                    console.log('players list', playersList)
                    if ( Object.keys(playersList).length < 2) {
                        console.log(gameObj.child('players'))
                        db.ref('/games').child(gameKey).child('players').push(playerId)
                        gameId = gameKey;
                        console.log('put in game ', gameKey)
                        return true;
                    }
                })
                if (gameId === null) {
                    var gameObj = db.ref("/games").push(true);
                    gameObj.child('players').push(playerId)
                    gameId = gameObj.key;
                    
                    gameObj.onDisconnect().remove();
                    console.log('created game ', gameId)
                }
            })
        }
        /*
        gameslist for each
            if game playerslist < 2, add player, return gameId
            if no gameId, make new game, add player
        */

        // var gameObj = db.ref("/games").push(playerId);
        // var gameId = gameObj.getKey();
        // gameObj.onDisconnect().remove();
    }
});

db.ref("/connections").on("value", function (snapshot) {
    playerNumber = Object.keys(snapshot.val()).indexOf(playerId) + 1;
    console.log(snapshot.val())
    console.log(playerNumber)
    $playerNumber.text('You are player: ' + playerNumber)
});


document.onkeyup = function (event) {

    if (!userHand) {

        var userGuess = event.key;

        if ((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) {
            userHand = userGuess;

            db.ref('/game').child(playerId).set({
                choice: userHand
            })

            $userChoice.text('You choose: ' + userHand)
        }
    } else {
        alert('already played, wait on player 2')
    }

}




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