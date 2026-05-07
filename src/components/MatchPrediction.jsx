import { useEffect, useState } from "react";
import http from "../api/http";

export default function MatchPrediction({ match }) {
  const [predictionData, setPredictionData] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem(`voted_match_${match.match_id}`);
    if (voted) setHasVoted(true);
    loadPredictions();
  }, [match.match_id]);

  const loadPredictions = async () => {
    try {
      const res = await http.get(`/predictions/${match.match_id}`);
      setPredictionData(res.data);
    } catch (err) {
      console.error("Failed to load predictions:", err);
    }
  };

  const handleVote = async (teamId) => {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      await http.post("/predictions", {
        match_id: match.match_id,
        team_id: teamId,
      });
      localStorage.setItem(`voted_match_${match.match_id}`, teamId);
      setHasVoted(true);
      await loadPredictions();
    } catch (err) {
      console.error("Failed to vote:", err);
    } finally {
      setVoting(false);
    }
  };

  if (!predictionData) return null;

  const { total_votes, votes } = predictionData;
  const team1Votes = votes[match.team1_id] || 0;
  const team2Votes = votes[match.team2_id] || 0;
  
  const team1Percent = total_votes > 0 ? Math.round((team1Votes / total_votes) * 100) : 50;
  const team2Percent = total_votes > 0 ? 100 - team1Percent : 50;

  return (
    <div style={{
      background: "#151515", border: "1px solid #2a2a2a", borderRadius: 12,
      padding: "16px", marginTop: "-4px", marginBottom: "16px"
    }}>
      <div style={{ textAlign: "center", fontSize: 13, color: "#aaa", marginBottom: 12, fontWeight: 600, letterSpacing: 0.5 }}>
        {hasVoted ? "Viewers Prediction Results" : "Who will win?"}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: hasVoted && total_votes > 0 ? 16 : 0 }}>
        <button 
          onClick={() => handleVote(match.team1_id)}
          disabled={hasVoted || voting}
          style={{
            flex: 1, padding: "10px", borderRadius: 8, cursor: hasVoted ? "default" : "pointer",
            background: hasVoted && localStorage.getItem(`voted_match_${match.match_id}`) == match.team1_id ? "#d85a3033" : "#222", 
            color: "#fff", border: `1px solid ${hasVoted && localStorage.getItem(`voted_match_${match.match_id}`) == match.team1_id ? "#d85a30" : "#333"}`,
            fontWeight: 600, transition: "background 0.2s", opacity: (hasVoted || voting) ? 0.8 : 1
          }}
        >
          {match.team1_short} {hasVoted && total_votes > 0 && `(${team1Percent}%)`}
        </button>
        
        <button 
          onClick={() => handleVote(match.team2_id)}
          disabled={hasVoted || voting}
          style={{
            flex: 1, padding: "10px", borderRadius: 8, cursor: hasVoted ? "default" : "pointer",
            background: hasVoted && localStorage.getItem(`voted_match_${match.match_id}`) == match.team2_id ? "#378ADD33" : "#222", 
            color: "#fff", border: `1px solid ${hasVoted && localStorage.getItem(`voted_match_${match.match_id}`) == match.team2_id ? "#378ADD" : "#333"}`,
            fontWeight: 600, transition: "background 0.2s", opacity: (hasVoted || voting) ? 0.8 : 1
          }}
        >
          {match.team2_short} {hasVoted && total_votes > 0 && `(${team2Percent}%)`}
        </button>
      </div>

      {hasVoted && total_votes > 0 && (
        <div style={{
          height: 8, borderRadius: 4, background: "#333", overflow: "hidden", display: "flex"
        }}>
          <div style={{ width: `${team1Percent}%`, background: "#d85a30", transition: "width 0.5s ease" }} />
          <div style={{ width: `${team2Percent}%`, background: "#378ADD", transition: "width 0.5s ease" }} />
        </div>
      )}
      
      {hasVoted && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#666", marginTop: 10 }}>
          {total_votes} total votes
        </div>
      )}
    </div>
  );
}
