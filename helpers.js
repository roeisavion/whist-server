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
    return Object.keys(object).find(key => object[key] != value);
}