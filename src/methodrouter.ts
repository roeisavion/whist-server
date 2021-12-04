import { clientGuid } from "./helpers/guid"
import { createGame } from "./methods/createGame"
import { joinGame } from "./methods/joinGame"
import { leaveGame } from "./methods/leaveGame"
import { handelNumBet } from "./methods/numBets"
import { handelSuitBet } from "./methods/suitBet"
import { handelCardsUpdate } from "./methods/updateCards"

export class methodRouter1 {
    // constructor(clients){
    //     this.clients = clients;
    // }
    games = {} ;
    clients = {};
    clientId;
    // sliceingSuit;
    router = {
        create: createGame,
        join: joinGame,
        leaveGame: leaveGame,
        suitBet: handelSuitBet,
        numBet: handelNumBet,
        updateCards: handelCardsUpdate  // should Change to playerPlayed
    }

    methodRouter = (messageFromClient) => {
        // this.router[messageFromClient.method](this.clientId, this.clients, messageFromClient ,this.games, this.sliceingSuit);
        this.router[messageFromClient.method](this.clientId, this.clients, messageFromClient ,this.games);
    }
    connectPlayer = (connection) => {
        const clientId = clientGuid();
    
        this.clients[clientId] = {
            connection
        }
    
        let payLoad = {
            "method": "connect",
            "clientId": clientId
        }
        //send back the client connect
        connection.send(JSON.stringify(payLoad))
    }

}


export const methodRouter = (connection, messageFromClient, clients, games,clientId, sliceingSuit) => {
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
        leaveGame: leaveGame,
        suitBet: handelSuitBet,
        numBet: handelNumBet,
        updateCards: handelCardsUpdate  // should Change to playerPlayed
    }
    router[messageFromClient.method](clientId, clients, messageFromClient ,games, sliceingSuit);
}