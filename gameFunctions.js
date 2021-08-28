import {cardsNumberOrder, suitOrder} from './deck'

export const getSuit = ((cardString) => cardString.charAt(cardString.length-1));
export const getNumber = ((cardString) => cardString.slice(0,cardString.length-1));

export const caculateRoundWinner = (centerCards, sliceingSuit='a') => {
    let firstCard = centerCards[0];
    let firstSuit = getSuit(firstCard[0]);
    let bigCard = firstCard;

    for (let i = 1; i < 4; i++) {
        let card = centerCards[i];
        let cardSuit = getSuit(card[0])
        if (cardSuit === firstSuit) {
            if (cardsNumberOrder.indexOf(getNumber(card[0])) > cardsNumberOrder.indexOf(getNumber(bigCard[0]))) {
                bigCard = card;
            }
        }
    }
    return bigCard;
}