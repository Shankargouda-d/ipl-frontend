import { useEffect, useState } from "react";
import { getPlayerStats } from "../../api/statsApi";

function UserPlayerStatsPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getPlayerStats().then(setPlayers);
  }, []);

  return (
    <div className="content">
      <h2>Player Stats</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Matches</th>
              <th>Runs</th>
              <th>Wickets</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.player_id}>
                <td>{player.player_name}</td>
                <td>{player.team_id}</td>
                <td>{player.matches_played}</td>
                <td>{player.total_runs}</td>
                <td>{player.total_wickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserPlayerStatsPage;