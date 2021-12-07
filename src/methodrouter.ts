import { clientGuid } from "./helpers/guid"
import { createGame } from "./methods/createGame"
import { joinGame } from "./methods/joinGame"
import { leaveGame } from "./methods/leaveGame"
import { handelNumBet } from "./methods/numBets"
import { handelSuitBet } from "./methods/suitBet"
import { handelCardsUpdate } from "./methods/updateCards"

export class methodRouter1 {
    games = {} ;
    clients = {};
    clientId;
    router = {
        create: createGame,
        join: joinGame,
        leaveGame: leaveGame,
        suitBet: handelSuitBet,
        numBet: handelNumBet,
        updateCards: handelCardsUpdate  // should Change to playerPlayed
    }

    methodRouter = (messageFromClient) => {
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


export const methodRouter = (messageFromClient, clients, games,clientId) => {
    const router = {
        create: createGame,
        join: joinGame,
        leaveGame: leaveGame,
        suitBet: handelSuitBet,
        numBet: handelNumBet,
        updateCards: handelCardsUpdate  // should Change to playerPlayed
    }
    router[messageFromClient.method](clientId, clients, messageFromClient ,games);
}