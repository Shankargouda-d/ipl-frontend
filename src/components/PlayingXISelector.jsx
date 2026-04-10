function PlayingXISelector({ players, selectedPlayers, onToggle }) {
  return (
    <div className="card">
      <h3>Select Playing XI</h3>
      {players.map((player) => (
        <label key={player.player_id} className="checkbox-row">
          <input
            type="checkbox"
            checked={selectedPlayers.some((p) => p.player_id === player.player_id)}
            onChange={() => onToggle(player)}
          />
          {player.player_name} - {player.player_role}
        </label>
      ))}
    </div>
  );
}

export default PlayingXISelector;