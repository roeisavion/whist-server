export interface NumBetFromclient {
        method: string;
        clientId : string ;
        myBetNum : string
}


export interface game {
    isUnder? : boolean;
    gameId : string;
    numBets? : object 
    suitBets? : object 
    clients: object
    sliceingSuit?: string
    cardsMap? : object
}