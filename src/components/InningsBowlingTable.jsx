function InningsBowlingTable({ rows, onChange }) {
  return (
    <div className="card">
      <h3>Bowling</h3>
      {rows.map((row, index) => (
        <div className="inline-grid" key={index}>
          <input
            placeholder="Player ID"
            value={row.player_id}
            onChange={(e) => onChange(index, "player_id", e.target.value)}
          />
          <input
            placeholder="Overs"
            type="number"
            value={row.overs}
            onChange={(e) => onChange(index, "overs", e.target.value)}
          />
          <input
            placeholder="Balls"
            type="number"
            value={row.balls}
            onChange={(e) => onChange(index, "balls", e.target.value)}
          />
          <input
            placeholder="Runs"
            type="number"
            value={row.runs_conceded}
            onChange={(e) => onChange(index, "runs_conceded", e.target.value)}
          />
          <input
            placeholder="Wickets"
            type="number"
            value={row.wickets}
            onChange={(e) => onChange(index, "wickets", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default InningsBowlingTable;