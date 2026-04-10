import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import PlayerForm from "../../components/PlayerForm";
import PlayerTable from "../../components/PlayerTable";
import { getTeams } from "../../api/teamsApi";
import { addPlayer, getPlayersByTeam } from "../../api/playersApi";

function AddPlayersPage() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await getTeams();
    setTeams(data);
    if (data.length) {
      const teamPlayers = await getPlayersByTeam(data[0].team_id);
      setPlayers(teamPlayers);
    }
  };

  const handleAddPlayer = async (payload) => {
    await addPlayer(payload);
    const updated = await getPlayersByTeam(payload.team_id);
    setPlayers(updated);
  };

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Add Players</h2>
        <PlayerForm teams={teams} onSubmit={handleAddPlayer} />
        <PlayerTable players={players} />
      </div>
    </div>
  );
}

export default AddPlayersPage;