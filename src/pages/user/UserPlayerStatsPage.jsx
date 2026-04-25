import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import PlayerCompare from "../../components/PlayerCompare";
import { getTeamColor } from "../../utils/teamColors";

const TABS = [
  { key: "orange", label: "Orange Cap" },
  { key: "purple", label: "Purple Cap" },
  { key: "hundreds", label: "Most 100s" },
  { key: "fifties", label: "Most 50s" },
  { key: "sixes", label: "Most 6s" },
  { key: "compare", label: "Compare Players" },
];

export default function UserPlayerStatsPage() {
  const [tab, setTab] = useState("orange");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "compare") return;
    setLoading(true);
    const map = { orange: "orange-cap", purple: "purple-cap", hundreds: "hundreds", fifties: "fifties", sixes: "most-sixes" };
    http.get(`/stats/${map[tab]}`).then((r) => { setData(r.data); setLoading(false); });
  }, [tab]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700 }}>Player Statistics</h1>
        <p style={{ color: "#666", marginBottom: 28 }}>TATA IPL 2026 season leaderboards</p>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === t.key ? "#d85a30" : "#1a1a1a",
              color: tab === t.key ? "#fff" : "#888"
            }}>{t.label}</button>
          ))}
        </div>

        {loading && <p style={{ color: "#666" }}>Loading...</p>}

        {/* Orange Cap — removed 50s & 100s columns */}
        {tab === "orange" && !loading && (
          <LeaderboardCard title="🟠 Orange Cap — Most Runs" color="#d85a30">
            <table style={tableStyle}>
              <thead><tr>{["#","Player","Team","M","Runs","4s","6s","HS","Avg"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {data.map((p, i) => {
                  const tc = getTeamColor(p.short_name);
                  return (
                    <tr key={p.player_id} style={{ borderBottom: "1px solid #111", background: `${tc}18`, borderLeft: `3px solid ${tc}` }}>
                      <td style={tdS}>{i === 0 ? "🟠" : i + 1}</td>
                      <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
                      <td style={tdS}><TeamBadge name={p.short_name} color={tc} /></td>
                      <td style={tdS}>{p.matches_played}</td>
                      <td style={{ ...tdS, fontWeight: 700, color: "#d85a30", fontSize: 16 }}>{p.total_runs}</td>
                      <td style={tdS}>{p.total_fours}</td>
                      <td style={tdS}>{p.total_sixes}</td>
                      <td style={tdS}>{p.highest_score}</td>
                      <td style={tdS}>{p.batting_avg}</td>
                    </tr>
                  );
                })}
                {data.length === 0 && <tr><td colSpan={9} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
              </tbody>
            </table>
          </LeaderboardCard>
        )}

        {/* Purple Cap */}
        {tab === "purple" && !loading && (
          <LeaderboardCard title="🟣 Purple Cap — Most Wickets" color="#7F77DD">
            <table style={tableStyle}>
              <thead><tr>{["#","Player","Team","M","Wkts","Overs","Runs","Econ","Avg"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {data.map((p, i) => {
                  const tc = getTeamColor(p.short_name);
                  return (
                    <tr key={p.player_id} style={{ borderBottom: "1px solid #111", background: `${tc}18`, borderLeft: `3px solid ${tc}` }}>
                      <td style={tdS}>{i === 0 ? "🟣" : i + 1}</td>
                      <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
                      <td style={tdS}><TeamBadge name={p.short_name} color={tc} /></td>
                      <td style={tdS}>{p.matches_played}</td>
                      <td style={{ ...tdS, fontWeight: 700, color: "#7F77DD", fontSize: 16 }}>{p.total_wickets}</td>
                      <td style={tdS}>{p.total_overs}</td>
                      <td style={tdS}>{p.runs_conceded}</td>
                      <td style={tdS}>{p.economy}</td>
                      <td style={tdS}>{p.bowling_avg}</td>
                    </tr>
                  );
                })}
                {data.length === 0 && <tr><td colSpan={9} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
              </tbody>
            </table>
          </LeaderboardCard>
        )}

        {/* 100s */}
        {tab === "hundreds" && !loading && (
          <LeaderboardCard title="💯 Most Centuries" color="#EF9F27">
            <SimpleStatTable data={data} mainKey="hundreds" mainLabel="100s" color="#EF9F27" showRuns showAvg />
          </LeaderboardCard>
        )}

        {/* 50s — show M, remove nothing */}
        {tab === "fifties" && !loading && (
          <LeaderboardCard title="50+ Most Half Centuries" color="#5DCAA5">
            <SimpleStatTable data={data} mainKey="fifties" mainLabel="50s" color="#5DCAA5" showRuns showAvg />
          </LeaderboardCard>
        )}

        {/* Sixes — show M, no Runs/Avg */}
        {tab === "sixes" && !loading && (
          <LeaderboardCard title="💥 Most Sixes" color="#D4537E">
            <SimpleStatTable data={data} mainKey="total_sixes" mainLabel="6s" color="#D4537E" showRuns={false} showAvg={false} />
          </LeaderboardCard>
        )}

        {/* Compare */}
        {tab === "compare" && <PlayerCompare />}
      </div>
    </div>
  );
}

function LeaderboardCard({ title, color, children }) {
  return (
    <div style={{ background: "#1a1a1a", border: `1px solid ${color}33`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, background: color, borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      </div>
      <div style={{ overflowX: "auto" }}>{children}</div>
    </div>
  );
}

function SimpleStatTable({ data, mainKey, mainLabel, color, showRuns = true, showAvg = true }) {
  const headers = ["#", "Player", "Team", "M", mainLabel, ...(showRuns ? ["Runs"] : []), ...(showAvg ? ["Avg"] : [])];
  return (
    <table style={tableStyle}>
      <thead><tr>{headers.map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
      <tbody>
        {data.map((p, i) => {
          const tc = getTeamColor(p.short_name);
          return (
            <tr key={p.player_id} style={{ borderBottom: "1px solid #111", background: `${tc}18`, borderLeft: `3px solid ${tc}` }}>
              <td style={tdS}>{i + 1}</td>
              <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
              <td style={tdS}><TeamBadge name={p.short_name} color={tc} /></td>
              <td style={tdS}>{p.matches_played}</td>
              <td style={{ ...tdS, fontWeight: 700, color, fontSize: 16 }}>{p[mainKey]}</td>
              {showRuns && <td style={tdS}>{p.total_runs}</td>}
              {showAvg && <td style={tdS}>{p.batting_avg}</td>}
            </tr>
          );
        })}
        {data.length === 0 && <tr><td colSpan={headers.length} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
      </tbody>
    </table>
  );
}

function TeamBadge({ name, color }) {
  return (
    <span style={{
      background: color ? `${color}33` : "#2a2a2a",
      border: color ? `1px solid ${color}66` : "none",
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      color: color || "#ccc"
    }}>
      {name}
    </span>
  );
}

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "14px 24px", display: "flex", gap: 24, alignItems: "center" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700, textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Team Stats", "/team-stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
    </nav>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thS = { padding: "10px 14px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, borderBottom: "1px solid #2a2a2a", whiteSpace: "nowrap" };
const tdS = { padding: "10px 14px", borderBottom: "1px solid #111", whiteSpace: "nowrap" };