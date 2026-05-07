import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import { getTeamColor } from "../../utils/teamColors";

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "14px 24px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700, textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Team Stats", "/team-stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <Link to="/admin" style={{ color: "#555", textDecoration: "none", fontSize: 12 }}>Admin</Link>
      </div>
    </nav>
  );
}

export default function UserPointsTablePage() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    http.get("/points").then((r) => setPoints(r.data));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ margin: "0 0 8px" }}>Points Table</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>TATA IPL 2026 standings</p>

        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#111" }}>
                  {["Pos", "Team", "P", "W", "L", "T", "Pts", "NRR"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #2a2a2a", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {points.map((t, i) => {
                  const tc = getTeamColor(t.short_name || t.team_name);
                  return (
                    <tr key={t.team_id} style={{
                      borderBottom: "1px solid #111",
                      background: `${tc}14`,
                      borderLeft: `4px solid ${tc}`,
                    }}>
                      <td style={{ padding: "12px 16px", color: i < 4 ? "#639922" : "#888", fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        {i < 4 && <span style={{ color: "#639922", marginRight: 6, fontSize: 10 }}>●</span>}
                        {t.team_name}
                        <span style={{ color: tc, fontSize: 11, marginLeft: 6, fontWeight: 700 }}>({t.short_name})</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{t.played}</td>
                      <td style={{ padding: "12px 16px", color: "#639922", fontWeight: 600 }}>{t.won}</td>
                      <td style={{ padding: "12px 16px", color: "#e24b4a" }}>{t.lost}</td>
                      <td style={{ padding: "12px 16px" }}>{t.tied}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 16 }}>{t.points}</td>
                      <td style={{ padding: "12px 16px", color: t.nrr >= 0 ? "#639922" : "#e24b4a", fontWeight: 600 }}>
                        {t.nrr >= 0 ? "+" : ""}{parseFloat(t.nrr).toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
                {points.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#555" }}>
                      No matches played yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: "1px solid #2a2a2a" }}>
            <span style={{ color: "#639922", fontSize: 11 }}>● Playoff qualification zone (Top 4)</span>
          </div>
        </div>

        {points.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16, color: "#fff" }}>Playoff Scenarios</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {points.map((t) => {
                const tc = getTeamColor(t.short_name || t.team_name);
                let status = "In the Hunt";
                let statusColor = "#f39c12";

                if (t.points >= 18 || (t.points >= 16 && t.nrr > 0.5)) {
                  status = "Strong Chance";
                  statusColor = "#639922";
                } else if (t.max_possible_points < 14) {
                  status = "Out of Hunt";
                  statusColor = "#e24b4a";
                } else if (t.points >= 16) {
                  status = "Safe Zone";
                  statusColor = "#27ae60";
                }

                return (
                  <div key={t.team_id} style={{ 
                    background: "#1a1a1a", 
                    border: "1px solid #2a2a2a", 
                    borderRadius: 12, 
                    padding: 20,
                    borderLeft: `4px solid ${tc}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{t.team_name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t.short_name} • {t.points} Pts</div>
                      </div>
                      <div style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        textTransform: "uppercase", 
                        padding: "4px 8px", 
                        borderRadius: 4, 
                        background: `${statusColor}22`, 
                        color: statusColor,
                        border: `1px solid ${statusColor}44`
                      }}>
                        {status}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Remaining</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{t.matches_left}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Target (16)</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                          {t.wins_needed_to_16 > 0 ? (
                            <span style={{ color: t.wins_needed_to_16 > t.matches_left ? "#e24b4a" : "#fff" }}>
                              {t.wins_needed_to_16} W
                            </span>
                          ) : (
                            <span style={{ color: "#639922" }}>✓</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: "#888" }}>
                      {t.wins_needed_to_16 > t.matches_left ? (
                        "Cannot reach 16 points anymore."
                      ) : t.wins_needed_to_16 === 0 ? (
                        "Minimum points for safety reached!"
                      ) : (
                        `Needs to win ${t.wins_needed_to_16} out of ${t.matches_left} matches to reach 16 points.`
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}