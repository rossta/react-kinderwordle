// Collect indexes of a given letter in a given string
export function letterIndexes(string, letter) {
  let a = [],
    i = -1;
  while ((i = string.indexOf(letter, i + 1)) >= 0) a.push(i);
  return a;
}

// Determining whether a letter is "present" but not already matched as "correct"
const isLetterPresent = ({ secret, letter, attemptIndexes, targetIndexes }) => {
  // Find occurrences of letter in secret string
  const secretIndexes = letterIndexes(secret, letter);

  // Determine which occurrences of letter in secret are not matched
  const unmatchedSecretIndexes = secretIndexes.filter(
    (x) => attemptIndexes.indexOf(x) < 0
  );

  // Determine if given attempt index is one of the first N unmatched indexes
  const presentAttempts = attemptIndexes.slice(
    0,
    unmatchedSecretIndexes.length
  );

  const presentIndexes = presentAttempts.filter(
    (i) => targetIndexes.indexOf(i) >= 0
  );

  // For debugging:
  // console.log({
  //   secret,
  //   letter,
  //   targetIndexes,
  //   attemptIndexes,
  //   secretIndexes,
  //   unmatchedSecretIndexes,
  //   presentAttempts,
  //   presentIndexes,
  // });
  if (presentIndexes.length) {
    return true;
  } else {
    return false;
  }
};

// For a given secret, letter, and list of attempts, determine the best of
// "correct", "present", "absent", or "empty" states of letter in the set
// attempts. If given target indexes, limit the comparison only to those
// indexes in the secret and given attempts.
// This function is used to determine the letter states to present on the
// board history by word and on the keyboard history by letter.
export function getLetterState({
  secret,
  letter,
  attempts = [],
  targetIndexes = null,
}) {
  const attemptIndexes = [
    ...new Set(
      attempts.map((attempt) => letterIndexes(attempt, letter)).flat()
    ),
  ];
  let givenTargetIndexes = targetIndexes;
  if (!givenTargetIndexes) {
    givenTargetIndexes = attemptIndexes;
  }

  const validAttemptIndexes = attemptIndexes.filter((i) => i < secret.length);
  if (!validAttemptIndexes.length) return 'empty';

  if (givenTargetIndexes.map((i) => secret[i]).includes(letter)) {
    return 'correct';
  }

  if (
    isLetterPresent({
      secret,
      letter,
      attemptIndexes: validAttemptIndexes,
      targetIndexes: givenTargetIndexes,
    })
  ) {
    return 'present';
  }

  return 'absent';
}
