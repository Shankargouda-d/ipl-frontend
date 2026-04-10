function ExtrasForm({ extras, onChange }) {
  return (
    <div className="card form-grid">
      <h3>Extras</h3>
      <input type="number" placeholder="Wides" value={extras.wides} onChange={(e) => onChange("wides", e.target.value)} />
      <input type="number" placeholder="No Balls" value={extras.no_balls} onChange={(e) => onChange("no_balls", e.target.value)} />
      <input type="number" placeholder="Byes" value={extras.byes} onChange={(e) => onChange("byes", e.target.value)} />
      <input type="number" placeholder="Leg Byes" value={extras.leg_byes} onChange={(e) => onChange("leg_byes", e.target.value)} />
      <input type="number" placeholder="Penalty Runs" value={extras.penalty_runs} onChange={(e) => onChange("penalty_runs", e.target.value)} />
    </div>
  );
}

export default ExtrasForm;