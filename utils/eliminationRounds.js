export function getBracketSize(teamCount) {
  let bracketSize = 2;
  while (bracketSize < teamCount) {
    bracketSize *= 2;
  }
  return bracketSize;
}

export function getEliminationRoundTitle(teamCount, roundIndex) {
  const bracketSize = getBracketSize(Math.max(teamCount, 2));
  const remainingTeams = bracketSize / Math.pow(2, roundIndex);

  if (remainingTeams <= 2) return 'Final';
  if (remainingTeams === 4) return 'Yarı Final';
  if (remainingTeams === 8) return 'Çeyrek Final';
  return `Son ${remainingTeams}`;
}
