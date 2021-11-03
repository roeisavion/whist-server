import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import { gameGuid, clientGuid } from './guid.js'
import { readyDeck, dealCards } from './deck.js';
import { caculateRoundWinner, getNumber, getSuit } from './gameFunctions.js';
import { countValue, screenCards, getSuitBetWinner, removeCard } from './helpers';

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
let games = {}, screenedCards;
let nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' }
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
            if (clients[clientId].hasOwnProperty('inGame')) {
                payLoad = {
                    "method": "error",
                    "massage": "cannot be in more than one game"
                }
                clients[clientId].connection.send(JSON.stringify(payLoad))
            } else {
                const gameId = gameGuid();
                games[gameId] = {
                    "id": gameId,
                    "max_players": 4,
                    "clients": {
                        [clientId]: {
                            "playerNum": "P1",
                            nickname
                        }
                    },
                    "winnedCards": { P1: [], P2: [], P3: [], P4: [] },
                    "suitBets": { P1: null, P2: null, P3: null, P4: null },
                    "numBets": { P1: null, P2: null, P3: null, P4: null },
                    "cardsMap": {}
                }

                clients[clientId].inGame = gameId;

                payLoad = {
                    "method": "create",
                    "gameId": gameId,
                    "playerNum": "P1"
                }

                const con = clients[clientId].connection;
                con.send(JSON.stringify(payLoad));
            }
        }

        if (messageFromClient.method === "leaveGame") {
            const clientId = messageFromClient.clientId;
            if (clients[clientId].hasOwnProperty('inGame')) {
                let gameId = clients[clientId].inGame;
                let nickname = games[gameId].clients[clientId].nickname;
                delete games[gameId].clients[clientId];
                delete clients[clientId].inGame;
                payLoad = {
                    "method": "leftGame",
                    gameId,
                    nickname
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

        //a client want to join
        if (messageFromClient.method === "join") {
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
                            game.cardsMap[playerNum] = playerCards;
                            game.cardsMap["center"] = [];
                        });
                        Object.keys(game.clients).forEach((client) => {
                            playerNum = game.clients[client].playerNum;
                            screenedCards = screenCards(playerNum, game.cardsMap);
                            payLoad = {
                                "method": "updateCards",
                                "cardsMap": screenedCards,
                                "playerNum": playerNum,
                                "turn": 'P1' /// need to delete
                            }
                            clients[client].connection.send(JSON.stringify(payLoad))
                            payLoad = {
                                "method": "suitBet",
                                "turn": 'P1',
                                suitBet: game.suitBets
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
        }

        if (messageFromClient.method === "suitBet") {
            let playerNum = game.clients[messageFromClient.clientId].playerNum; /// need to change to hash map
            let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
            !messageFromClient.pass ? game.suitBets[playerNum] = messageFromClient.betNum + messageFromClient.betSuit :
                game.suitBets[playerNum] = 'PASS';
            let betCount = Object.values(game.suitBets);
            if (countValue('PASS', betCount) === 4) {
                //reStartGame
                payLoad = {
                    "method": "restart"
                }
            }
            if (countValue('PASS', betCount) === 3 && countValue(null, betCount) === 0) {
                let betWinner = getSuitBetWinner(game.suitBets, 'PASS')
                sliceingSuit = getSuit(game.suitBets[betWinner]);
                minBet = getNumber(game.suitBets[betWinner]);
                payLoad = {
                    "method": "numBet",
                    sliceingSuit,
                    minBet,
                    "turn": betWinner,
                    "playerPlayed": playerNum,
                    nickname: playerPlayedNickname
                }
            } else {
                payLoad = {
                    "method": "suitBet",
                    suitBet: game.suitBets,
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
            let playerNum = game.clients[messageFromClient.clientId].playerNum;
            game.numBets[playerNum] = messageFromClient.myBetNum;
            let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
            if (countValue(null, Object.values(game.numBets)) > 0) {
                payLoad = {
                    "method": "numBet",
                    "turn": nextTurn[playerNum],
                    "numBets": game.numBets,
                    nickname: playerPlayedNickname
                }
                Object.keys(game.clients).forEach(c => {
                    clients[c].connection.send(JSON.stringify(payLoad))
                })
            } else {
                payLoad = {
                    "method": "numBet",
                    "numBets": game.numBets,
                    nickname: playerPlayedNickname,
                    "turn": nextTurn[playerNum],
                    "finishBetting": true
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
            currentHand = game.cardsMap[playerPlayed];
            newHand = removeCard(cardPlayed, currentHand);
            game.cardsMap[playerPlayed] = newHand;
            game.cardsMap["center"].push([cardPlayed, playerPlayed]);
            turn = nextTurn[playerPlayed];

            if (game.cardsMap["center"].length === 4) {
                let winCard = caculateRoundWinner(game.cardsMap["center"],sliceingSuit)
                let winPlayer = winCard[1];
                game.winnedCards[winPlayer].push(winCard[0]);
                game.cardsMap["center"] = [];
                turn = winPlayer;
            }


            Object.keys(game.clients).forEach((client) => {
                playerNum = game.clients[client].playerNum;
                screenedCards = screenCards(playerNum, game.cardsMap);
                payLoad = {
                    "method": "updateCards",
                    "cardsMap": screenedCards,
                    "playerNum": playerNum,
                    "turn": turn,
                    "winnedCards": game.winnedCards
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




// const countValue = (value, array) => {
//     let count = 0;
//     array.forEach(v => value === v ? count++ : null)
//     return count;
// }

// const screenCards = (playerNum, cardMap) => {
//     let cardsMapToSend = {};
//     Object.keys(cardMap).forEach((k) => {
//         if (k === playerNum || k === "center") {
//             cardsMapToSend[k] = cardMap[k];
//         } else {
//             cardsMapToSend[k] = cardMap[k].length;
//         }
//     })
//     return cardsMapToSend;
// }

// const removeCard = (cardPlayed, currentHand) => {
//     return currentHand.filter(currentCard => currentCard !== cardPlayed)
// }

// const getSuitBetWinner = (object, value) => {
//     return Object.keys(object).find(key => object[key] != value);
// }




// const createGame


// function startGame(){
//     let newDeck = readyDeck();