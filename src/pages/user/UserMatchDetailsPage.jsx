import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../../api/http";
import MatchBoundaryChart from "../../components/MatchBoundaryChart";
import MatchPrediction from "../../components/MatchPrediction";


function Navbar() {
  return (
    <nav
      style={{
        background: "#111",
        borderBottom: "1px solid #1a1a1a",
        padding: "14px 24px",
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#d85a30",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: 18,
        }}
      >
        🏏 IPL
      </Link>

      {[
        ["Matches", "/matches"],
        ["Stats", "/stats"],
        ["Team Stats", "/team-stats"],
        ["Points", "/points"],
      ].map(([label, href]) => (
        <Link
          key={label}
          to={href}
          style={{ color: "#888", textDecoration: "none", fontSize: 14 }}
        >
          {label}
        </Link>
      ))}

      <div style={{ marginLeft: "auto" }}>
        <Link
          to="/admin"
          style={{ color: "#555", textDecoration: "none", fontSize: 12 }}
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}

const thS = {
  padding: "10px 14px",
  textAlign: "left",
  color: "#666",
  fontSize: 11,
  fontWeight: 600,
  borderBottom: "1px solid #2a2a2a",
  whiteSpace: "nowrap",
  background: "#111",
};

const tdS = {
  padding: "10px 14px",
  borderBottom: "1px solid #111",
  whiteSpace: "nowrap",
  background: "inherit",
};

function calcSR(runs, balls) {
  if (!balls || parseInt(balls, 10) === 0) return "-";
  return ((parseInt(runs, 10) / parseInt(balls, 10)) * 100).toFixed(2);
}

function calcEco(runs, overs) {
  if (!overs || parseFloat(overs) === 0) return "-";
  return (parseInt(runs, 10) / parseFloat(overs)).toFixed(2);
}

function getDismissalText(b) {
  if (!b.dismissal_type || b.dismissal_type === "not out") {
    return <span style={{ color: "#639922", fontWeight: 500 }}>not out</span>;
  }

  if (b.dismissal_type === "did not bat") {
    return <span style={{ color: "#555" }}>did not bat</span>;
  }

  if (b.dismissal_type === "bowled") {
    return (
      <span>
        b <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  if (b.dismissal_type === "lbw") {
    return (
      <span>
        lbw b <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  if (b.dismissal_type === "caught") {
    if (
      b.fielder_name &&
      b.wicket_taker_name &&
      b.fielder_name !== b.wicket_taker_name
    ) {
      return (
        <span>
          c <strong>{b.fielder_name}</strong> b{" "}
          <strong>{b.wicket_taker_name}</strong>
        </span>
      );
    }

    return (
      <span>
        c &amp; b <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  if (b.dismissal_type === "stumped") {
    return (
      <span>
        st <strong>{b.fielder_name || ""}</strong> b{" "}
        <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  if (b.dismissal_type === "run out") {
    return (
      <span>
        run out {b.fielder_name ? <strong>({b.fielder_name})</strong> : ""}
      </span>
    );
  }

  if (b.dismissal_type === "hit wicket") {
    return (
      <span>
        hit wkt b <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  return <span style={{ color: "#888" }}>{b.dismissal_type}</span>;
}

function oversDisplay(inn) {
  if (!inn) return "";
  if (Number(inn.total_wickets) >= 10) {
    return `All out · ${inn.overs} ov`;
  }
  return `${inn.overs} ov`;
}

export default function UserMatchDetailsPage() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState([]);
  const [batting, setBatting] = useState({});
  const [bowling, setBowling] = useState({});
  const [activeTab, setActiveTab] = useState("overview"); // "overview", 0, 1, etc.
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async () => {
    setLoading(true);

    try {
      const [mr, ir] = await Promise.all([
        http.get(`/matches/${id}`),
        http.get(`/innings/match/${id}`),
      ]);

      setMatch(mr?.data || null);
      setInnings(ir?.data || []);

      const batMap = {};
      const bowlMap = {};

      await Promise.all(
        (ir?.data || []).map(async (inn) => {
          try {
            const [batRes, bowlRes] = await Promise.all([
              http.get(`/innings/${inn.innings_id}/batting`),
              http.get(`/innings/${inn.innings_id}/bowling`),
            ]);

            batMap[inn.innings_id] = batRes?.data || [];
            bowlMap[inn.innings_id] = bowlRes?.data || [];
          } catch (e) {
            batMap[inn.innings_id] = [];
            bowlMap[inn.innings_id] = [];
          }
        })
      );

      setBatting(batMap);
      setBowling(bowlMap);
    } catch (e) {
      console.error("loadAll error:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentInnings = typeof activeTab === "number" ? innings?.[activeTab] : null;


  const batRows =
    currentInnings && batting[currentInnings.innings_id]
      ? [...batting[currentInnings.innings_id]].sort(
        (a, b) =>
          (parseInt(a.batting_order, 10) || 999) -
          (parseInt(b.batting_order, 10) || 999)
      )
      : [];

  const bowlRows =
    currentInnings && bowling[currentInnings.innings_id]
      ? bowling[currentInnings.innings_id]
      : [];

  const playedBatters = batRows.filter(
    (b) => b.dismissal_type !== "did not bat"
  );

  const didNotBatRows = batRows.filter(
    (b) => b.dismissal_type === "did not bat"
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading scorecard...
      </div>
    );
  }

  if (!match) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a00a0",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Match not found.
      </div>
    );
  }

  const team1Short = match.team1_short_name || match.team1_name || "";
  const team2Short = match.team2_short_name || match.team2_name || "";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <Link to="/matches" style={{ color: "#888", textDecoration: "none" }}>
          ← All Matches
        </Link>

        {/* Result banner if match is completed and we have result_text */}
        {match.status === "completed" && match.result_text && (
          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 8,
              background:
                "linear-gradient(90deg, rgba(216,90,48,0.12), rgba(216,90,48,0.03))",
              border: "1px solid #d85a30",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#ffd7c5", fontWeight: 600 }}>
              {match.result_text}
            </span>
          </div>
        )}

        <div style={{ textAlign: "center", margin: "16px 0 28px" }}>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>
            {team1Short} vs {team2Short}
          </h1>
          <div style={{ color: "#aaa", fontSize: 13 }}>
            <div>{match.venue || "Unknown Venue"}</div>
            {match.match_date && (
              <div>
                {new Date(match.match_date).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: activeTab === "overview" ? "#d85a30" : "#1a1a1a",
              color: activeTab === "overview" ? "#fff" : "#aaa",
              fontWeight: activeTab === "overview" ? "bold" : "normal"
            }}
          >
            Overview
          </button>
          {innings.map((inn, index) => {
            const isSuperOver = index >= 2;
            const label = isSuperOver ? `Super Over Innings ${index - 1}` : `${inn.team_name || inn.battingteamname || ""} Innings ${index + 1}`;
            const bgActive = isSuperOver ? "linear-gradient(90deg, #639922, #d8cc22)" : "#d85a30";
            return (
              <button
                key={inn.innings_id}
                onClick={() => setActiveTab(index)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === index ? bgActive : "#1a1a1a",
                  color: activeTab === index ? (isSuperOver ? "#000" : "#fff") : "#aaa",
                  fontWeight: activeTab === index ? "bold" : "normal"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>


        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24, animation: "fadeIn 0.4s ease-out" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Match Info Card */}
                <div style={{
                  background: "linear-gradient(145deg, #1a1a1a, #111)",
                  border: "1px solid #333",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 18, color: "#d85a30", display: "flex", alignItems: "center", gap: 8 }}>
                    ℹ️ Match Information
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#d85a301a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏟️</div>
                      <div>
                        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Venue</div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{match.venue}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#378ADD1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🪙</div>
                      <div>
                        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Toss</div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>
                          {match.toss_winner_team_id ? (
                            `${match.toss_winner_team_id === match.team1_id ? match.team1_short : match.team2_short} won the toss & elected to ${match.decision}`
                          ) : "Toss info not available"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#6399221a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏁</div>
                      <div>
                        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Result</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#639922" }}>{match.result_text || "Match in progress"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fan Analysis Card */}
                <div style={{
                  background: "linear-gradient(145deg, #1a1a1a, #111)",
                  border: "1px solid #333",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#378ADD", display: "flex", alignItems: "center", gap: 8 }}>
                    📊 Fan Analysis
                  </h3>
                  <MatchPrediction match={match} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Player of the Match Section */}
                {match && (match.potm_name || match.player_of_match) ? (() => {
                  const potmName = match.potm_name || match.player_of_match;

                  // Find batting performance across all innings
                  let batPerf = null;
                  for (const inn of innings) {
                    const rows = batting[inn.innings_id] || [];
                    const row = rows.find((b) => b.player_name === potmName);
                    if (row && row.dismissal_type !== "did not bat") {
                      batPerf = row;
                      break;
                    }
                  }

                  // Find bowling performance across all innings
                  let bowlPerf = null;
                  for (const inn of innings) {
                    const rows = bowling[inn.innings_id] || [];
                    const row = rows.find((b) => b.player_name === potmName);
                    if (row && (parseFloat(row.overs) > 0 || parseInt(row.wickets) > 0)) {
                      bowlPerf = row;
                      break;
                    }
                  }

                  return (
                    <div style={{
                      padding: "28px 24px",
                      background: "linear-gradient(135deg, #1a1200 0%, #111 60%, #0d0d0d 100%)",
                      borderRadius: 16, border: "1px solid #EF9F2766",
                      boxShadow: "0 0 32px rgba(239,159,39,0.08)",
                      height: "fit-content"
                    }}>
                      {/* Header */}
                      <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                        <div style={{ color: "#EF9F27", fontWeight: 800, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                          Player of the Match
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>
                          {potmName}
                        </div>
                      </div>

                      {/* Performance stats */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {batPerf && (
                          <div style={{
                            background: "#0d0d0d",
                            borderRadius: 12, padding: "16px 20px",
                            border: "1px solid #EF9F2733",
                          }}>
                            <div style={{ color: "#EF9F27", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
                              🏏 Batting
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-around" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#EF9F27" }}>{batPerf.runs}</div>
                                <div style={{ fontSize: 10, color: "#666" }}>Runs</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{batPerf.balls}</div>
                                <div style={{ fontSize: 10, color: "#666" }}>Balls</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                                  {batPerf.balls > 0 ? ((batPerf.runs / batPerf.balls) * 100).toFixed(1) : "0.0"}
                                </div>
                                <div style={{ fontSize: 10, color: "#666" }}>SR</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {bowlPerf && (
                          <div style={{
                            background: "#0d0d0d",
                            borderRadius: 12, padding: "16px 20px",
                            border: "1px solid #7F77DD33",
                          }}>
                            <div style={{ color: "#7F77DD", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
                              🎯 Bowling
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-around" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#7F77DD" }}>{bowlPerf.wickets}</div>
                                <div style={{ fontSize: 10, color: "#666" }}>Wkts</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{bowlPerf.overs}</div>
                                <div style={{ fontSize: 10, color: "#666" }}>Overs</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                                  {bowlPerf.overs > 0 ? (bowlPerf.runs_conceded / parseFloat(bowlPerf.overs)).toFixed(2) : "-"}
                                </div>
                                <div style={{ fontSize: 10, color: "#666" }}>Eco</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ padding: 40, textAlign: "center", color: "#444", background: "#111", borderRadius: 16, border: "1px dashed #333" }}>
                    Player of the match will be announced after completion.
                  </div>
                )}
              </div>
            </div>
            <MatchBoundaryChart innings={innings} batting={batting} match={match} />
          </>
        )}

        {typeof activeTab === "number" && currentInnings && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <h3 style={{ marginBottom: 16, color: "#d85a30" }}>
              {currentInnings.team_name} - {currentInnings.total_runs}/
              {currentInnings.total_wickets} ({oversDisplay(currentInnings)})
            </h3>


            <h2>Batting</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>Pos</th>
                  <th style={thS}>Batsman</th>
                  <th style={thS}>R</th>
                  <th style={thS}>B</th>
                  <th style={thS}>4s</th>
                  <th style={thS}>6s</th>
                  <th style={thS}>SR</th>
                </tr>
              </thead>
              <tbody>
                {playedBatters.map((b, index) => (
                  <tr key={b.id || b.player_id || index} style={{ background: "#111" }}>
                    <td style={tdS}>{b.batting_order || "-"}</td>
                    <td style={tdS}>
                      <div>{b.player_name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {getDismissalText(b)}
                      </div>
                    </td>
                    <td style={tdS}>{b.runs}</td>
                    <td style={tdS}>{b.balls}</td>
                    <td style={tdS}>{b.fours || 0}</td>
                    <td style={tdS}>{b.sixes || 0}</td>
                    <td style={tdS}>{calcSR(b.runs, b.balls)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {didNotBatRows.length > 0 && (
              <div style={{ marginTop: 16, color: "#aaa", fontSize: 14 }}>
                <strong style={{ color: "#fff" }}>Did not bat:</strong>{" "}
                {didNotBatRows.map((p) => p.player_name).join(", ")}
              </div>
            )}

            <h2 style={{ marginTop: 30 }}>Bowling</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>Bowler</th>
                  <th style={thS}>O</th>
                  <th style={thS}>R</th>
                  <th style={thS}>W</th>
                  <th style={thS}>Eco</th>
                </tr>
              </thead>
              <tbody>
                {bowlRows.map((b, index) => (
                  <tr key={b.id || b.player_id || index} style={{ background: "#111" }}>
                    <td style={tdS}>{b.player_name}</td>
                    <td style={tdS}>{b.overs}</td>
                    <td style={tdS}>{b.runs_conceded}</td>
                    <td style={tdS}>{b.wickets}</td>
                    <td style={tdS}>{calcEco(b.runs_conceded, b.overs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
