import * as _ from 'lodash';
import { countValue } from "../helpers/helpers";
import { game, NumBetFromclient } from './types/game.model';

export const handelNumBet = (clientId, clients, messageFromClient : NumBetFromclient ,games ) => {
    const nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' };
    let payLoad;
    let gameId  = clients[messageFromClient.clientId].inGame;
    let game : game = games[gameId];
    let playerNum = game.clients[messageFromClient.clientId].playerNum;
    game.numBets[playerNum] = messageFromClient.myBetNum ;
    let playerPlayedNickname = game.clients[messageFromClient.clientId].nickname;
    if (countValue(null, Object.values(game.numBets)) > 0) {
        payLoad = {
            "method": "numBet",
            "turn": nextTurn[playerNum],
            "numBets": game.numBets,
            nickname: playerPlayedNickname
        }
        _.keys(game.clients).forEach(c => {
            clients[c].connection.send(JSON.stringify(payLoad))
        })
    } else {
        game.isUnder = _.sum((_.values(game.numBets)).map(nb => parseInt(nb))) < 13;
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