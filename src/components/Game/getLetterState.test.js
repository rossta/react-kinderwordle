import { getLetterState } from './Game';

describe('secret: here', () => {
  let secret = 'here';

  describe('attempt: help', () => {
    let attempt = 'help';

    it('has correct', () => {
      expect(getLetterState({ secret, attempt, index: 0 })).toEqual('correct');
      expect(getLetterState({ secret, attempt, index: 1 })).toEqual('correct');
    });

    it('has absent', () => {
      expect(getLetterState({ secret, attempt, index: 2 })).toEqual('absent');
      expect(getLetterState({ secret, attempt, index: 3 })).toEqual('absent');
    });

    it('has empty', () => {
      expect(getLetterState({ secret, attempt, index: 4 })).toEqual('empty');
    });
  });
});

describe('secret: help', () => {
  let secret = 'help';

  describe('attempt: here', () => {
    let attempt = 'here';

    it('has correct', () => {
      expect(getLetterState({ secret, attempt, index: 0 })).toEqual('correct');
      expect(getLetterState({ secret, attempt, index: 1 })).toEqual('correct');
    });

    it('has absent', () => {
      expect(getLetterState({ secret, attempt, index: 2 })).toEqual('absent');
      expect(getLetterState({ secret, attempt, index: 3 })).toEqual('absent');
    });

    it('has empty', () => {
      expect(getLetterState({ secret, attempt, index: 4 })).toEqual('empty');
    });
  });
});

describe('secret: ride', () => {
  let secret = 'ride';

  describe('attempt: here', () => {
    let attempt = 'here';

    it('has correct', () => {
      expect(getLetterState({ secret, attempt, index: 3 })).toEqual('correct');
    });

    it('has present', () => {
      expect(getLetterState({ secret, attempt, index: 2 })).toEqual('present');
    });

    it('has absent', () => {
      expect(getLetterState({ secret, attempt, index: 0 })).toEqual('absent');
      expect(getLetterState({ secret, attempt, index: 1 })).toEqual('absent');
    });

    it('has empty', () => {
      expect(getLetterState({ secret, attempt, index: 4 })).toEqual('empty');
    });
  });
});
