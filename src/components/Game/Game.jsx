import { useEffect, useRef, useState } from 'react';

import Secret from '../Secret';
import Toast from '../Toast';
import Board from '../Board';
import Keyboard from '../Keyboard';

import { words } from '../../words';
import { save, load } from '../../localStorageWrapper';

export const REVEAL_TIMEOUT_INCREMENT = 300;

// Collect indexes of a given letter in a given string
export function letterIndexes(string, letter) {
  let a = [],
    i = -1;
  while ((i = string.indexOf(letter, i + 1)) >= 0) a.push(i);
  return a;
}

// Determining whether a letter is "present" but not already matched as "correct"
const isLetterPresent = ({ secret, letter, attemptIndexes, targetIndexes }) => {
  // Find occurrences of letter in secret string
  const secretIndexes = letterIndexes(secret, letter);

  // Determine which occurrences of letter in secret are not matched
  const unmatchedSecretIndexes = secretIndexes.filter(
    (x) => attemptIndexes.indexOf(x) < 0
  );

  // Determine if given attempt index is one of the first N unmatched indexes
  const presentAttempts = attemptIndexes.slice(
    0,
    unmatchedSecretIndexes.length
  );

  const presentIndexes = presentAttempts.filter(
    (i) => targetIndexes.indexOf(i) >= 0
  );

  // For debugging:
  // console.log({
  //   secret,
  //   letter,
  //   targetIndexes,
  //   attemptIndexes,
  //   secretIndexes,
  //   unmatchedSecretIndexes,
  //   presentAttempts,
  //   presentIndexes,
  // });
  if (presentIndexes.length) {
    return true;
  } else {
    return false;
  }
};

export function getLetterState({
  secret,
  letter,
  attempts = [],
  attemptIndexes = [],
  targetIndexes = null,
}) {
  let givenAttemptIndexes = attemptIndexes;
  if (attempts.length) {
    givenAttemptIndexes = [
      ...new Set(
        attempts.map((attempt) => letterIndexes(attempt, letter)).flat()
      ),
    ];
  }
  let givenTargetIndexes = targetIndexes;
  if (!givenTargetIndexes) {
    givenTargetIndexes = givenAttemptIndexes;
  }

  const validAttemptIndexes = givenAttemptIndexes.filter(
    (i) => i < secret.length
  );
  if (!validAttemptIndexes.length) return 'empty';

  if (givenTargetIndexes.map((i) => secret[i]).includes(letter)) {
    return 'correct';
  }

  if (
    isLetterPresent({
      secret,
      letter,
      attemptIndexes: validAttemptIndexes,
      targetIndexes: givenTargetIndexes,
    })
  ) {
    return 'present';
  }

  return 'absent';
}

const getSecret = () => {
  return words[Math.floor(Math.random() * words.length)];
};

const usePersistedSecret = () => {
  const [secret, setSecret] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    const value = load('secret') || getSecret();

    setSecret(value);

    loadedRef.current = true;
  }, []);

  useEffect(() => {
    save('secret', secret);
  }, [secret]);

  return [secret, setSecret];
};

const usePersistedHistory = () => {
  const [history, setHistory] = useState([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    const persistedHistory = load('history');
    console.log('loaded history', history);

    loadedRef.current = true;
    if (persistedHistory) {
      setHistory(persistedHistory);
    }
  }, []);

  useEffect(() => {
    save('history', history);
  }, [history]);

  return [history, setHistory];
};

function NewGameButton({ onClick, gameOver }) {
  return (
    <a
      className={'cta-button ' + (gameOver ? 'game-over' : 'secondary')}
      onClick={onClick}
    >
      New game
    </a>
  );
}

function useEventListener(eventName, handler) {
  useEffect(() => {
    window.addEventListener(eventName, handler);

    return () => window.removeEventListener(eventName, handler);
  }, [handler]);
}

export default function Game() {
  const limit = 6;
  const [secret, setSecret] = usePersistedSecret();
  const [history, setHistory] = usePersistedHistory();
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const lastAttempt = history.slice(-1)[0];

  const attemptCount = history.length;

  useEventListener('keydown', handleKeyDown);

  useEffect(() => {
    if (lastAttempt === secret || attemptCount >= limit) {
      setTimeout(() => setGameOver(true), LONGER_TIMEOUT);
    }
  }, [lastAttempt, attemptCount]);

  function resetGame() {
    setHistory([]);
    setCurrentAttempt('');
    setGameOver(false);
    setSecret(getSecret());
    setResult(null);
  }

  const SHORTER_TIMEOUT = 1500;
  const LONGER_TIMEOUT = 4000;
  function setResultWithTimeout(
    result,
    timeout = SHORTER_TIMEOUT,
    callback = () => {}
  ) {
    setResult(result);
    setTimeout(() => {
      setResult(null);
      callback();
    }, timeout);
  }

  function handleAttempt() {
    console.log('handleAttempt for', currentAttempt);

    /* Invalid attempts */

    if (currentAttempt.length > secret.length) {
      setCurrentAttempt(currentAttempt.slice(0, secret.length));
      return;
    }

    if (currentAttempt.length < secret.length) {
      console.log('insufficent');
      setResultWithTimeout({ code: 'insufficient', error: true });
      return;
    }

    if (!words.includes(currentAttempt)) {
      setResultWithTimeout({ code: 'unrecognized', error: true });
      return;
    }

    /* Valid attempts */

    if (currentAttempt === secret) {
      console.log('Winner!');
      setResultWithTimeout({ code: 'winner' }, LONGER_TIMEOUT, () =>
        setGameOver(true)
      );
    } else if (attemptCount + 1 >= limit) {
      console.log('Out of tries!');
      setResultWithTimeout({ code: 'loser' }, LONGER_TIMEOUT, () =>
        setGameOver(true)
      );
    } else {
      console.log('Good try, guess again!');
      setResultWithTimeout({ code: 'incorrect' });
    }

    setHistory([...history, currentAttempt]);
    setCurrentAttempt('');
  }

  function deleteLastLetter() {
    console.log('Removing letter');
    setCurrentAttempt(currentAttempt.slice(0, currentAttempt.length - 1));
  }

  function addLetter(letter) {
    console.log('Adding letter: ', currentAttempt, ' + ', letter);
    setCurrentAttempt(currentAttempt + letter);
  }

  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    handleKey(e.key.toLowerCase());
  }

  function handleKey(key) {
    console.log('key entered', key);

    if (gameOver || result || attemptCount >= limit) {
      return;
    }

    if (key === 'enter') {
      handleAttempt();

      return;
    }

    if (key === 'backspace') {
      deleteLastLetter();

      return;
    }

    if (/^[a-z]$/.test(key) && currentAttempt.length < secret.length) {
      addLetter(key);

      return;
    }
  }

  if (!secret) return 'Loading';

  return (
    <Secret.Provider value={secret}>
      <div className='game'>
        <Toast result={result} secret={secret} attemptCount={attemptCount} />
        <Board
          history={history}
          currentAttempt={currentAttempt}
          rowCount={limit}
          result={result}
          columnCount={secret.length}
          onKeyDown={handleKeyDown}
        />
        <Keyboard
          history={history}
          columnCount={secret.length}
          onKey={handleKey}
          fade={gameOver}
        />
      </div>
      <div className='actions'>
        <NewGameButton onClick={resetGame} gameOver={gameOver} />
      </div>
    </Secret.Provider>
  );
}
