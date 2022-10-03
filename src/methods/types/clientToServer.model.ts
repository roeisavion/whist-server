export interface NumBetFromclient {
        method: string;
        clientId : string ;
        myBetNum : string
}


export interface game {
    scoreMap: { P1: any; P2: any; P3: any; P4: any; };
    isUnder? : boolean;
    gameId : string;
    numBets? : object 
    suitBets? : object 
    clients: object
    sliceingSuit?: string
    cardsMap? : object
    winnedCards: { P1: any[]; P2: any[]; P3: any[]; P4: any[]; };
}