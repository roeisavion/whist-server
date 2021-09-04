import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import { guid, gameGuid, clientGuid } from './guid.js'
import { readyDeck, dealCards } from './deck.js';
import { caculateRoundWinner } from './gameFunctions.js';

const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
const app = express()
app.listen(9091, () => console.log("Listening on http port 9091"))
//app.get("/", (req, res) => res.sendFile("C:/Users/Saba/Desktop/ws-server/index.html"))
const websocketServer = ws.server;
// const websocketServer = new ws.server;
const wsServer = new websocketServer({
    "httpServer": httpServer
})
const clients = {};
let games = {};
let cardsMap = {}, screenedCards;
let suitBet = { P1: null, P2: null, P3: null, P4: null }
//let winnedCards = { P1: [], P2: [], P3: [], P4: [] }
let winnedCards ;
let turns = { P1: true, P2: false, P3: false, P4: false }
let nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' }
let numBet = { P1: null, P2: null, P3: null, P4: null };
let sliceingSuit, minBet, playerNum, payLoad, playerPlayed, cardPlayed, turn, currentHand, newHand, game;
const playerPointer = { "0": "P1", "1": "P2", "2": "P3", "3": "P4" };


wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => {
        games = {};
        console.log("closed!")
    })
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        //I have received a message from the client
        //a user want to create a new game
        if (messageFromClient.method === "create") {
            const clientId = messageFromClient.clientId;
            const gameId = gameGuid();
            winnedCards = { P1: [], P2: [], P3: [], P4: [] }
            games[gameId] = {
                "id": gameId,
                "max_players": 4,
                "clients": [{
                    "clientId": clientId,
                    "playerNum": "P1"
                }]
            }

            payLoad = {
                "method": "create",
                "game": games[gameId],
                "playerNum": "P1"
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        //a client want to join
        if (messageFromClient.method === "join") {

            const clientId = messageFromClient.clientId;
            const gameId = messageFromClient.gameId;
            game = games[gameId];
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

            payLoad = {
                "method": "playerJoined",
                "game": game,
                "clientId": clientId,
                "playerNum": playerNum
            }
            //loop through all clients and tell them that people has joined
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })

            //start the game
            if (game.clients.length === 4) {
                //startGame();
                let newDeck = readyDeck();
                game.clients.forEach((client) => {
                    playerNum = client.playerNum;
                    let playerCards = dealCards(newDeck);
                    cardsMap[playerNum] = playerCards;
                    cardsMap["center"] = [];
                });
                game.clients.forEach((client) => {
                    playerNum = client.playerNum;
                    screenedCards = screenCards(playerNum, cardsMap);
                    console.log('aaa')
                    payLoad = {
                        "method": "updateCards",
                        "cardsMap": screenedCards,
                        "playerNum": playerNum,
                        "turn": 'P1' /// need to delete
                    }
                    clients[client.clientId].connection.send(JSON.stringify(payLoad))
                    payLoad = {
                        "method": "suitBet",
                        "turn": 'P1'
                    }
                    clients[client.clientId].connection.send(JSON.stringify(payLoad))
                })
            }
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
                payLoad = {
                    "method": "numBet",
                    "sliceingSuit": sliceingSuit,
                    "minBet": minBet,
                    "turn": playerNum
                }
            }
            else {
                payLoad = {
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
            numBet[messageFromClient.playerNum] = messageFromClient.numBet;
            if (countValue(null, Object.values(numBet)) > 0) {
                payLoad = {
                    "method": "numBet",
                    "turn": nextTurn[playerNum],
                    "numBet": numBet
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                })
            }
            else {
                payLoad = {
                    "method": "numBet",
                    "numBet": numBet
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                })
                payLoad = {
                    "method": "play",
                    "turn": nextTurn[playerNum]
                }

            }
        }
        if (messageFromClient.method === "updateCards") {
            playerPlayed = messageFromClient.playerPlayed;
            cardPlayed = messageFromClient.cardPlayed;
            currentHand = cardsMap[playerPlayed];
            newHand = removeCard(cardPlayed, currentHand);
            cardsMap[playerPlayed] = newHand;
            cardsMap["center"].push([cardPlayed, playerPlayed]);
            turn = nextTurn[playerPlayed];

            if (cardsMap["center"].length === 4) {
                let winCard = caculateRoundWinner(cardsMap["center"])
                let winPlayer = winCard[1];
                winnedCards[winPlayer].push(winCard[0]);
                cardsMap["center"] = [];
                turn = winPlayer;
            }


            game.clients.forEach((client) => {
                playerNum = client.playerNum;
                screenedCards = screenCards(playerNum, cardsMap);
                payLoad = {
                    "method": "updateCards",
                    "cardsMap": screenedCards,
                    "playerNum": playerNum,
                    "turn": turn,
                    "winnedCards": winnedCards
                }
                clients[client.clientId].connection.send(JSON.stringify(payLoad))
            })
        }

    })

    //generate a new clientId
    const clientId = clientGuid();
    clients[clientId] = {
        "connection": connection
    }

    payLoad = {
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

const screenCards = (playerNum, cardMap) => {
    let cardsMapToSend = {};
    Object.keys(cardMap).forEach((k) => {
        if (k === playerNum || k === "center") {
            cardsMapToSend[k] = cardMap[k];
        }
        else {
            cardsMapToSend[k] = cardMap[k].length;
        }
    })
    return cardsMapToSend;
}

const removeCard = (cardPlayed, currentHand) => {
    return currentHand.filter(currentCard => currentCard !== cardPlayed)
}





// const createGame


// function startGame(){
//     let newDeck = readyDeck();




