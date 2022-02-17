import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { words } from '../../words';
import { save, load } from '../../localStorageWrapper';

const Secret = createContext();

const getLetterState = (attemptLetter, secret, attempted, indices = []) => {
  if (attemptLetter === undefined) {
    return 'empty';
  }

  if (!attempted) {
    return 'tbd';
  }

  if (indices.map((i) => secret[i]).includes(attemptLetter)) {
    return 'correct';
  }

  if (secret.includes(attemptLetter)) {
    return 'present';
  }

  return 'absent';
};

function Tile({ letter, targetState, reveal, index }) {
  const [animation, setAnimation] = useState('idle');
  const [state, setState] = useState('empty');

  const delay = index * 250;

  useEffect(() => {
    if (reveal) {
      setAnimation('flip-in');
      setTimeout(() => {
        setState(targetState);
      }, delay + 250);
    } else {
      setState(targetState);
    }
  }, [reveal, targetState]);

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

function Row({ attempt, index, state, columns, error = null, reveal = null }) {
  const secret = useContext(Secret);

  let animation = 'idle';
  let animationDelay = undefined;

  if (error) {
    animation = 'shake';
  }

  if (reveal === 'winner') {
    animation = 'bounce';
    animationDelay = `${columns * 250 + 500}ms`;
  }

  return (
    <div
      className='row'
      data-state={state}
      data-animation={animation}
      style={{ animationDelay, gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {[...Array(columns).keys()].map((i) => {
        const letter = attempt[i];
        const attempted = state === 'attempted';
        const letterState = getLetterState(letter, secret, attempted, [i]);

        return (
          <Tile
            key={i}
            index={i}
            letter={letter}
            reveal={reveal}
            targetState={letterState}
          />
        );
      })}
    </div>
  );
}

function Board({ history, currentAttempt, reveal, error, rows, columns }) {
  const empties = Array(rows - (history.length + 1)).fill(null);

  return (
    <div className='board-container'>
      <div className='board' style={{ width: `${72.5 * columns}px` }}>
        {history.map((attempt, i) => (
          <Row
            key={i}
            index={i}
            columns={columns}
            attempt={attempt}
            state='attempted'
            reveal={reveal && i === history.length - 1 ? reveal : null}
          />
        ))}
        {
          <Row
            attempt={currentAttempt}
            state='current'
            error={error}
            columns={columns}
          />
        }
        {empties.map((_, i) => (
          <Row key={i} attempt='' state='empty' columns={columns} />
        ))}
      </div>
    </div>
  );
}

const Button = forwardRef(({ letter, keyValue }, ref) => (
  <button ref={ref} key={letter} data-key={keyValue || letter}>
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
        {'asdfghjkl'.split('').map((letter) => (
          <Button key={letter} letter={letter} />
        ))}
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

export default function Game() {
  const limit = 6;
  const [secret, setSecret] = usePersistedSecret();
  const [history, setHistory] = usePersistedHistory();
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [winner, setWinner] = useState(false);
  const [error, setError] = useState(null);
  const [reveal, setReveal] = useState(null);
  const gameRef = useRef(null);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    const lastAttempt = history.slice(-1)[0];
    if (lastAttempt === secret) {
      setWinner(true);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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

  function setRevealWithTimeout(reason) {
    setReveal(reason);
    setTimeout(() => {
      setReveal(null);
    }, 2000);
  }

  function setErrorWithTimeout(reason) {
    setError(reason);
    setTimeout(() => {
      setError(null);
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

    if (winner || reveal) {
      return;
    }

    if (history.length === limit) {
      return;
    }

    if (key === 'enter') {
      if (currentAttempt.length < secret.length) {
        console.log('insufficent');
        setErrorWithTimeout('insufficient');
        return;
      }

      if (currentAttempt.length > secret.length) {
        return;
      }

      if (!words.includes(currentAttempt)) {
        alert('Not in word list');
        setErrorWithTimeout('unrecognized');
        return;
      }

      if (currentAttempt === secret) {
        console.log('Winner!');
        setRevealWithTimeout('winner');
        setWinnerWithTimeout();
      } else {
        console.log('Attempt: incorrect!');
        setRevealWithTimeout('incorrect');
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
        <Board
          history={history}
          currentAttempt={currentAttempt}
          rows={limit}
          reveal={reveal}
          error={error}
          columns={secret.length}
          onKeyDown={handleKeyDown}
        />
        <Keyboard
          history={history}
          columns={secret.length}
          onKey={handleKey}
          fade={winner}
        />
        {winner && <NewGameButton onClick={resetGame} />}
      </div>
    </Secret.Provider>
  );
}
