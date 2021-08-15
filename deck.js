const number = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const suit = ['C','D','S','H'];

export const createDeck = () => {
    let deck = []
    for (let num of number){
        for (let s of suit){
            deck.push(num+s)
        }
    }
    return deck
}

export const shuffleDeck = (deck) => {
    let shuffledDeck = deck.sort(() => Math.random() - 0.5)
    return shuffledDeck
}

export const readyDeck = () => shuffleDeck(createDeck());

export const dealCards = (deck) => {
    let playerCards = [];
    for(let i = 0; i<13 ; i++) {
        playerCards.push(deck.pop());
    }
    return playerCards;
}