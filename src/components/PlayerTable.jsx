function PlayerTable({ players }) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Team</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.player_id}>
              <td>{player.player_id}</td>
              <td>{player.player_name}</td>
              <td>{player.team_id}</td>
              <td>{player.player_role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerTable;