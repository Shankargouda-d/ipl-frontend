import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import TossForm from "../../components/TossForm";
import { getTeams } from "../../api/teamsApi";
import { saveToss } from "../../api/tossApi";

function MatchSetupPage() {
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const handleSaveToss = async (payload) => {
    const response = await saveToss(payload);
    setMessage(response.message);
  };

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Match Setup</h2>
        <TossForm teams={teams} onSubmit={handleSaveToss} />
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default MatchSetupPage;