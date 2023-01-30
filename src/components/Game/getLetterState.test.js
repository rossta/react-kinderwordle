import { getLetterState, letterIndexes } from './getLetterState';

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
    });
  });
});

describe('letterIndexes', () => {
  it('returns indexes of given letter in string', () => {
    expect(letterIndexes('hello', 'h')).toEqual([0]);
    expect(letterIndexes('hello', 'l')).toEqual([2, 3]);
    expect(letterIndexes('hello', 'a')).toEqual([]);
  });
});
