import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../../api/matchesApi";

function UserMatchListPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getMatches().then(setMatches);
  }, []);

  return (
    <div className="content">
      <h2>Match List</h2>
      <div className="grid">
        {matches.map((match) => (
          <div key={match.match_id} className="card">
            <h3>{match.team1_name} vs {match.team2_name}</h3>
            <p>{match.venue}</p>
            <Link to={`/matches/${match.match_id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserMatchListPage;