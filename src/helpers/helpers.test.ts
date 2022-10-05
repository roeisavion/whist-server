import { scoreCaculator, isGameFinished } from './helpers'

describe('scoreCaculator test', () => {
    let isUnder, scoreMap, numBets, wins, expectedScoreMap;

    test('scoreCaculator 1', () => {
        isUnder = false;
        scoreMap = {
            'P1': 0,
            'P2': 0,
            'P3': 0,
            'P4': 0
        }
        numBets = {
            'P1': 6,
            'P2': 6,
            'P3': 2,
            'P4': 0
        };
        wins = {
            'P1': 4,
            'P2': 6,
            'P3': 3,
            'P4': 0
        };
        expectedScoreMap = {
            'P1': -20,
            'P2': 46,
            'P3': -10,
            'P4': 25
        };

        expect(scoreCaculator(numBets, wins, scoreMap, isUnder)).toEqual(expectedScoreMap)

    });

    test('scoreCaculator 2', () => {
        isUnder = true;
        scoreMap = {
            'P1': -20,
            'P2': 46,
            'P3': -10,
            'P4': 25
        }
        numBets = {
            'P1': 0,
            'P2': 0,
            'P3': 8,
            'P4': 3
        };
        wins = {
            'P1': 0,
            'P2': 3,
            'P3': 8,
            'P4': 2
        };
        expectedScoreMap = {
            'P1': 30,
            'P2': 16,
            'P3': 64,
            'P4': 15
        };

        expect(scoreCaculator(numBets, wins, scoreMap, isUnder)).toEqual(expectedScoreMap)

    });

})

describe("isGameFinished tests", () => {

    test('game shouldnt finish', () => {
        const cardsMap = { P1: ["8C"], center: [], P2: 0, P3: 0, P4: 0 }
        expect(isGameFinished(cardsMap)).toEqual(false)
    });

    test('game should finish', () => {
        const cardsMap = { P1: [], center: [], P2: 0, P3: 0, P4: 0 }
        expect(isGameFinished(cardsMap)).toEqual(true)
    });
})
