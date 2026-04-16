import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a",
      padding: "14px 24px", display: "flex", gap: 24,
      alignItems: "center", flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700,
        textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
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
  const statusColor = {
    live: "#639922",
    scheduled: "#378ADD",
    completed: "#888",
  };

  return (
    <Link to={`/matches/${match.match_id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
        padding: "16px 20px", marginBottom: 12, display: "flex",
        justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10, cursor: "pointer",
        transition: "border-color 0.2s",
      }}>
        <div>
          {/* Team names */}
          <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 4 }}>
            {match.team1_name} vs {match.team2_name}
          </div>

          {/* Short names as subtitle */}
          <div style={{ color: "#666", fontSize: 12, marginBottom: 6 }}>
            {match.team1_short} vs {match.team2_short}
          </div>

          {/* Date and venue */}
          <div style={{ color: "#888", fontSize: 13 }}>
            {new Date(match.match_date).toDateString()} · {match.venue}
          </div>

          {/* Result text for completed matches */}
          {match.result_text && (
            <div style={{ color: "#639922", fontSize: 13, marginTop: 6,
              fontWeight: 500 }}>
              {match.result_text}
            </div>
          )}

          {/* POTM */}
          {match.potm_name && (
            <div style={{ color: "#EF9F27", fontSize: 12, marginTop: 4 }}>
              🏅 POTM: {match.potm_name}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: (statusColor[match.status] || "#888") + "22",
            color: statusColor[match.status] || "#888",
          }}>
            {match.status === "live" ? "🔴 LIVE"
              : match.status === "scheduled" ? "📅 UPCOMING"
              : "✅ COMPLETED"}
          </span>
          <span style={{ color: "#555", fontSize: 18 }}>›</span>
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
    http.get(`/matches${query}`)
      .then((r) => { setMatches(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const switchTab = (t) => {
    setTab(t);
    loadMatches(t);
  };

  useEffect(() => { loadMatches("live"); }, []);

  const tabs = [
    ["live", "🔴 Live"],
    ["scheduled", "📅 Upcoming"],
    ["completed", "✅ Completed"],
    ["all", "All"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        <h1 style={{ margin: "0 0 24px", fontSize: 24 }}>Matches</h1>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => switchTab(k)}
              style={{
                padding: "8px 18px", borderRadius: 20, border: "none",
                cursor: "pointer", fontSize: 13,
                background: tab === k ? "#d85a30" : "#1a1a1a",
                color: tab === k ? "#fff" : "#888",
              }}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#555" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
            <p>No {tab === "all" ? "" : tab} matches found.</p>
          </div>
        ) : (
          matches.map((m) => <MatchCard key={m.match_id} match={m} />)
        )}
      </div>
    </div>
  );
}