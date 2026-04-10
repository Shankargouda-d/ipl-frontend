import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMatchById } from "../../api/matchesApi";
import { getInningsByMatch } from "../../api/inningsApi";
import http from "../../api/http";

function UserMatchDetailsPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      const matchData = await getMatchById(matchId);
      const inningsData = await getInningsByMatch(matchId);
      const resultData = await http.get(`/results/${matchId}`);
      setMatch(matchData);
      setInnings(inningsData);
      setResult(resultData.data);
    }
    load();
  }, [matchId]);

  return (
    <div className="content">
      <div className="card">
        <h2>Match Details</h2>
        {match && (
          <>
            <p>Match No: {match.match_no}</p>
            <p>{match.team1_id} vs {match.team2_id}</p>
            <p>{match.venue}</p>
          </>
        )}
      </div>

      {innings.map((inn) => (
        <div key={inn.innings_id} className="card">
          <h3>Innings {inn.innings_no}</h3>
          <p>Batting Team: {inn.batting_team_id}</p>
          <p>Total: {inn.total_runs}/{inn.wickets}</p>
          <p>Overs: {inn.overs_bowled}.{inn.balls_bowled}</p>
        </div>
      ))}

      {result && (
        <div className="card">
          <h3>Result</h3>
          <p>Winner: {result.winner_team_id || "Tie"}</p>
          <p>{result.win_type} by {result.win_margin}</p>
        </div>
      )}
    </div>
  );
}

export default UserMatchDetailsPage;