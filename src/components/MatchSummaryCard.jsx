function MatchSummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="card">
      <h3>Match Summary</h3>
      <p>{summary.team1_name} : {summary.team1_runs}</p>
      <p>{summary.team2_name} : {summary.team2_runs}</p>
      <p>{summary.result_text}</p>
    </div>
  );
}

export default MatchSummaryCard;