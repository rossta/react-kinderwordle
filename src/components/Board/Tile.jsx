import React, { useState, useEffect } from 'react';

import { REVEAL_TIMEOUT_INCREMENT } from '../Game';

function BasicTile({ letter, state, animation, style = {} }) {
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

function FlipInTile({ delayStart, delayEnd, ...props }) {
  const style = {
    animationDelay: `${delayStart}ms, ${delayEnd}ms`,
  };

  return <BasicTile style={style} {...props} />;
}

function Tile({ letter, targetState, isRevealing, index }) {
  const [animation, setAnimation] = useState('idle');
  const [state, setState] = useState('empty');

  // Delay "reveal" animation based on tile index in row
  const delayStart = index * REVEAL_TIMEOUT_INCREMENT;
  const delayEnd = delayStart + REVEAL_TIMEOUT_INCREMENT;

  const resetAnimationWithTimeout = () => {
    setTimeout(() => {
      setAnimation('idle');
    }, REVEAL_TIMEOUT_INCREMENT);
  };

  //
  useEffect(() => {
    // Reveal tile with flip, set target state when done
    if (isRevealing) {
      setAnimation('flip-in');
      setTimeout(() => {
        setState(targetState);
        resetAnimationWithTimeout();
      }, delayEnd);
    } else {
      // Add brief "pop" when value is entered
      if (targetState === 'tbd') {
        setAnimation('pop-in');
        resetAnimationWithTimeout();
      }
      setState(targetState);
    }
  }, [isRevealing, targetState, delayEnd]);

  if (animation === 'flip-in') {
    return (
      <FlipInTile
        letter={letter}
        state={state}
        animation={animation}
        delayStart={delayStart}
        delayEnd={delayEnd}
      />
    );
  } else {
    return <BasicTile letter={letter} state={state} animation={animation} />;
  }
}

export default Tile;
