export const router = {
    connect: connectPlayer(clients, connection),
    create: createGame(clients, games, messageFromClient),
    join: joinGame(clients, games, messageFromClient),
    leave: leaveGame(clients, games, messageFromClient),
    suitBet: handelSuitBet(clientId, clients, game),
    NumBet: handelNumBet(clientId, clients, game),
    updateCards: handelCardsUpdate(clientId, clients, game) // should Change to playerPlayed
}