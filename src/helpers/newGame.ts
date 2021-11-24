import { dealCards, readyDeck } from "./deck";
import { screenCards } from "./helpers";

export const newGame = (game, clients, startingPlayer = 'P1') => {

    let newDeck = readyDeck();
    let playerNum, payLoad;
    Object.keys(game.clients).forEach((client) => {
        playerNum = game.clients[client].playerNum;
        let playerCards = dealCards(newDeck);
        game.cardsMap[playerNum] = playerCards;
        game.cardsMap["center"] = [];
    });
    Object.keys(game.clients).forEach((client) => {
        playerNum = game.clients[client].playerNum;
        let screenedCards = screenCards(playerNum, game.cardsMap);
        payLoad = {
            "method": "suitBet",
            "turn": startingPlayer,
            suitBet: game.suitBets
        }
        clients[client].connection.send(JSON.stringify(payLoad))
        payLoad = {
            "method": "updateCards",
            "cardsMap": screenedCards,
            "playerNum": playerNum,
            "turn": startingPlayer
        }
        clients[client].connection.send(JSON.stringify(payLoad))
    })
}