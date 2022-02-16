import {
  useState,
  createContext,
  useContext,
  useEffect,
  forwardRef,
} from 'react';

import { words } from '../../words';

const Secret = createContext();

const getLetterState = (attemptLetter, index, secret, attempted) => {
  if (attemptLetter === undefined) {
    return 'empty';
  }

  if (!attempted) {
    return 'tbd';
  }

  const correctLetter = secret[index];

  if (attemptLetter === correctLetter) {
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

  console.log('Rendering row ', index, reveal);

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
        const letterState = getLetterState(letter, i, secret, attempted);

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
  console.log({ reveal });

  const rowData = [
    ...history.map((attempt, i) => ({
      attempt,
      state: 'attempted',
      reveal: reveal && i === history.length - 1 ? reveal : null,
    })),

    {
      attempt: currentAttempt,
      state: 'current',
      error,
    },

    ...Array(rows - (history.length + 1))
      .fill(null)
      .map(() => ({ attempt: '', state: 'empty' })),
  ];

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

function Keyboard({ onKey }) {
  const row1 = 'qwertyuiop';
  const row2 = 'asdfghjkl';
  const row3 = 'zxcvbnm';

  const onClick = (e) => {
    if (e.target.dataset.key) {
      onKey(e.target.dataset.key);
    }
    // handleKey(key);
    return false;
  };

  return (
    <div className='keyboard' onClick={onClick}>
      <div className='keyboard-row'>
        {row1.split('').map((letter) => (
          <Button key={letter} letter={letter} />
        ))}
      </div>
      <div className='keyboard-row'>
        {row2.split('').map((letter) => (
          <Button key={letter} letter={letter} />
        ))}
      </div>
      <div className='keyboard-row'>
        {<Button className='one-and-a-half' letter='enter' />}
        {row3.split('').map((letter) => (
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

const secret = getSecret();

export default function Game() {
  const limit = 6;
  const [history, setHistory] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [winner, setWinner] = useState(false);
  const [error, setError] = useState(null);
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
        setWinner(true);
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

  return (
    <div className='game'>
      <Secret.Provider value={secret}>
        <Board
          history={history}
          currentAttempt={currentAttempt}
          rows={limit}
          reveal={reveal}
          error={error}
          columns={secret.length}
        />
        <Keyboard history={history} columns={secret.length} onKey={handleKey} />
      </Secret.Provider>
    </div>
  );
}
