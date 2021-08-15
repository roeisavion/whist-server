import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import { guid, gameGuid, clientGuid } from './guid.js'
import { readyDeck, dealCards } from './deck.js';

const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
const app = express()
app.listen(9091, () => console.log("Listening on http port 9091"))
app.get("/", (req, res) => res.sendFile("C:/Users/Saba/Desktop/ws-server/index.html"))
const websocketServer = ws.server;
// const websocketServer = new ws.server;
const wsServer = new websocketServer({
    "httpServer": httpServer
})
const clients = {};
const games = {};
let suitBet = { P1: null, P2: null, P3: null, P4: null }
let turns = { P1: true, P2: false, P3: false, P4: false }
let nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' }
let numBet;
let sliceingSuit, minBet, playerNum;
const playerPointer = { "0": "P1", "1": "P2", "2": "P3", "3": "P4" };


wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!"))
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        //I have received a message from the client
        //a user want to create a new game
        if (messageFromClient.method === "create") {
            const clientId = messageFromClient.clientId;
            const gameId = gameGuid();
            games[gameId] = {
                "id": gameId,
                "max_players": 4,
                "clients": []
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        //a client want to join
        if (messageFromClient.method === "join") {

            const clientId = messageFromClient.clientId;
            const gameId = messageFromClient.gameId;
            const game = games[gameId];
            if (game.clients.length >= 4) {
                //sorry max players reach
                return;
                // need to add a massage to the client
            }

            playerNum = playerPointer[game.clients.length];
            game.clients.push({
                "clientId": clientId,
                "playerNum": playerNum
            })
            //start the game
            if (game.clients.length === 4) {
                let newDeck = readyDeck();
                game.clients.forEach((client) => {
                    playerNum = client.playerNum;
                    let playerCards = dealCards(newDeck);
                    let payload = {
                        "method": "updateCards",
                        "cards": playerCards,
                        "playerNum": "P1"
                    }
                    client.connection.send(JSON.stringify(payLoad))
                    payload = {
                        "method": "suitBet"
                    }
                    client.connection.send(JSON.stringify(payLoad))
                })
            }
            //startGame();

            const payLoad = {
                "method": "playerJoined",
                "game": game,
                "clientId": clientId
            }
            //loop through all clients and tell them that people has joined
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }

        if (messageFromClient.method === "suitBet") {
            let playerNum = messageFromClient.playerNum;
            suitBet[playerNum] = messageFromClient.suitBet;
            let betCount = Object.values(suitBet);
            if (countValue('PASS', betCount) === 4) {
                //reStartGame
            }
            if (countValue('PASS', betCount) === 3 && countValue(null, betCount) === 0) {
                sliceingSuit = suitBet[playerNum][1];
                minBet = suitBet[playerNum][0];
                const payLoad = {
                    "method": "numBet",
                    "sliceingSuit": sliceingSuit,
                    "minBet": minBet,
                    "turn": playerNum
                }
            }
            else{
                const payLoad = {
                    "method": "suitBet",
                    "suitBet": suitBet,
                    "turn": nextTurn[playerNum]
                }
            }
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }

        if (messageFromClient.method === "numBet") {
            
        }



        // //a user plays
        // if (result.method === "play") {
        //     const gameId = result.gameId;
        //     const ballId = result.ballId;
        //     const color = result.color;
        //     let state = games[gameId].state;
        //     if (!state)
        //         state = {}

        //     state[ballId] = color;
        //     games[gameId].state = state;

        // }

    })

    //generate a new clientId
    const clientId = clientGuid();
    clients[clientId] = {
        "connection": connection
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }
    //send back the client connect
    connection.send(JSON.stringify(payLoad))

})

const countValue = (value, array) => {
    let count = 0;
    array.forEach(v => value === v ? count++ : null)
    return count;
}


// const createGame


// const methodPointer = {
//     "connect" : connectToServer(),
//     "create" : createGame(),
//     "join" : joinGame(),
// }



// function startGame(){
//     let newDeck = readyDeck();


    //{"gameid", fasdfsf}
//     for (const g of Object.keys(games)) {
//         const game = games[g]
//         const payLoad = {
//             "method": "update",
//             "game": game
//         }

//         game.clients.forEach(c=> {
//             clients[c.clientId].connection.send(JSON.stringify(payLoad))
//         })
//     }
// }



