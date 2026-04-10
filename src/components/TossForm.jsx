import { useState } from "react";

function TossForm({ teams, onSubmit }) {
  const [form, setForm] = useState({
    match_id: "",
    toss_winner_team_id: "",
    toss_decision: "bat",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      className="card form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <input name="match_id" placeholder="Match ID" value={form.match_id} onChange={handleChange} />
      <select name="toss_winner_team_id" value={form.toss_winner_team_id} onChange={handleChange}>
        <option value="">Toss Winner</option>
        {teams.map((team) => (
          <option key={team.team_id} value={team.team_id}>
            {team.team_name}
          </option>
        ))}
      </select>
      <select name="toss_decision" value={form.toss_decision} onChange={handleChange}>
        <option value="bat">Bat</option>
        <option value="bowl">Bowl</option>
      </select>
      <button type="submit">Save Toss</button>
    </form>
  );
}

export default TossForm;