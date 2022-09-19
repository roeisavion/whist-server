import { game } from "../methods/types/clientToServer.model";
import { dealCards, readyDeck } from "./deck";
import { screenCards } from "./helpers";

export const newGame = (game, clients, startingPlayer = 'P1') => {
    cleanUp(game);
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
            "turn": startingPlayer,
            "winnedCards": game.winnedCards
        }
        clients[client].connection.send(JSON.stringify(payLoad))
    })
}

const cleanUp = (game: game) => {
    game.sliceingSuit = null;
    game.cardsMap = {};
    game.numBets = {
        'P1': "haven't betted a suit yet",
        'P2': "haven't betted a suit yet",
        'P3': "haven't betted a suit yet",
        'P4': "haven't betted a suit yet"
    };
    game.suitBets = {
        'P1': "haven't a number betted yet",
        'P2': "haven't a number betted yet",
        'P3': "haven't a number betted yet",
        'P4': "haven't a number betted yet"
    };
    game.winnedCards = {
        'P1': [],
        'P2': [],
        'P3': [],
        'P4': []
    }
}