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


///////////////firebase

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


var directionsText = document.getElementById("directions-text");
var userChoiceText = document.getElementById("userchoice-text");
var computerChoiceText = document.getElementById("computerchoice-text");
var winsText = document.getElementById("wins-text");
var lossesText = document.getElementById("losses-text");
var tiesText = document.getElementById("ties-text");



db.ref().on("value", function (snapshot) {
    console.log(snapshot.val());
    var values = snapshot.val();
    if(values.player1Hand && values.player2Hand){

        if (playerNumber === 1) {
            twoHand = snapshot.val().player2Hand;
        } else if (playerNumber === 2) {
            twoHand = snapshot.val().player1Hand;
        } else {
            console.log('no player number yet')
        }


        if ((oneHand === "r" && twoHand === "s") ||
            (oneHand === "s" && twoHand === "p") ||
            (oneHand === "p" && twoHand === "r")) {
            wins++;
        } else if (oneHand === twoHand) {
            ties++;
        } else {
            losses++;
        }

        computerChoiceText.textContent = "The opponent chose: " + twoHand;
        winsText.textContent = "wins: " + wins;
        lossesText.textContent = "losses: " + losses;
        tiesText.textContent = "ties: " + ties;

    }
    

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

function setDb(data) {
    db.ref().set(
        data
    )
}

var connectionsRef = db.ref("/connections");
var connectedRef = db.ref(".info/connected");
// When the client's connection state changes...
connectedRef.on("value", function (snap) {
    // If they are connected..
    if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});
// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    playerNumber = snapshot.numChildren();
    console.log( playerNumber )
});


document.onkeyup = function (event) {
    if (!oneHand && !playerNumber) {

        var userGuess = event.key;
        //var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];
        if ((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) {
            oneHand = userGuess;

            db.ref().once("value", function (data) {
                console.log('single check', data)
                if (data.player1Hand) {
                    db.ref().set({
                        player2Hand: oneHand
                    })
                    //playerNumber = 2;
                } else {
                    db.ref().set({
                        player1Hand: oneHand
                    })
                    //playerNumber = 1;
                }

            });

            // Hide the directions
            directionsText.textContent = "";

            // Display the user and computer guesses, and wins/losses/ties.
            userChoiceText.textContent = "You chose: " + oneHand;
        }
    } else {
        alert('already played, wait on player 2')
    }

}



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