import React, { useContext } from 'react';

import Secret from '../Secret';
import Tile from './Tile';

import { getLetterState, letterIndexes } from '../Game';

export function getRowLetterState({ attempt, secret, index }) {
  const letter = attempt[index];

  return getLetterState({
    secret,
    letter,
    attempts: [attempt],
    targetIndexes: [index],
  });
}

function BasicRow({
  rowState,
  columnCount,
  renderTile,
  animation = 'idle',
  style = {},
}) {
  return (
    <div
      className='row'
      data-state={rowState}
      data-animation={animation}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        ...style,
      }}
    >
      {[...Array(columnCount).keys()].map(renderTile)}
    </div>
  );
}

// A history row displays all previous attempts, including the one just
// attempted. Letter states will be "correct", "present", or "absent". A
// winning attempt will cause the row to bounce. A just-entered attempt "is
// revealing" which has a flip-in animation.
export function HistoryRow({
  attempt,
  rowState,
  animationType,
  columnCount,
  isRevealing,
}) {
  const secret = useContext(Secret);
  let animation = 'idle';
  let animationDelay = undefined;

  if (animationType === 'winner') {
    animation = 'bounce';
    animationDelay = `${columnCount * 250 + 500}ms`;
  }

  return (
    <BasicRow
      rowState={rowState}
      animation={animation}
      style={{
        animationDelay,
      }}
      columnCount={columnCount}
      renderTile={(index) => {
        const letterState = getRowLetterState({
          attempt,
          secret,
          index,
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
      }}
    />
  );
}

// An empty row only has empty tiles
export function EmptyRow({ columnCount }) {
  return (
    <BasicRow
      rowState='empty'
      animation='idle'
      columnCount={columnCount}
      renderTile={(index) => (
        <Tile key={index} index={index} targetState='empty' />
      )}
    />
  );
}

// The current row will shake when an error is detected. Its tile letter states
// are "tbd" (a letter has been chosen but we don't know if it's in the word
// yet) and "empty" (no letter).
export function CurrentRow({ attempt, columnCount, animationType }) {
  let animation = 'idle';
  if (animationType === 'error') {
    animation = 'shake';
  }

  const getCurrentLetterState = (letter) => {
    return letter !== undefined ? 'tbd' : 'empty';
  };

  return (
    <BasicRow
      rowState='current'
      animation={animation}
      columnCount={columnCount}
      renderTile={(index) => {
        const letter = attempt[index];
        return (
          <Tile
            key={index}
            index={index}
            letter={letter}
            targetState={getCurrentLetterState(letter)}
          />
        );
      }}
    />
  );
}

export default BasicRow;
