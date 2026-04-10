import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import ResultCard from "../../components/ResultCard";
import http from "../../api/http";

function ResultsPage() {
  const [matchId, setMatchId] = useState("");
  const [result, setResult] = useState(null);

  const handleFetch = async () => {
    const { data } = await http.get(`/results/${matchId}`);
    setResult(data);
  };

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Results</h2>
        <div className="card form-grid">
          <input value={matchId} onChange={(e) => setMatchId(e.target.value)} placeholder="Enter Match ID" />
          <button onClick={handleFetch}>Generate / View Result</button>
        </div>
        <ResultCard result={result} />
      </div>
    </div>
  );
}

export default ResultsPage;