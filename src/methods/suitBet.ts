import { getSuit, getNumber, nextBettingPlayer } from "../helpers/gameFunctions";
import { countValue, getSuitBetWinner } from "../helpers/helpers";
import { newGame } from "../helpers/newGame";

export const handelSuitBet = (clientId, clients, messageFromClient, games) => {
    let payLoad;
    let gameId = clients[messageFromClient.clientId].inGame;
    let game = games[gameId];
    let playerNum = game.clients[messageFromClient.clientId].playerNum;
    let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
    !messageFromClient.pass ? game.suitBets[playerNum] = messageFromClient.betNum + messageFromClient.betSuit :
        game.suitBets[playerNum] = 'PASS';
    let betCount = Object.values(game.suitBets);
    if (countValue('PASS', betCount) === 4) {
        //reStartGame
        // payLoad = {
        //     "method": "restart"
        // }
        newGame(game, clients);
        return
    }
    if (countValue('PASS', betCount) === 3 && countValue("haven't betted a suit yet", betCount) === 0) {
        let betWinner = getSuitBetWinner(game.suitBets, 'PASS')
        game.sliceingSuit = getSuit(game.suitBets[betWinner]);
        let minBet = getNumber(game.suitBets[betWinner]);
        game.numBets[betWinner] = minBet;
        payLoad = {
            "method": "numBet",
            sliceingSuit: game.sliceingSuit,
            minBet,
            betWinner,
            "numBets": game.numBets,
            "turn": betWinner,
            "playerPlayed": playerNum,
            nickname: playerPlayedNickname
        }
    } else {
        payLoad = {
            "method": "suitBet",
            suitBet: game.suitBets,
            "turn": nextBettingPlayer(game.suitBets, playerNum),
            "playerPlayed": playerNum,
            nickname: playerPlayedNickname
        }
    }
    Object.keys(game.clients).forEach(c => {
        clients[c].connection.send(JSON.stringify(payLoad))
    })
}