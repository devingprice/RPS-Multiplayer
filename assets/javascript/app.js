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