import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import { getTeamColor } from "../../utils/teamColors";

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a",
      padding: "14px 24px", display: "flex", gap: 24,
      alignItems: "center", flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700,
        textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Team Stats", "/team-stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <Link to="/admin" style={{ color: "#555", textDecoration: "none", fontSize: 12 }}>Admin</Link>
      </div>
    </nav>
  );
}

function MatchCard({ match }) {
  const statusColor = { live: "#639922", scheduled: "#378ADD", completed: "#888" };
  const tc1 = getTeamColor(match.team1_short);
  const tc2 = getTeamColor(match.team2_short);

  return (
    <Link to={`/matches/${match.match_id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
        padding: "16px 20px", marginBottom: 12, display: "flex",
        justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10, cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d85a30"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div>
          {/* Team names with color indicators */}
          <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: tc1, display: "inline-block" }} />
              {match.team1_name}
            </span>
            <span style={{ color: "#555", fontSize: 14 }}>vs</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: tc2, display: "inline-block" }} />
              {match.team2_name}
            </span>
          </div>

          {/* Short names as subtitle */}
          <div style={{ color: "#666", fontSize: 12, marginBottom: 6 }}>
            {match.team1_short} vs {match.team2_short} · Match #{match.match_number}
          </div>

          {/* Date and venue */}
          <div style={{ color: "#888", fontSize: 13 }}>
            📅 {new Date(match.match_date).toDateString()} · 📍 {match.venue}
          </div>

          {/* Result text */}
          {match.result_text && (
            <div style={{ color: "#639922", fontSize: 13, marginTop: 6, fontWeight: 500 }}>
              🏆 {match.result_text}
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
  const [tab, setTab] = useState("all");
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(""); // "" = all teams
  const [loading, setLoading] = useState(false);

  // Fetch all teams once for the dropdown
  useEffect(() => {
    http.get("/teams").then((r) => setTeams(r.data)).catch(() => {});
  }, []);

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

  useEffect(() => { loadMatches("all"); }, []);

  // Client-side team filter
  const filtered = selectedTeam
    ? matches.filter(
        (m) =>
          String(m.team1_id) === selectedTeam ||
          String(m.team2_id) === selectedTeam
      )
    : matches;

  const tabs = [
    ["live", "🔴 Live"],
    ["scheduled", "📅 Upcoming"],
    ["completed", "✅ Completed"],
    ["all", "All Matches"],
  ];

  const selectedTeamObj = teams.find((t) => String(t.team_id) === selectedTeam);
  const teamAccent = selectedTeamObj ? getTeamColor(selectedTeamObj.short_name) : "#d85a30";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        <h1 style={{ margin: "0 0 6px", fontSize: 24 }}>Matches</h1>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>TATA IPL 2026 · All fixtures & results</p>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => switchTab(k)}
              style={{
                padding: "8px 18px", borderRadius: 20, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: tab === k ? "#d85a30" : "#1a1a1a",
                color: tab === k ? "#fff" : "#888",
                transition: "background 0.2s",
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Team filter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
          background: "#1a1a1a", borderRadius: 10, padding: "12px 16px",
          border: `1px solid ${selectedTeam ? teamAccent + "66" : "#2a2a2a"}`,
          transition: "border-color 0.3s",
        }}>
          <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>🔍 Filter by Team:</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {/* All Teams button */}
            <button
              onClick={() => setSelectedTeam("")}
              style={{
                padding: "5px 14px", borderRadius: 16, border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: !selectedTeam ? "#d85a30" : "#2a2a2a",
                color: !selectedTeam ? "#fff" : "#888",
                transition: "background 0.2s",
              }}
            >
              All
            </button>
            {/* Team chips */}
            {teams.map((t) => {
              const tc = getTeamColor(t.short_name);
              const isActive = String(t.team_id) === selectedTeam;
              return (
                <button
                  key={t.team_id}
                  onClick={() => setSelectedTeam(isActive ? "" : String(t.team_id))}
                  style={{
                    padding: "5px 14px", borderRadius: 16,
                    border: `1.5px solid ${isActive ? tc : "#333"}`,
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    background: isActive ? `${tc}33` : "#111",
                    color: isActive ? tc : "#888",
                    transition: "all 0.2s",
                  }}
                >
                  {t.short_name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count */}
        {selectedTeam && (
          <p style={{ color: teamAccent, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
            Showing {filtered.length} match{filtered.length !== 1 ? "es" : ""} for {selectedTeamObj?.team_name}
          </p>
        )}

        {/* Match list */}
        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#555" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
            <p>No {selectedTeam ? `matches found for ${selectedTeamObj?.team_name}` : `${tab === "all" ? "" : tab} matches found`}.</p>
          </div>
        ) : (
          filtered.map((m) => <MatchCard key={m.match_id} match={m} />)
        )}
      </div>
    </div>
  );
}