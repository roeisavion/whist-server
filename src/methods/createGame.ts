import { gameGuid } from "../helpers/guid";

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
        const gameId = gameGuid();
        games[gameId] = {
            "id": gameId,
            "max_players": 4,
            "clients": {
                [clientId]: {
                    "playerNum": "P1",
                    nickname
                }
            },
            "winnedCards": { P1: [], P2: [], P3: [], P4: [] },
            "suitBets": { P1: null, P2: null, P3: null, P4: null },
            "numBets": { P1: null, P2: null, P3: null, P4: null },
            "cardsMap": {}
        }

        clients[clientId].inGame = gameId;

        payLoad = {
            "method": "create",
            "gameId": gameId,
            "playerNum": "P1"
        }

        const con = clients[clientId].connection;
        con.send(JSON.stringify(payLoad));
    }
}