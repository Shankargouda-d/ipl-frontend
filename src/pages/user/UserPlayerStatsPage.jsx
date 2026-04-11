import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";

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
  const [allPlayers, setAllPlayers] = useState([]);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get("/stats/all-players").then((r) => setAllPlayers(r.data));
  }, []);

  useEffect(() => {
    if (tab === "compare") return;
    setLoading(true);
    const map = { orange: "orange-cap", purple: "purple-cap", hundreds: "hundreds", fifties: "fifties", sixes: "most-sixes" };
    http.get(`/stats/${map[tab]}`).then((r) => { setData(r.data); setLoading(false); });
  }, [tab]);

  const runCompare = async () => {
    if (!p1 || !p2) return;
    const r = await http.get(`/stats/compare?player1=${p1}&player2=${p2}`);
    setCompareData(r.data);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700 }}>Player Statistics</h1>
        <p style={{ color: "#666", marginBottom: 28 }}>IPL 2025 season leaderboards</p>

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

        {/* Orange Cap */}
        {tab === "orange" && !loading && (
          <LeaderboardCard title="🟠 Orange Cap — Most Runs" color="#d85a30">
            <table style={tableStyle}>
              <thead><tr>{["#","Player","Team","M","Runs","4s","6s","50s","100s","HS","Avg"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={p.player_id} style={{ background: i === 0 ? "#1e1200" : "transparent" }}>
                    <td style={tdS}>{i === 0 ? "🟠" : i + 1}</td>
                    <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
                    <td style={tdS}><TeamBadge name={p.short_name} /></td>
                    <td style={tdS}>{p.matches_played}</td>
                    <td style={{ ...tdS, fontWeight: 700, color: "#d85a30", fontSize: 16 }}>{p.total_runs}</td>
                    <td style={tdS}>{p.total_fours}</td>
                    <td style={tdS}>{p.total_sixes}</td>
                    <td style={tdS}>{p.fifties}</td>
                    <td style={tdS}>{p.hundreds}</td>
                    <td style={tdS}>{p.highest_score}</td>
                    <td style={tdS}>{p.batting_avg}</td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={11} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
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
                {data.map((p, i) => (
                  <tr key={p.player_id} style={{ background: i === 0 ? "#12001e" : "transparent" }}>
                    <td style={tdS}>{i === 0 ? "🟣" : i + 1}</td>
                    <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
                    <td style={tdS}><TeamBadge name={p.short_name} /></td>
                    <td style={tdS}>{p.matches_played}</td>
                    <td style={{ ...tdS, fontWeight: 700, color: "#7F77DD", fontSize: 16 }}>{p.total_wickets}</td>
                    <td style={tdS}>{p.total_overs}</td>
                    <td style={tdS}>{p.runs_conceded}</td>
                    <td style={tdS}>{p.economy}</td>
                    <td style={tdS}>{p.bowling_avg}</td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={9} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
              </tbody>
            </table>
          </LeaderboardCard>
        )}

        {/* 100s */}
        {tab === "hundreds" && !loading && (
          <LeaderboardCard title="💯 Most Centuries" color="#EF9F27">
            <SimpleStatTable data={data} mainKey="hundreds" mainLabel="100s" color="#EF9F27" />
          </LeaderboardCard>
        )}

        {/* 50s */}
        {tab === "fifties" && !loading && (
          <LeaderboardCard title="50+ Most Half Centuries" color="#5DCAA5">
            <SimpleStatTable data={data} mainKey="fifties" mainLabel="50s" color="#5DCAA5" />
          </LeaderboardCard>
        )}

        {/* Sixes */}
        {tab === "sixes" && !loading && (
          <LeaderboardCard title="💥 Most Sixes" color="#D4537E">
            <SimpleStatTable data={data} mainKey="total_sixes" mainLabel="6s" color="#D4537E" />
          </LeaderboardCard>
        )}

        {/* Compare */}
        {tab === "compare" && (
          <div>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px" }}>Select Two Players to Compare</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <select value={p1} onChange={(e) => setP1(e.target.value)} style={selStyle}>
                  <option value="">-- Player 1 --</option>
                  {allPlayers.map((p) => <option key={p.player_id} value={p.player_id}>[{p.short_name}] {p.player_name}</option>)}
                </select>
                <span style={{ color: "#888", alignSelf: "center" }}>vs</span>
                <select value={p2} onChange={(e) => setP2(e.target.value)} style={selStyle}>
                  <option value="">-- Player 2 --</option>
                  {allPlayers.map((p) => <option key={p.player_id} value={p.player_id}>[{p.short_name}] {p.player_name}</option>)}
                </select>
                <button onClick={runCompare} style={{
                  padding: "10px 20px", borderRadius: 8, background: "#d85a30", color: "#fff",
                  border: "none", cursor: "pointer", fontWeight: 600
                }}>Compare</button>
              </div>
            </div>

            {compareData.length === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {compareData.map((p) => (
                  <div key={p.player_id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
                    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #2a2a2a" }}>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{p.player_name}</div>
                      <div style={{ color: "#888", fontSize: 13 }}>{p.team_name} · {p.role}</div>
                    </div>
                    <h4 style={{ color: "#d85a30", margin: "0 0 12px", fontSize: 13 }}>BATTING</h4>
                    {[
                      ["Matches", p.bat_matches],
                      ["Runs", p.total_runs],
                      ["Avg", p.batting_avg],
                      ["Strike Rate", p.strike_rate],
                      ["Highest Score", p.highest_score],
                      ["50s / 100s", `${p.fifties} / ${p.hundreds}`],
                      ["4s / 6s", `${p.total_fours} / ${p.total_sixes}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #111" }}>
                        <span style={{ color: "#888", fontSize: 13 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <h4 style={{ color: "#7F77DD", margin: "16px 0 12px", fontSize: 13 }}>BOWLING</h4>
                    {[
                      ["Wickets", p.total_wickets],
                      ["Overs", p.total_overs],
                      ["Economy", p.economy],
                      ["Bowling Avg", p.bowling_avg],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #111" }}>
                        <span style={{ color: "#888", fontSize: 13 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

function SimpleStatTable({ data, mainKey, mainLabel, color }) {
  return (
    <table style={tableStyle}>
      <thead><tr>{["#", "Player", "Team", "M", mainLabel, "Runs", "Avg"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={p.player_id}>
            <td style={tdS}>{i + 1}</td>
            <td style={{ ...tdS, fontWeight: 600 }}>{p.player_name}</td>
            <td style={tdS}><TeamBadge name={p.short_name} /></td>
            <td style={tdS}>{p.matches_played}</td>
            <td style={{ ...tdS, fontWeight: 700, color, fontSize: 16 }}>{p[mainKey]}</td>
            <td style={tdS}>{p.total_runs}</td>
            <td style={tdS}>{p.batting_avg}</td>
          </tr>
        ))}
        {data.length === 0 && <tr><td colSpan={7} style={{ ...tdS, color: "#555", textAlign: "center", padding: 32 }}>No data yet</td></tr>}
      </tbody>
    </table>
  );
}

function TeamBadge({ name }) {
  return <span style={{ background: "#2a2a2a", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#ccc" }}>{name}</span>;
}

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "14px 24px", display: "flex", gap: 24, alignItems: "center" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700, textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
    </nav>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thS = { padding: "10px 14px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, borderBottom: "1px solid #2a2a2a", whiteSpace: "nowrap" };
const tdS = { padding: "10px 14px", borderBottom: "1px solid #111", whiteSpace: "nowrap" };
const selStyle = { padding: "10px 14px", borderRadius: 8, background: "#111", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", minWidth: 200 };