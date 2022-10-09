import { caculateRoundWinner } from './gameFunctions'

describe('caculateRoundWinner test', () => {
    let centerCards, slicingSuit;
    
    test('no slicing, normal', () => {
        centerCards = [["10S", "P2"], ["QS", "P3"], ["8S", "P4"], ["KS", "P1"]]
        slicingSuit = 'D'
        expect(caculateRoundWinner(centerCards, slicingSuit)).toEqual(["KS", "P1"])
    });

    test('with slicing', () => {
        centerCards = [["10S", "P2"], ["QS", "P3"], ["8D", "P4"], ["KS", "P1"]]
        slicingSuit = 'D'
        expect(caculateRoundWinner(centerCards, slicingSuit)).toEqual(["8D", "P4"])
    });

    test('no slicing, starting suits wins', () => {
        centerCards = [["10H", "P2"], ["QS", "P3"], ["8S", "P4"], ["KS", "P1"]]
        slicingSuit = 'D'
        expect(caculateRoundWinner(centerCards, slicingSuit)).toEqual(["10H", "P2"])
    });
})