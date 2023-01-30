import React, { useContext, memo } from 'react';

import Secret from '../Secret';
import Tile from './Tile';

import { getRowLetterState } from '../Game';

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

export default memo(Row);
