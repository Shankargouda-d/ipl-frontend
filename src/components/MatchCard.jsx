function MatchCard({ match }) {
  return (
    <div className="card">
      <h3>Match #{match.match_no}</h3>
      <p>{match.team1_name} vs {match.team2_name}</p>
      <p>{match.match_date} | {match.match_time}</p>
      <p>{match.venue}</p>
    </div>
  );
}

export default MatchCard;