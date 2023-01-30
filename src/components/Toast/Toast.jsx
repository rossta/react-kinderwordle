import React from 'react';

function determineToastMessage(result, secret, attemptCount) {
  if (!result) return null;
  if (!result.code) return null;

  const code = result.code;

  switch (code) {
    case 'unrecognized':
      return 'Not in word list';
    case 'insufficient':
      return 'Not enough letters';
    case 'loser':
      return `Better luck next time: ${secret.toUpperCase()}`;
    case 'winner':
      return [
        'WOW!!!!!',
        'Impressive',
        'You rock',
        'Well done',
        'Got it',
        'Phew!!!',
      ][attemptCount - 1];

    default:
      return null;
  }
}

function Toast({ message }) {
  if (!message || !message.length) return '';

  return <div className='toast show'>{message}</div>;
}

function GameToast({ result, secret, attemptCount }) {
  return (
    <Toast message={determineToastMessage(result, secret, attemptCount)} />
  );
}

export default GameToast;
