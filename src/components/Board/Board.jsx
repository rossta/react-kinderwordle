import React from 'react';

import Row from './Row';

export function HistoryRows({
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
        <Row
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

export function CurrentRow({ attempt, number, columnCount, hasError }) {
  return (
    <Row
      key='current'
      attempt={attempt}
      number={number}
      rowState='current'
      columnCount={columnCount}
      animationType={hasError ? 'error' : null}
    />
  );
}

export function EmptyRows({ emptyCount, startingNumber, columnCount }) {
  const empties = Array(emptyCount).fill(null);

  return (
    <>
      {empties.map((_, i) => (
        <Row
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
