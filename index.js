import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import { gameGuid, clientGuid } from './guid.js'
import { readyDeck, dealCards } from './helpers/deck.js';
import { caculateRoundWinner, getNumber, getSuit, nextBettingPlayer } from './gameFunctions.js';
import { countValue, screenCards, getSuitBetWinner, removeCard, scoreCaculator, isGameFinished, getKeyByValue } from './helpers.js';
import _ from 'lodash'; 


const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
const app = express()
let port; 
(process.env.PORT==null || process.env.PORT =="") ? port = 9091 : port = process.env.PORT ;
app.listen(port, () => console.log("Listening on http port 9091"))
const websocketServer = ws.server;
const wsServer = new websocketServer({
    httpServer
})

const clients = {};
let games = {}, screenedCards;
const nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' }
let sliceingSuit, minBet, playerNum, payLoad, playerPlayed, cardPlayed, turn, currentHand, newHand, game;
const playerPointer = { "0": "P1", "1": "P2", "2": "P3", "3": "P4" };

wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => {
        // let clientIdToDelete = getKeyByValue(clients,connection)


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
                        newGame(game, clients);
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
            let playerNum = game.clients[messageFromClient.clientId].playerNum;
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
                    betWinner,
                    "turn": betWinner,
                    "playerPlayed": playerNum,
                    nickname: playerPlayedNickname
                }
            } else {
                payLoad = {
                    "method": "suitBet",
                    suitBet: game.suitBets,
                    "turn": nextBettingPlayer(game.suitBets, playerNum),
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
                game.isUnder = _.sum(Object.values(game.numBets)) < 13;
                payLoad = {
                    "method": "numBet",
                    "numBets": game.numBets,
                    nickname: playerPlayedNickname,
                    "turn": nextTurn[playerNum],
                    "finishBetting": true,
                    isUnder: game.isUnder
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
                let winCard = caculateRoundWinner(game.cardsMap["center"], sliceingSuit)
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
            if (isGameFinished(game.cardsMap)){
                Object.keys(game.clients).forEach((clientId) => {
                    game.scoreMap = scoreCaculator(game.numBets, messageFromClient.wins, game.scoreMap, game.isUnder)
                    payLoad = {
                        "method": "score",
                        "scoreMap": game.scoreMap
                    }
                    clients[clientId].connection.send(JSON.stringify(payLoad))
                })
    
                newGame(game, clients);
            }
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



const newGame = (game, clients, startingPlayer = 'P1') => {

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
            "method": "suitBet",
            "turn": startingPlayer,
            suitBet: game.suitBets
        }
        clients[client].connection.send(JSON.stringify(payLoad))
        payLoad = {
            "method": "updateCards",
            "cardsMap": screenedCards,
            "playerNum": playerNum,
            "turn": startingPlayer
        }
        clients[client].connection.send(JSON.stringify(payLoad))
    })
}

