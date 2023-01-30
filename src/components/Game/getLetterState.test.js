import { getLetterState } from './Game';

describe('getLetterState', () => {
  describe('secret: here', () => {
    let secret = 'here';

    describe('letter: a', () => {
      let letter = 'a';

      it('is absent', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attempts: ['aeee', 'eaee', 'eeae', 'eeea'],
          })
        ).toEqual('absent');
      });

      it('is empty when not attempted', () => {
        expect(getLetterState({ secret, letter, attempts: [] })).toEqual(
          'empty'
        );
      });

      it('is absent', () => {
        expect(
          getLetterState({ secret, letter, attemptIndexes: [0, 1, 2, 3, 4] })
        ).toEqual('absent');
      });

      it('is empty when not attempted', () => {
        expect(getLetterState({ secret, letter, attemptIndexes: [] })).toEqual(
          'empty'
        );
      });
    });

    describe('letter: h', () => {
      let letter = 'h';

      it('is correct for intersecting secret and single attempt', () => {
        expect(getLetterState({ secret, letter, attempts: ['help'] })).toEqual(
          'correct'
        );
      });

      it('is correct for intersecting secret and multiple attempts', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attempts: ['hooo', 'ohoo', 'ooho', 'oooh'],
          })
        ).toEqual('correct');
      });

      it('is correct for intersecting secret, attempts, targets', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attempts: ['hooo', 'ohoo'],
            targetIndexes: [0],
          })
        ).toEqual('correct');
      });

      it('is present for secret including single attempt', () => {
        expect(getLetterState({ secret, letter, attempts: ['ohoo'] })).toEqual(
          'present'
        );
      });

      it('is present for secret including multiple attempts', () => {
        expect(
          getLetterState({ secret, letter, attempts: ['ohoo', 'ooho', 'oooh'] })
        ).toEqual('present');
      });

      it('is present for secret including multiple attempts and targets', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attempts: ['ohoo', 'ooho', 'oooh'],
            targetIndexes: [1, 2],
          })
        ).toEqual('present');
      });

      it('is empty for no matching attempts', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attempts: ['ooooh'],
          })
        ).toEqual('empty');
      });

      //////

      it('is correct for intersecting secret and single attempt', () => {
        expect(getLetterState({ secret, letter, attemptIndexes: [0] })).toEqual(
          'correct'
        );
      });

      it('is correct for intersecting secret and multiple attempts', () => {
        expect(
          getLetterState({ secret, letter, attemptIndexes: [0, 1, 2, 3] })
        ).toEqual('correct');
      });

      it('is correct for intersecting secret, attempts, targets', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attemptIndexes: [0, 1],
            targetIndexes: [0],
          })
        ).toEqual('correct');
      });

      it('is present for secret including single attempt', () => {
        expect(getLetterState({ secret, letter, attemptIndexes: [1] })).toEqual(
          'present'
        );
      });

      it('is present for secret including multiple attempts', () => {
        expect(
          getLetterState({ secret, letter, attemptIndexes: [1, 2, 3] })
        ).toEqual('present');
      });

      it('is present for secret including multiple attempts and targets', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attemptIndexes: [1, 2, 3],
            targetIndexes: [1, 2],
          })
        ).toEqual('present');
      });

      it('is empty for no matching attempts', () => {
        expect(
          getLetterState({
            secret,
            letter,
            attemptIndexes: [4],
          })
        ).toEqual('empty');
      });
    });
  });
});
