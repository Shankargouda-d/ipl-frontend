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
      <div style={{
        position: "relative",
        textAlign: "center",
        padding: "90px 16px 70px",
        backgroundImage: "url('/ipl_hero_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}>
        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(10,10,10,0.85) 70%, #0a0a0a 100%)",
          zIndex: 0,
        }} />
        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 60, marginBottom: 10, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }}>🏏</div>
          <h1 style={{
            fontSize: 42, fontWeight: 900, margin: "0 0 10px",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
            letterSpacing: "-0.5px",
          }}>TATA IPL 2026</h1>
          <p style={{
            color: "#ccc", fontSize: 16, marginBottom: 32,
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}>Live scores · Stats · Points Table</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/matches" style={{ padding: "13px 28px", borderRadius: 10, background: "#d85a30", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 20px rgba(216,90,48,0.45)" }}>View All Matches</Link>
            <Link to="/stats" style={{ padding: "13px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>Player Stats</Link>
            <Link to="/points" style={{ padding: "13px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>Points Table</Link>
          </div>
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