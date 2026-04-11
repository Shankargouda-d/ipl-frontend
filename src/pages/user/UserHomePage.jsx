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

export default function UserHomePage() {
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    http.get("/matches?status=live").then((r) => setLive(r.data));
    http.get("/matches?status=scheduled").then((r) => setUpcoming(r.data.slice(0, 3)));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "64px 16px 48px", background: "linear-gradient(180deg,#1a0a00 0%,#0a0a0a 100%)" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏏</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px" }}>IPL Scorecard 2025</h1>
        <p style={{ color: "#888", fontSize: 16, marginBottom: 28 }}>Live scores · Stats · Points Table</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/matches" style={{ padding: "12px 24px", borderRadius: 10, background: "#d85a30", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>View All Matches</Link>
          <Link to="/stats" style={{ padding: "12px 24px", borderRadius: 10, background: "#1a1a1a", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid #333" }}>Player Stats</Link>
          <Link to="/points" style={{ padding: "12px 24px", borderRadius: 10, background: "#1a1a1a", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid #333" }}>Points Table</Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {live.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>🟢 Live Now</h2>
            {live.map((m) => <MatchCard key={m.match_id} match={m} />)}
          </div>
        )}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>📅 Upcoming Matches</h2>
          {upcoming.length === 0
            ? <p style={{ color: "#555" }}>No upcoming matches scheduled.</p>
            : upcoming.map((m) => <MatchCard key={m.match_id} match={m} />)}
          <Link to="/matches" style={{ color: "#d85a30", fontSize: 14, textDecoration: "none" }}>View all matches →</Link>
        </div>
      </div>
    </div>
  );
}