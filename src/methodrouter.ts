import { connectPlayer } from "./methods/connectPlayer"
import { createGame } from "./methods/createGame"
import { joinGame } from "./methods/joinGame"
import { leaveGame } from "./methods/leaveGame"
import { handelNumBet } from "./methods/numBets"
import { handelSuitBet } from "./methods/suitBet"
import { handelCardsUpdate } from "./methods/updateCards"

export const methodRouter = (connection, messageFromClient, clients, games) => {
    let clientId, sliceingSuit ;
    // const router = {
    //     connect: connectPlayer(clients, connection),
    //     create: createGame(clients, games, messageFromClient),
    //     join: joinGame(clients, games, messageFromClient),
    //     leave: leaveGame(clients, games, messageFromClient),
    //     suitBet: handelSuitBet(clientId, clients, games, sliceingSuit),
    //     NumBet: handelNumBet(clientId, clients, games),
    //     updateCards: handelCardsUpdate (clientId, clients, games, sliceingSuit) // should Change to playerPlayed
    // }
    const router = {
        create: createGame,
        join: joinGame,
        leave: leaveGame,
        suitBet: handelSuitBet,
        numBet: handelNumBet,
        updateCards: handelCardsUpdate  // should Change to playerPlayed
    }
    // router[messageFromClient.method](clientId, clients, games, sliceingSuit)
    router[messageFromClient.method](clientId, clients, messageFromClient ,games, sliceingSuit);
}