import React, { useContext, useEffect, useState } from 'react';

import Secret from '../Secret';
import {
  letterIndexes,
  getLetterState,
  REVEAL_TIMEOUT_INCREMENT,
} from '../Game';

function Button({ letter, keyValue, className, state = 'empty' }) {
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

export default Keyboard;
