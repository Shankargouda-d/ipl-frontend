function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="card">
      <h3>Result</h3>
      <p>Winner Team ID: {result.winner_team_id || "Tie"}</p>
      <p>Win Type: {result.win_type}</p>
      <p>Margin: {result.win_margin}</p>
      <p>Player of Match: {result.player_of_match_id}</p>
    </div>
  );
}

export default ResultCard;