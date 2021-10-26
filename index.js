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
let cardsMap = {},
    screenedCards;
let suitBet = { P1: null, P2: null, P3: null, P4: null }
//let winnedCards = { P1: [], P2: [], P3: [], P4: [] }
let winnedCards;
let turns = { P1: true, P2: false, P3: false, P4: false }
let nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' }
let numBet = { P1: null, P2: null, P3: null, P4: null };
let sliceingSuit, minBet, playerNum, payLoad, playerPlayed, cardPlayed, turn, currentHand, newHand, game;
const playerPointer = { "0": "P1", "1": "P2", "2": "P3", "3": "P4" };


wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => {
        // games = {};
        //need to remove client from game
        //connections.splice(connections.indexOf(connection), 1)
        console.log("closed!")
    })
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        //I have received a message from the client
        //a user want to create a new game
        if (messageFromClient.method === "create") {
            const clientId = messageFromClient.clientId;
            const nickname = messageFromClient.nickname;
            const gameId = gameGuid();
            winnedCards = { P1: [], P2: [], P3: [], P4: [] }
            games[gameId] = {
                "id": gameId,
                "max_players": 4,
                "clients": {
                    [clientId]: {
                        "playerNum": "P1",
                        nickname
                    }
                }
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
            if (Object.keys(games).includes(messageFromClient.gameId)) {

                const clientId = messageFromClient.clientId;
                const gameId = messageFromClient.gameId;
                const nickname = messageFromClient.nickname;
                game = games[gameId];
                if (Object.keys(game.clients).length >= 4) {
                    //sorry max players reach
                    payLoad = {
                        "method": "error",
                        "massage": "the game is full"
                    }
                    clients[clientId].connection.send(JSON.stringify(payLoad))
                    return;
                    // need to add a massage to the client
                }

                playerNum = playerPointer[Object.keys(game.clients).length];
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
                    //startGame();
                    let newDeck = readyDeck();
                    Object.keys(game.clients).forEach((client) => {
                        playerNum = game.clients[client].playerNum;
                        let playerCards = dealCards(newDeck);
                        cardsMap[playerNum] = playerCards;
                        cardsMap["center"] = [];
                    });
                    Object.keys(game.clients).forEach((client) => {
                        playerNum = game.clients[client].playerNum;
                        screenedCards = screenCards(playerNum, cardsMap);
                        payLoad = {
                            "method": "updateCards",
                            "cardsMap": screenedCards,
                            "playerNum": playerNum,
                            "turn": 'P1' /// need to delete
                        }
                        clients[client].connection.send(JSON.stringify(payLoad))
                        payLoad = {
                            "method": "suitBet",
                            "turn": 'P1'
                        }
                        clients[client].connection.send(JSON.stringify(payLoad))
                    })
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

        if (messageFromClient.method === "suitBet") {
            let playerNum = game.clients[messageFromClient.clientId].playerNum; /// need to change to hash map
            let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
            !messageFromClient.pass ? suitBet[playerNum] = messageFromClient.betNum + messageFromClient.suit :
                suitBet[playerNum] = 'PASS';
            let betCount = Object.values(suitBet);
            if (countValue('PASS', betCount) === 4) {
                //reStartGame
                payLoad = {
                    "method": "restart"
                }
            }
            if (countValue('PASS', betCount) === 3 && countValue(null, betCount) === 0) {
                sliceingSuit = suitBet[playerNum][1];
                minBet = suitBet[playerNum][0];
                payLoad = {
                    "method": "numBet",
                    sliceingSuit,
                    minBet,
                    "turn": playerNum,
                    "playerPlayed": playerNum,
                    nickname: playerPlayedNickname
                }
            } else {
                payLoad = {
                    "method": "suitBet",
                    suitBet,
                    "turn": nextTurn[playerNum],
                    "playerPlayed": playerNum,
                    nickname: playerPlayedNickname
                }
            }
            Object.keys(game.clients).forEach(c => {
                clients[c].connection.send(JSON.stringify(payLoad))
            })
        }

        if (messageFromClient.method === "numBet") {
            numBet[messageFromClient.playerNum] = messageFromClient.numBet;
            let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
            if (countValue(null, Object.values(numBet)) > 0) {
                payLoad = {
                    "method": "numBet",
                    "turn": nextTurn[playerNum],
                    "numBet": numBet,
                    nickname: playerPlayedNickname

                }
                Object.keys(game.clients).forEach(c => {
                    clients[c].connection.send(JSON.stringify(payLoad))
                })
            } else {
                payLoad = {
                    "method": "numBet",
                    "numBet": numBet,
                    nickname: playerPlayedNickname
                }
                Object.keys(game.clients).forEach(c => {
                    clients[c].connection.send(JSON.stringify(payLoad))
                })
                payLoad = {
                    "method": "play",
                    "turn": nextTurn[playerNum],
                    nickname: playerPlayedNickname
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


            Object.keys(game.clients).forEach((client) => {
                playerNum = game.clients[client].playerNum;
                screenedCards = screenCards(playerNum, cardsMap);
                payLoad = {
                    "method": "updateCards",
                    "cardsMap": screenedCards,
                    "playerNum": playerNum,
                    "turn": turn,
                    "winnedCards": winnedCards
                }
                clients[client].connection.send(JSON.stringify(payLoad))
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
        } else {
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