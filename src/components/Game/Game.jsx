import {
  forwardRef,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import Secret from '../Secret';
import Toast from '../Toast';

import { words } from '../../words';
import { save, load } from '../../localStorageWrapper';

// Collect indexes of a given letter in a given string
const letterIndexes = (string, letter) => {
  let a = [],
    i = -1;
  while ((i = string.indexOf(letter, i + 1)) >= 0) a.push(i);
  return a;
};

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
  attemptIndexes = [],
  targetIndexes = attemptIndexes,
}) {
  const validAttemptIndexes = attemptIndexes.filter((i) => i < secret.length);
  if (!validAttemptIndexes.length) return 'empty';

  if (targetIndexes.map((i) => secret[i]).includes(letter)) {
    return 'correct';
  }

  if (
    isLetterPresent({
      secret,
      letter,
      attemptIndexes: validAttemptIndexes,
      targetIndexes,
    })
  ) {
    return 'present';
  }

  return 'absent';
}

export function getRowLetterState({
  attempt,
  secret,
  index,
  inCurrentRow = false,
}) {
  const letter = attempt[index];

  if (letter === undefined) {
    return 'empty';
  }

  if (inCurrentRow) {
    return 'tbd';
  }

  return getLetterState({
    secret,
    letter,
    attemptIndexes: letterIndexes(attempt, letter),
    targetIndexes: [index],
  });
}

const REVEAL_TIMEOUT_INCREMENT = 300;

function Tile({ letter, targetState, isRevealing, index }) {
  const [animation, setAnimation] = useState('idle');
  const [state, setState] = useState('empty');

  const delayStart = index * REVEAL_TIMEOUT_INCREMENT;
  const delayEnd = delayStart + REVEAL_TIMEOUT_INCREMENT;

  const resetAnimationWithTimeout = () => {
    setTimeout(() => {
      setAnimation('idle');
    }, REVEAL_TIMEOUT_INCREMENT);
  };
  useEffect(() => {
    if (isRevealing) {
      setAnimation('flip-in');
      setTimeout(() => {
        setState(targetState);
        resetAnimationWithTimeout();
      }, delayEnd);
    } else {
      if (targetState === 'tbd') {
        setAnimation('pop-in');
        resetAnimationWithTimeout();
      }
      setState(targetState);
    }
  }, [isRevealing, targetState, delayEnd]);

  let style = {};
  if (animation === 'flip-in') {
    style = {
      animationDelay: `${delayStart}ms, ${delayEnd}ms`,
    };
  }

  return (
    <div
      className='tile'
      data-state={state}
      data-animation={animation}
      style={style}
    >
      {letter}
    </div>
  );
}

function Row({
  number,
  attempt,
  rowState,
  columnCount,
  isRevealing = false,
  animationType = 'idle',
}) {
  console.log('row', {
    number,
    attempt,
    rowState,
    columnCount,
    animationType,
  });

  const secret = useContext(Secret);

  let animation = 'idle';
  let animationDelay = undefined;

  if (animationType === 'error') {
    animation = 'shake';
  }

  if (animationType === 'winner') {
    animation = 'bounce';
    animationDelay = `${columnCount * 250 + 500}ms`;
  }

  return (
    <div
      className='row'
      data-state={rowState}
      data-animation={animation}
      style={{
        animationDelay,
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {[...Array(columnCount).keys()].map((index) => {
        const letterState = getRowLetterState({
          attempt,
          secret,
          index,
          inCurrentRow: rowState === 'current',
        });

        return (
          <Tile
            key={index}
            index={index}
            letter={attempt[index]}
            isRevealing={isRevealing}
            targetState={letterState}
          />
        );
      })}
    </div>
  );
}

const RowMemo = memo(Row);

function EmptyRows({ emptyCount, startingNumber, columnCount }) {
  const empties = Array(emptyCount).fill(null);

  return (
    <>
      {empties.map((_, i) => (
        <RowMemo
          key={`empty-${i}`}
          number={startingNumber + i}
          attempt=''
          rowState='empty'
          columnCount={columnCount}
        />
      ))}
    </>
  );
}

function HistoryRows({
  history,
  columnCount,
  isRevealing = false,
  hasWinner = false,
}) {
  // Only animate last row in history
  const lastRowIndex = history.length - 1;

  return (
    <>
      {history.map((attempt, i) => (
        <RowMemo
          key={`history-${i}`}
          number={i + 1}
          columnCount={columnCount}
          attempt={attempt}
          rowState='attempted'
          animationType={hasWinner && i === lastRowIndex ? 'winner' : null}
          isRevealing={isRevealing && i === lastRowIndex}
        />
      ))}
    </>
  );
}

function CurrentRow({ attempt, number, columnCount, hasError }) {
  return (
    <RowMemo
      key='current'
      attempt={attempt}
      number={number}
      rowState='current'
      columnCount={columnCount}
      animationType={hasError ? 'error' : null}
    />
  );
}

function Board({ history, currentAttempt, result, rowCount, columnCount }) {
  const attemptsLeft = rowCount - history.length;
  const emptyCount = Math.max(attemptsLeft - 1, 0);

  return (
    <div className='board-container'>
      <div className='board' style={{ width: `${72.5 * columnCount}px` }}>
        {
          <HistoryRows
            history={history}
            columnCount={columnCount}
            isRevealing={result && !result.error}
            hasWinner={result && result.code === 'winner'}
          />
        }
        {attemptsLeft > 0 && (
          <CurrentRow
            attempt={currentAttempt}
            columnCount={columnCount}
            number={history.length + 1}
            hasError={result && result.error}
          />
        )}
        {
          <EmptyRows
            emptyCount={emptyCount}
            columnCount={columnCount}
            startingNumber={history.length + 2}
          />
        }
      </div>
    </div>
  );
}

function Button({ letter, keyValue, className, columnCount, state = 'empty' }) {
  return (
    <button
      key={letter}
      data-state={state}
      data-key={keyValue || letter}
      className={className}
    >
      {letter}
    </button>
  );
}

function LetterButton({ letter, history, columnCount }) {
  const [state, setState] = useState('empty');

  const secret = useContext(Secret);

  const attemptIndexes = [
    ...new Set(history.map((attempt) => letterIndexes(attempt, letter)).flat()),
  ];

  const letterState = getLetterState({ secret, letter, attemptIndexes });

  useEffect(() => {
    if (letterState === 'empty') {
      setState('empty');
    } else {
      setTimeout(() => {
        setState(letterState);
      }, REVEAL_TIMEOUT_INCREMENT * columnCount + REVEAL_TIMEOUT_INCREMENT);
    }
  }, [letterState]);

  console.log({ letter, state, letterState, history });

  return (
    <Button
      key={letter}
      letter={letter}
      state={state}
      columnCount={columnCount}
    />
  );
}

function Keyboard({ onKey, fade, history, columnCount }) {
  const onClick = (e) => {
    if (e.target.dataset.key) {
      onKey(e.target.dataset.key);
    }
    return false;
  };

  return (
    <div
      className='keyboard'
      onClick={onClick}
      style={{ opacity: fade ? 0.3 : undefined }}
    >
      <div className='keyboard-row'>
        {'qwertyuiop'.split('').map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            history={history}
            columnCount={columnCount}
          />
        ))}
      </div>
      <div className='keyboard-row'>
        <div className='half'></div>
        {'asdfghjkl'.split('').map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            history={history}
            columnCount={columnCount}
          />
        ))}
        <div className='half'></div>
      </div>
      <div className='keyboard-row'>
        {<Button className='one-and-a-half' letter='enter' />}
        {'zxcvbnm'.split('').map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            history={history}
            columnCount={columnCount}
          />
        ))}
        {<Button className='one-and-a-half' letter='←' keyValue='backspace' />}
      </div>
    </div>
  );
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
        <Toast result={result} secret={result} attemptCount={attemptCount} />
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
