import React, { memo } from 'react';

import { HistoryRow, EmptyRow, CurrentRow } from './Row';

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
        <HistoryRow
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

function EmptyRows({ emptyCount, columnCount }) {
  const empties = Array(emptyCount).fill(null);

  return (
    <>
      {empties.map((_, i) => (
        <EmptyRow key={`empty-${i}`} columnCount={columnCount} />
      ))}
    </>
  );
}

// Using memo here will ensure we don't unnecessarily re-render board rows when
// the Board state change. Example: Typing a letter changes "currentAttempt"
// which affects the CurrentRow but not HistoryRows or EmptyRows.
const HistoryRowsMemo = memo(HistoryRows);
const CurrentRowMemo = memo(CurrentRow);
const EmptyRowsMemo = memo(EmptyRows);

function Board({ history, currentAttempt, result, rowCount, columnCount }) {
  const attemptsLeft = rowCount - history.length;
  const emptyCount = Math.max(attemptsLeft - 1, 0);

  const isRevealing = result && !result.error;
  const hasError = result && result.error;
  const hasWinner = result && result.code === 'winner';

  return (
    <div className='board-container'>
      <div className='board' style={{ width: `${72.5 * columnCount}px` }}>
        {
          <HistoryRowsMemo
            history={history}
            columnCount={columnCount}
            isRevealing={isRevealing}
            hasWinner={hasWinner}
          />
        }
        {attemptsLeft > 0 && (
          <CurrentRowMemo
            attempt={currentAttempt}
            columnCount={columnCount}
            animationType={hasError ? 'error' : null}
          />
        )}
        {<EmptyRowsMemo emptyCount={emptyCount} columnCount={columnCount} />}
      </div>
    </div>
  );
}

export default Board;
