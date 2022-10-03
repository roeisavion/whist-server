import _ from 'lodash';

export const countValue = (value, array) => {
    let count = 0;
    array.forEach(v => value === v ? count++ : null)
    return count;
}

export const screenCards = (playerNum, cardMap) => {
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

export const removeCard = (cardPlayed, currentHand) => {
    return currentHand.filter(currentCard => currentCard !== cardPlayed)
}

export const getSuitBetWinner = (object, value) => {
    return Object.keys(object).find(key => object[key] != value) ;
}

export const scoreCaculator = (bets,wins,scoreMap : object ,isUnder : boolean) => {
    let diff;
    let zeroScore = isUnder ? 50 : 25;
    Object.keys(bets).forEach(p => {
        diff = wins[p] - bets[p];
        diff !== 0 ? scoreMap[p] = scoreMap[p] - 10*Math.abs(diff) :
        (wins[p] !== 0 ? scoreMap[p] = scoreMap[p] + wins[p]**2 +10 :
            scoreMap[p] = scoreMap[p] + zeroScore)
    });
    return scoreMap;
}

export const isGameFinished = (cardsMap) => {
    let isFinished = true;
    Object.values(cardsMap).forEach(cards =>{
        if(!_.isEmpty(cards)){
            isFinished = false;
        }
    })
    return isFinished;
}

export function clientIdByConnection(clients, connection) {
    return Object.keys(clients).find(key => clients[key].connection === connection);
  }