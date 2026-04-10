import { useState } from "react";

function PlayerForm({ teams, onSubmit }) {
  const [form, setForm] = useState({
    player_name: "",
    team_id: "",
    player_role: "Batsman",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ player_name: "", team_id: "", player_role: "Batsman" });
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <input
        type="text"
        name="player_name"
        placeholder="Player Name"
        value={form.player_name}
        onChange={handleChange}
        required
      />

      <select name="team_id" value={form.team_id} onChange={handleChange} required>
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team.team_id} value={team.team_id}>
            {team.team_name}
          </option>
        ))}
      </select>

      <select name="player_role" value={form.player_role} onChange={handleChange}>
        <option value="Batsman">Batsman</option>
        <option value="Bowler">Bowler</option>
        <option value="All-Rounder">All-Rounder</option>
        <option value="Wicket-Keeper">Wicket-Keeper</option>
      </select>

      <button type="submit">Add Player</button>
    </form>
  );
}

export default PlayerForm;