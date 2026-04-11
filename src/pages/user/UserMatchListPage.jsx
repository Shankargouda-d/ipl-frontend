import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "14px 24px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700, textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <Link to="/admin" style={{ color: "#555", textDecoration: "none", fontSize: 12 }}>Admin</Link>
      </div>
    </nav>
  );
}

function MatchCard({ match }) {
  const statusColors = { live: "#639922", scheduled: "#378ADD", completed: "#888" };
  return (
    <Link to={`/matches/${match.match_id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
        padding: "16px 20px", marginBottom: 12, display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, cursor: "pointer"
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
            {match.team1_short} vs {match.team2_short}
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            {new Date(match.match_date).toDateString()} · {match.venue}
          </div>
          {match.result_text && (
            <div style={{ color: "#639922", fontSize: 13, marginTop: 4 }}>{match.result_text}</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: (statusColors[match.status] || "#888") + "22",
            color: statusColors[match.status] || "#888"
          }}>
            {match.status === "live" ? "🔴 LIVE" : match.status.toUpperCase()}
          </span>
          <span style={{ color: "#555", fontSize: 14 }}>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function UserMatchListPage() {
  const [tab, setTab] = useState("live");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMatches = (status) => {
    setLoading(true);
    const query = status && status !== "all" ? `?status=${status}` : "";
    http.get(`/matches${query}`).then((r) => { setMatches(r.data); setLoading(false); });
  };

  const switchTab = (t) => { setTab(t); loadMatches(t); };

  useEffect(() => { loadMatches("live"); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ margin: "0 0 24px" }}>Matches</h1>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[["live", "🔴 Live"], ["scheduled", "📅 Upcoming"], ["completed", "✅ Completed"], ["all", "All"]].map(([k, l]) => (
            <button key={k} onClick={() => switchTab(k)} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
              background: tab === k ? "#d85a30" : "#1a1a1a", color: tab === k ? "#fff" : "#888"
            }}>{l}</button>
          ))}
        </div>
        {loading
          ? <p style={{ color: "#666" }}>Loading...</p>
          : matches.length === 0
            ? <p style={{ color: "#555" }}>No matches found.</p>
            : matches.map((m) => <MatchCard key={m.match_id} match={m} />)}
      </div>
    </div>
  );
}