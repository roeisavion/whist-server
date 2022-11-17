export interface NumBetFromclient {
        method: string;
        clientId: string;
        myBetNum: string
}


export interface game {
        scoreMap: { P1: any; P2: any; P3: any; P4: any; };
        isUnder?: boolean;
        isStarted : boolean;
        gameId: string;
        numBets?: object
        suitBets?: object
        clients: object
        sliceingSuit?: string
        cardsMap?: object
        availablePlayerNums?: Array<string>
        winnedCards: {
                P1: number;
                P2: number;
                P3: number;
                P4: number;
        };
        max_players?: number
}
