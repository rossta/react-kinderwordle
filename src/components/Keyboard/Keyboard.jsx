import React, { useContext, useEffect, useState, memo } from 'react';

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

function LetterButton({ letter, history }) {
  const [state, setState] = useState('empty');

  const secret = useContext(Secret);

  const columnCount = secret.length;
  const letterState = getLetterState({ secret, letter, attempts: history });

  useEffect(() => {
    if (letterState === 'empty') {
      setState('empty');
    } else {
      // When the letter has been used in the previous attempt, we delay revealing
      // its state on the keyboard until the reveal animation has completed
      const delay = REVEAL_TIMEOUT_INCREMENT * (columnCount + 1);

      setTimeout(() => {
        setState(letterState);
      }, delay);
    }
  }, [letterState]);

  // For debugging
  console.log({ letter, state, letterState, history });

  return <Button key={letter} letter={letter} state={state} />;
}

const ButtonMemo = memo(Button);
const LetterButtonMemo = memo(LetterButton);

function Keyboard({ onKey, fade, history }) {
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
          <LetterButtonMemo key={letter} letter={letter} history={history} />
        ))}
      </div>
      <div className='keyboard-row'>
        <div className='half'></div>
        {'asdfghjkl'.split('').map((letter) => (
          <LetterButtonMemo key={letter} letter={letter} history={history} />
        ))}
        <div className='half'></div>
      </div>
      <div className='keyboard-row'>
        {<ButtonMemo className='one-and-a-half' letter='enter' />}
        {'zxcvbnm'.split('').map((letter) => (
          <LetterButtonMemo key={letter} letter={letter} history={history} />
        ))}
        {
          <ButtonMemo
            className='one-and-a-half'
            letter='←'
            keyValue='backspace'
          />
        }
      </div>
    </div>
  );
}

export default Keyboard;
