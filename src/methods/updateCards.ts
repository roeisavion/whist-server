import { removeCard, screenCards, isGameFinished, scoreCaculator } from "../helpers/helpers";
import { newGame } from "../helpers/newGame";
import { caculateRoundWinner} from '../helpers/gameFunctions';


export const handelCardsUpdate = (clientId, clients, messageFromClient ,games) => {
    const nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' };
    let gameId  = clients[messageFromClient.clientId].inGame;
    let game = games[gameId];
    let payLoad;
    let playerPlayed = messageFromClient.playerPlayed;
    let cardPlayed = messageFromClient.cardPlayed;
    let currentHand = game.cardsMap[playerPlayed];
    let newHand = removeCard(cardPlayed, currentHand);
    game.cardsMap[playerPlayed] = newHand;
    game.cardsMap["center"].push([cardPlayed, playerPlayed]);
    let turn = nextTurn[playerPlayed];

    if (game.cardsMap["center"].length === 4) {

        Object.keys(game.clients).forEach((client) => {
            let playerNum = game.clients[client].playerNum;
            let screenedCards = screenCards(playerNum, game.cardsMap);
            payLoad = {
                "method": "updateCards",
                "cardsMap": screenedCards,
                "playerNum": playerNum,
                "turn": null,
                "winnedCards": game.winnedCards
            }
            clients[client].connection.send(JSON.stringify(payLoad))
        })

        let winCard = caculateRoundWinner(game.cardsMap["center"], game.sliceingSuit)
        let winPlayer = winCard[1];
        // game.winnedCards[winPlayer].push(winCard[0]);
        game.winnedCards[winPlayer] +=1
        game.cardsMap["center"] = [];
        turn = winPlayer;
    }

    Object.keys(game.clients).forEach((client) => {
        let playerNum = game.clients[client].playerNum;
        let screenedCards = screenCards(playerNum, game.cardsMap);
        payLoad = {
            "method": "updateCards",
            "cardsMap": screenedCards,
            "playerNum": playerNum,
            "turn": turn,
            "winnedCards": game.winnedCards
        }
        clients[client].connection.send(JSON.stringify(payLoad))
    })
    if (isGameFinished(game.cardsMap)) {
        Object.keys(game.clients).forEach((clientId) => {
            game.scoreMap = scoreCaculator(game.numBets, messageFromClient.wins, game.scoreMap, game.isUnder)
            payLoad = {
                "method": "score",
                "scoreMap": game.scoreMap
            }
            clients[clientId].connection.send(JSON.stringify(payLoad))
        })

        newGame(game, clients);
    }
}


