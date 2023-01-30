import React, { useState, useEffect, useContext, memo } from 'react';

import Secret from '../Secret';
import { getRowLetterState, REVEAL_TIMEOUT_INCREMENT } from '../Game';

function Tile({ letter, targetState, isRevealing, index }) {
  const [animation, setAnimation] = useState('idle');
  const [state, setState] = useState('empty');

  const delayStart = index * REVEAL_TIMEOUT_INCREMENT;
  const delayEnd = delayStart + REVEAL_TIMEOUT_INCREMENT;

  const resetAnimationWithTimeout = () => {
    setTimeout(() => {
      setAnimation('idle');
    }, REVEAL_TIMEOUT_INCREMENT);
  };
  useEffect(() => {
    if (isRevealing) {
      setAnimation('flip-in');
      setTimeout(() => {
        setState(targetState);
        resetAnimationWithTimeout();
      }, delayEnd);
    } else {
      if (targetState === 'tbd') {
        setAnimation('pop-in');
        resetAnimationWithTimeout();
      }
      setState(targetState);
    }
  }, [isRevealing, targetState, delayEnd]);

  let style = {};
  if (animation === 'flip-in') {
    style = {
      animationDelay: `${delayStart}ms, ${delayEnd}ms`,
    };
  }

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

export default Board;
