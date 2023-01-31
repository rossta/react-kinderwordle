import React, { memo, useCallback, useContext } from 'react';

import { Secret } from '../Contexts';
import Tile from './Tile';

import { getLetterState } from '../Game';

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
  console.log('Board row', { rowState });
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

const BasicRowMemo = memo(BasicRow);

// A history row displays all previous attempts, including the one just
// attempted. Letter states will be "correct", "present", or "absent". A
// winning attempt will cause the row to bounce. A just-entered attempt "is
// revealing" which has a flip-in animation.
export function HistoryRow({ attempt, rowState, animationType, isRevealing }) {
  const secret = useContext(Secret);
  const columnCount = secret.length;

  let animation = 'idle';
  let animationDelay = undefined;

  if (animationType === 'winner') {
    animation = 'bounce';
    animationDelay = `${columnCount * 250 + 500}ms`;
  }

  const renderTile = useCallback(
    (index) => {
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
    },
    [attempt, secret, isRevealing]
  );

  return (
    <BasicRowMemo
      rowState={rowState}
      animation={animation}
      style={{
        animationDelay,
      }}
      columnCount={columnCount}
      renderTile={renderTile}
    />
  );
}

// An empty row only has empty tiles
export function EmptyRow() {
  const secret = useContext(Secret);
  const columnCount = secret.length;

  const renderTile = useCallback(
    (index) => <Tile key={index} index={index} targetState='empty' />,
    []
  );

  return (
    <BasicRowMemo
      rowState='empty'
      animation='idle'
      columnCount={columnCount}
      renderTile={renderTile}
    />
  );
}

// The current row will shake when an error is detected. Its tile letter states
// are "tbd" (a letter has been chosen but we don't know if it's in the word
// yet) and "empty" (no letter).
export function CurrentRow({ attempt, animationType }) {
  const secret = useContext(Secret);
  const columnCount = secret.length;

  let animation = 'idle';
  if (animationType === 'error') {
    animation = 'shake';
  }

  const getCurrentLetterState = (letter) => {
    return letter !== undefined ? 'tbd' : 'empty';
  };

  return (
    <BasicRowMemo
      rowState='current'
      rowIndex='current'
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
