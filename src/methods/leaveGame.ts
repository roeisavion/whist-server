export const leaveGame = (clientId, clients, messageFromClient ,games) => {
    clientId = messageFromClient.clientId;
    let payLoad;
    if (clients[clientId].hasOwnProperty('inGame')) {
        let gameId = clients[clientId].inGame;
        let nickname = games[gameId].clients[clientId].nickname;
        delete games[gameId].clients[clientId];
        delete clients[clientId].inGame;
        payLoad = {
            "method": "leftGame",
            gameId,
            nickname,
            clientId
        }
        clients[clientId].connection.send(JSON.stringify(payLoad))
        // Object.keys(game.clients).forEach(c => {
        //     clients[c].connection.send(JSON.stringify(payLoad))
        // })
    }
    else {
        payLoad = {
            "method": "error",
            "massage": "not connected to any game"
        }
        clients[clientId].connection.send(JSON.stringify(payLoad))
    }
}