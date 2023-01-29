import {
  createContext,
  forwardRef,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { words } from '../../words';
import { save, load } from '../../localStorageWrapper';

const Secret = createContext();

// Collect indexes of a given letter in a given string
const letterIndexes = (string, letter) => {
  let a = [],
    i = -1;
  while ((i = string.indexOf(letter, i + 1)) >= 0) a.push(i);
  return a;
};

// Determining whether a letter is "present" but not already matched as "correct"
const isPresentAndNotCorrect = (attempt, secret, index) => {
  const letter = attempt[index];

  // Find occurrences of letter in both attempt and secret strings
  const attemptIndexes = letterIndexes(attempt, letter);
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

  if (presentAttempts.includes(index)) {
    return 'present';
  }
};

export function getLetterState({
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

  if (letter === secret[index]) {
    return 'correct';
  }

  if (isPresentAndNotCorrect(attempt, secret, index)) {
    return 'present';
  }

  return 'absent';
}

function Tile({ letter, targetState, isRevealing, index }) {
  const [animation, setAnimation] = useState('idle');
  const [state, setState] = useState('empty');

  const delay = index * 250;

  useEffect(() => {
    if (isRevealing) {
      setAnimation('flip-in');
      setTimeout(() => {
        setState(targetState);
      }, delay + 250);
    } else {
      setState(targetState);
    }
  }, [isRevealing, targetState]);

  return (
    <div
      className='tile'
      data-state={state}
      data-animation={animation}
      style={{
        animationDelay: `${delay}ms, ${delay + 250}ms`,
      }}
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
        const letterState = getLetterState({
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

const Button = forwardRef(({ letter, keyValue, className }, ref) => (
  <button
    ref={ref}
    key={letter}
    data-key={keyValue || letter}
    className={className}
  >
    {letter}
  </button>
));
Button.displayName = 'Button';

function Keyboard({ onKey, fade }) {
  const secret = useContext(Secret);

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
          <Button key={letter} letter={letter} />
        ))}
      </div>
      <div className='keyboard-row'>
        <div className='half'></div>
        {'asdfghjkl'.split('').map((letter) => (
          <Button key={letter} letter={letter} />
        ))}
        <div className='half'></div>
      </div>
      <div className='keyboard-row'>
        {<Button className='one-and-a-half' letter='enter' />}
        {'zxcvbnm'.split('').map((letter) => (
          <Button key={letter} letter={letter} />
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

function NewGameButton({ onClick }) {
  return (
    <a className='cta-button' onClick={onClick}>
      New game
    </a>
  );
}

function determineToastMessage(result, attemptCount) {
  if (!result) return null;
  if (!result.code) return null;

  const code = result.code;

  switch (code) {
    case 'unrecognized':
      return 'Not in word list';
    case 'insufficient':
      return 'Not enough letters';
    case 'winner':
      return [
        'WOW!!!!!',
        'Impressive',
        'You rock',
        'Well done',
        'Got it',
        'Phew!!!',
      ][attemptCount - 1];

    default:
      return null;
  }
}

function Toast({ message }) {
  if (!message || !message.length) return '';

  return <div className='toast show'>{message}</div>;
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
  const [winner, setWinner] = useState(false);
  const [result, setResult] = useState(null);
  const lastAttempt = history.slice(-1)[0];

  useEventListener('keydown', handleKeyDown);

  useEffect(() => {
    if (lastAttempt === secret) {
      setWinner(true);
    }
  }, [lastAttempt]);

  function resetGame() {
    setWinner(false);
    setSecret(getSecret());
    setHistory([]);
  }

  function setWinnerWithTimeout() {
    setTimeout(() => {
      setWinner(true);
    }, 2000);
  }

  function setResultWithTimeout(result) {
    setResult(result);
    setTimeout(() => {
      setResult(null);
    }, 2000);
  }

  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    handleKey(e.key.toLowerCase());
  }

  function handleKey(key) {
    console.log('key entered', key);

    if (winner || result) {
      return;
    }

    if (history.length === limit) {
      return;
    }

    if (key === 'enter') {
      if (currentAttempt.length < secret.length) {
        console.log('insufficent');
        setResultWithTimeout({ code: 'insufficient', error: true });
        return;
      }

      if (currentAttempt.length > secret.length) {
        return;
      }

      if (!words.includes(currentAttempt)) {
        // alert('Not in word list');
        setResultWithTimeout({ code: 'unrecognized', error: true });
        return;
      }

      if (currentAttempt === secret) {
        console.log('Winner!');
        setWinnerWithTimeout();
        setResultWithTimeout({ code: 'winner' });
      } else {
        console.log('Good try, guess again!');
        setResultWithTimeout({ code: 'incorrect' });
      }

      setHistory([...history, currentAttempt]);
      setCurrentAttempt('');
    }

    if (key === 'backspace') {
      console.log('Removing letter');
      setCurrentAttempt(currentAttempt.slice(0, currentAttempt.length - 1));

      return;
    }

    if (/^[a-z]$/.test(key)) {
      if (currentAttempt.length < secret.length) {
        console.log('Adding letter: ', currentAttempt, ' + ', key);
        setCurrentAttempt(currentAttempt + key);
        return;
      }
    }
  }

  if (!secret) return 'Loading';

  return (
    <Secret.Provider value={secret}>
      <div className='game'>
        <Toast message={determineToastMessage(result, history.length)} />
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
          fade={winner || history.length >= limit}
        />
      </div>
      <div className='actions'>
        <NewGameButton onClick={resetGame} />
      </div>
    </Secret.Provider>
  );
}
