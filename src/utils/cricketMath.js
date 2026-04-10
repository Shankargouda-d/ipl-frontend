export const strikeRate = (runs, balls) => {
  if (!balls) return 0;
  return ((Number(runs) / Number(balls)) * 100).toFixed(2);
};

export const economyRate = (runs, overs, balls = 0) => {
  const totalBalls = Number(overs) * 6 + Number(balls);
  if (!totalBalls) return 0;
  return (Number(runs) / (totalBalls / 6)).toFixed(2);
};

export const totalExtras = ({ wides = 0, no_balls = 0, byes = 0, leg_byes = 0, penalty_runs = 0 }) =>
  Number(wides) + Number(no_balls) + Number(byes) + Number(leg_byes) + Number(penalty_runs);