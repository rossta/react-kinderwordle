import { getRowLetterState } from './Row';

describe('getLetterStates', () => {
  let secret = 'here';

  describe('attempt: help', () => {
    let attempt = 'help';

    it('has correct', () => {
      expect(getRowLetterState({ secret, attempt, index: 0 })).toEqual(
        'correct'
      );
      expect(getRowLetterState({ secret, attempt, index: 1 })).toEqual(
        'correct'
      );
    });
  });
});

describe('getRowLetterState', () => {
  describe('secret: here', () => {
    let secret = 'here';

    describe('attempt: help', () => {
      let attempt = 'help';

      it('has correct', () => {
        expect(getRowLetterState({ secret, attempt, index: 0 })).toEqual(
          'correct'
        );
        expect(getRowLetterState({ secret, attempt, index: 1 })).toEqual(
          'correct'
        );
      });

      it('has absent', () => {
        expect(getRowLetterState({ secret, attempt, index: 2 })).toEqual(
          'absent'
        );
        expect(getRowLetterState({ secret, attempt, index: 3 })).toEqual(
          'absent'
        );
      });

      it('has empty', () => {
        expect(getRowLetterState({ secret, attempt, index: 4 })).toEqual(
          'empty'
        );
      });
    });
  });

  describe('secret: help', () => {
    let secret = 'help';

    describe('attempt: here', () => {
      let attempt = 'here';

      it('has correct', () => {
        expect(getRowLetterState({ secret, attempt, index: 0 })).toEqual(
          'correct'
        );
        expect(getRowLetterState({ secret, attempt, index: 1 })).toEqual(
          'correct'
        );
      });

      it('has absent', () => {
        expect(getRowLetterState({ secret, attempt, index: 2 })).toEqual(
          'absent'
        );
        expect(getRowLetterState({ secret, attempt, index: 3 })).toEqual(
          'absent'
        );
      });

      it('has empty', () => {
        expect(getRowLetterState({ secret, attempt, index: 4 })).toEqual(
          'empty'
        );
      });
    });
  });

  describe('secret: ride', () => {
    let secret = 'ride';

    describe('attempt: here', () => {
      let attempt = 'here';

      it('has correct', () => {
        expect(getRowLetterState({ secret, attempt, index: 3 })).toEqual(
          'correct'
        );
      });

      it('has present', () => {
        expect(getRowLetterState({ secret, attempt, index: 2 })).toEqual(
          'present'
        );
      });

      it('has absent', () => {
        expect(getRowLetterState({ secret, attempt, index: 0 })).toEqual(
          'absent'
        );
        expect(getRowLetterState({ secret, attempt, index: 1 })).toEqual(
          'absent'
        );
      });

      it('has empty', () => {
        expect(getRowLetterState({ secret, attempt, index: 4 })).toEqual(
          'empty'
        );
      });
    });
  });

  describe('secret: when', () => {
    let secret = 'when';

    describe('attempt: here', () => {
      let attempt = 'here';

      it('has present', () => {
        expect(getRowLetterState({ secret, attempt, index: 0 })).toEqual(
          'present'
        );
        expect(getRowLetterState({ secret, attempt, index: 1 })).toEqual(
          'present'
        );
      });

      it('has absent', () => {
        expect(getRowLetterState({ secret, attempt, index: 2 })).toEqual(
          'absent'
        );
        expect(getRowLetterState({ secret, attempt, index: 3 })).toEqual(
          'absent'
        );
      });

      it('has empty', () => {
        expect(getRowLetterState({ secret, attempt, index: 4 })).toEqual(
          'empty'
        );
      });
    });
  });
});
