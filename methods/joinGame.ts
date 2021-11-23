import { newGame } from "../helpers/newGame";

export const joinGame = (clients, games, messageFromClient) => {
    const playerPointer = { "0": "P1", "1": "P2", "2": "P3", "3": "P4" };
    const clientId = messageFromClient.clientId;
    let payLoad;
    if (clients[clientId].hasOwnProperty('inGame')) {
        payLoad = {
            "method": "error",
            "massage": "cannot be in more than one game"
        }
        clients[clientId].connection.send(JSON.stringify(payLoad))
    } else {
        if (Object.keys(games).includes(messageFromClient.gameId)) {

            const clientId = messageFromClient.clientId;
            const gameId = messageFromClient.gameId;
            const nickname = messageFromClient.nickname;
            clients[clientId].inGame = gameId;
            let game = games[gameId];
            if (Object.keys(game.clients).length >= 4) {
                //sorry max players reach
                payLoad = {
                    "method": "error",
                    "massage": "the game is full"
                }
                clients[clientId].connection.send(JSON.stringify(payLoad))
                return;
            }

            let playerNum = playerPointer[Object.keys(game.clients).length];
            game.clients[clientId] = {
                "playerNum": playerNum,
                nickname
            }

            payLoad = {
                "method": "playerJoined",
                "game": game,
                "clientId": clientId,
                "playerNum": playerNum,
                nickname
            }
            //loop through all clients and tell them that people has joined
            Object.keys(game.clients).forEach(c => {
                clients[c].connection.send(JSON.stringify(payLoad))
            })


            //start the game
            if (Object.keys(game.clients).length === 4) {
                newGame(game, clients);
            }
        }
        else {
            payLoad = {
                "method": "error",
                "massage": "gameId doesnt exists"
            }
            clients[clientId].connection.send(JSON.stringify(payLoad))
        }
    }
}