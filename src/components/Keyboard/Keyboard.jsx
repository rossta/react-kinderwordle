import React, { useContext, useEffect, useState, memo } from 'react';

import { History, Secret } from '../Contexts';
import { getLetterState, REVEAL_TIMEOUT_INCREMENT } from '../Game';

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

function LetterButton({ letter, letterState, isRevealing, delay }) {
  const [state, setState] = useState('empty');

  // For debugging
  console.log('Keyboard letter', {
    letter,
    state,
    letterState,
    isRevealing,
    delay,
  });

  useEffect(() => {
    if (isRevealing) {
      // When the letter has been used in the previous attempt, we delay revealing
      // its state on the keyboard until the reveal animation has completed
      setTimeout(() => {
        setState(letterState);
      }, delay);
    } else {
      setState(letterState);
    }
  }, [letterState]);

  return <ButtonMemo key={letter} letter={letter} state={state} />;
}

const ButtonMemo = memo(Button);
const LetterButtonMemo = memo(LetterButton);

function Keyboard({ onKey, fade, result }) {
  const secret = useContext(Secret);
  const history = useContext(History);

  const delay = REVEAL_TIMEOUT_INCREMENT * (secret.length + 1);
  const isRevealing = result && !result.error;

  const onClick = (e) => {
    if (e.target.dataset.key) {
      onKey(e.target.dataset.key);
    }
    return false;
  };

  const buildLetterButtonsFrom = (letters) =>
    letters.split('').map((letter) => {
      const letterState = getLetterState({ secret, letter, attempts: history });

      return (
        <LetterButtonMemo
          key={letter}
          letter={letter}
          letterState={letterState}
          isRevealing={isRevealing && letterState !== 'empty'}
          delay={delay}
        />
      );
    });

  return (
    <div
      className='keyboard'
      onClick={onClick}
      style={{ opacity: fade ? 0.3 : undefined }}
    >
      <div className='keyboard-row'>{buildLetterButtonsFrom('qwertyuiop')}</div>
      <div className='keyboard-row'>
        <div className='half'></div>
        {buildLetterButtonsFrom('asdfghjkl')}
        <div className='half'></div>
      </div>
      <div className='keyboard-row'>
        {<ButtonMemo className='one-and-a-half' letter='enter' />}
        {buildLetterButtonsFrom('zxcvbnm')}
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
