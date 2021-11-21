import {cardsNumberOrder, suitOrder} from './deck.js'

export const getSuit = ((cardString) => cardString.charAt(cardString.length-1));
export const getNumber = ((cardString) => cardString.slice(0,cardString.length-1));

export const caculateRoundWinner = (centerCards, sliceingSuit) => {
    let firstCard = centerCards[0];
    let firstSuit = getSuit(firstCard[0]);
    let bigCard = firstCard;

    for (let i = 1; i < 4; i++) {
        let card = centerCards[i];
        let cardSuit = getSuit(card[0])
        if(cardSuit === sliceingSuit){
            if(getSuit(bigCard) !== sliceingSuit){
                bigCard = card;
            }
            else{
                if (cardsNumberOrder.indexOf(getNumber(card[0])) > cardsNumberOrder.indexOf(getNumber(bigCard[0]))) {
                    bigCard = card;
                }
            }
        }
        else{   
            if (cardSuit === firstSuit) {
                if (cardsNumberOrder.indexOf(getNumber(card[0])) > cardsNumberOrder.indexOf(getNumber(bigCard[0]))) {
                    bigCard = card;
                }
            }
        }
        
        
    }
    return bigCard;
}

const nextTurn = { P1: 'P2', P2: "P3", P3: 'P4', P4: 'P1' } 

export const nextBettingPlayer = (suitBet,playerPlayed) => {
    let nextPlayer = nextTurn[playerPlayed];
    while(suitBet[nextPlayer] == "PASS"){
        nextPlayer = nextTurn[nextPlayer];
    }
    return nextPlayer;
}