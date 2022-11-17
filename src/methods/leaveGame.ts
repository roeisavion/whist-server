export const leaveGame = (clientId, clients, messageFromClient ,games) => {
    clientId = messageFromClient.clientId;
    let payLoad;
    if (clients[clientId].hasOwnProperty('inGame')) {
        const gameId = clients[clientId].inGame;
        const nickname = games[gameId].clients[clientId].nickname;
        const playerNum = games[gameId].clients[clientId].playerNum;
        games[gameId].availablePlayerNums.push(playerNum);
        delete games[gameId].clients[clientId];
        delete clients[clientId].inGame;
        payLoad = {
            "method": "leftGame",
            gameId,
            nickname,
            clientId,
            game : games[gameId]
        }
        Object.keys(games[gameId].clients).forEach(c => {
            clients[c].connection.send(JSON.stringify(payLoad))
        })
    }
    else {
        payLoad = {
            "method": "error",
            "massage": "not connected to any game"
        }
        clients[clientId].connection.send(JSON.stringify(payLoad))
    }
}