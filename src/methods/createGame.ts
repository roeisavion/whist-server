import { gameGuid } from "../helpers/guid";
import { game } from "./types/game.model";

export const createGame = (clientId, clients, messageFromClient ,games) => {
    clientId = messageFromClient.clientId;
    const nickname = messageFromClient.nickname;
    let payLoad;
    if (clients[clientId].hasOwnProperty('inGame')) {
        payLoad = {
            "method": "error",
            "massage": "cannot be in more than one game"
        }
        clients[clientId].connection.send(JSON.stringify(payLoad))
    } else {
        const game = newGameRoom(clientId,nickname)
        games[game.gameId] = game ;

        clients[clientId].inGame = game.gameId;

        payLoad = {
            "method": "create",
            "playerNum": "P1",
            game
        }

        const con = clients[clientId].connection;
        con.send(JSON.stringify(payLoad));
    }
}

const newGameRoom = (clientId,nickname) => {
    const gameId = gameGuid();
    const game : game = {
        gameId,
        max_players: 4,
        clients: {
            [clientId]: {
                playerNum: "P1",
                nickname
            }
        },
        availablePlayerNums : ["P4","P3","P4"],
        winnedCards: { P1: 0, P2: 0, P3: 0, P4: 0},
        suitBets: { P1: null, P2: null, P3: null, P4: null },
        numBets: { P1: null, P2: null, P3: null, P4: null },
        cardsMap: {},
        scoreMap : {
            P1: 0,
            P2: 0,
            P3: 0,
            P4: 0
        }
    }

    return game;
}