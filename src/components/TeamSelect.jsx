function TeamSelect({ label, teams, value, onChange, name }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team.team_id} value={team.team_id}>
            {team.team_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TeamSelect;