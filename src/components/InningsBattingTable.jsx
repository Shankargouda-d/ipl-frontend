function InningsBattingTable({ rows, onChange }) {
  return (
    <div className="card">
      <h3>Batting</h3>
      {rows.map((row, index) => (
        <div className="inline-grid" key={index}>
          <input
            placeholder="Player ID"
            value={row.player_id}
            onChange={(e) => onChange(index, "player_id", e.target.value)}
          />
          <input
            placeholder="Runs"
            type="number"
            value={row.runs}
            onChange={(e) => onChange(index, "runs", e.target.value)}
          />
          <input
            placeholder="Balls"
            type="number"
            value={row.balls}
            onChange={(e) => onChange(index, "balls", e.target.value)}
          />
          <input
            placeholder="4s"
            type="number"
            value={row.fours}
            onChange={(e) => onChange(index, "fours", e.target.value)}
          />
          <input
            placeholder="6s"
            type="number"
            value={row.sixes}
            onChange={(e) => onChange(index, "sixes", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default InningsBattingTable;