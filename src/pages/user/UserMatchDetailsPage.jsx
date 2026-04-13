import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";

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
        IPL
      </Link>

      {[
        ["Matches", "/matches"],
        ["Stats", "/stats"],
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
};

const tdS = {
  padding: "10px 14px",
  borderBottom: "1px solid #111",
  whiteSpace: "nowrap",
};

function calcSR(runs, balls) {
  if (!balls || Number(balls) === 0) return "-";
  return ((Number(runs) / Number(balls)) * 100).toFixed(2);
}

function calcEco(runs, overs) {
  if (!overs || Number(overs) === 0) return "-";
  return (Number(runs) / Number(overs)).toFixed(2);
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
        hit wicket b <strong>{b.wicket_taker_name || ""}</strong>
      </span>
    );
  }

  return <span style={{ color: "#888" }}>{b.dismissal_type}</span>;
}

function oversDisplay(inn) {
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
  const [activeInnings, setActiveInnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async () => {
    setLoading(true);

    try {
      // match + innings
      const [mr, ir] = await Promise.all([
        http.get(`/matches/${id}`),
        http.get(`/innings/match/${id}`),
      ]);

      setMatch(mr.data);
      setInnings(ir.data || []);

      const batMap = {};
      const bowlMap = {};

      // for each innings, fetch batting + bowling
      await Promise.all(
        (ir.data || []).map(async (inn) => {
          try {
            const [batRes, bowlRes] = await Promise.all([
              http.get(`/innings/${inn.innings_id}/batting`),
              http.get(`/innings/${inn.innings_id}/bowling`),
            ]);

            batMap[inn.innings_id] = batRes.data || [];
            bowlMap[inn.innings_id] = bowlRes.data || [];
          } catch (e) {
            console.error(`Error loading innings ${inn.innings_id}:`, e);
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
          fontSize: 16,
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
          background: "#0a0a0a",
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

  const currentInnings = innings[activeInnings];
  const batRows = currentInnings
    ? batting[currentInnings.innings_id] || []
    : [];
  const bowlRows = currentInnings
    ? bowling[currentInnings.innings_id] || []
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <Link
          to="/matches"
          style={{ color: "#888", textDecoration: "none", fontSize: 14 }}
        >
          ← All Matches
        </Link>

        {/* Match header */}
        <div style={{ textAlign: "center", margin: "24px 0 32px" }}>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>
            Match #{match.matchnumber || match.match_number || id}
          </div>

          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>
            {match.team1name || match.team1_name} vs{" "}
            {match.team2name || match.team2_name}
          </h1>

          <p style={{ color: "#888", margin: "0 0 4px", fontSize: 14 }}>
            {new Date(match.matchdate || match.match_date).toDateString()} ·{" "}
            {match.venue}
          </p>

          {(match.resulttext || match.result_text) && (
            <p
              style={{
                color: "#639922",
                fontWeight: 600,
                marginTop: 10,
                fontSize: 15,
              }}
            >
              {match.resulttext || match.result_text}
            </p>
          )}

          {(match.potmname || match.potm_name) && (
            <p style={{ color: "#EF9F27", fontSize: 14, marginTop: 4 }}>
              Player of the Match:{" "}
              <strong>{match.potmname || match.potm_name}</strong>
            </p>
          )}
        </div>

        {/* No innings */}
        {innings.length === 0 ? (
          <p style={{ color: "#555", textAlign: "center", marginTop: 32 }}>
            {(match.status || "").toLowerCase() === "scheduled"
              ? "Match hasn't started yet."
              : "No scorecard available yet."}
          </p>
        ) : (
          <>
            {/* Innings selector cards */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 28,
                flexWrap: "wrap",
              }}
            >
              {innings.map((inn, idx) => (
                <div
                  key={inn.innings_id}
                  onClick={() => setActiveInnings(idx)}
                  style={{
                    background: activeInnings === idx ? "#d85a30" : "#1a1a1a",
                    border: `1px solid ${
                      activeInnings === idx ? "#d85a30" : "#2a2a2a"
                    }`,
                    borderRadius: 12,
                    padding: "14px 20px",
                    cursor: "pointer",
                    minWidth: 160,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: activeInnings === idx ? "#ffe0d0" : "#888",
                      marginBottom: 6,
                    }}
                  >
                    Innings {inn.innings_number} — {inn.batting_team_name}
                  </div>

                  <div style={{ fontSize: 26, fontWeight: 700 }}>
                    {inn.total_runs}/{inn.total_wickets}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: activeInnings === idx ? "#ffe0d0" : "#888",
                      marginTop: 4,
                    }}
                  >
                    {oversDisplay(inn)} · Extras: {inn.extras || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Batting table */}
            {currentInnings && (
              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: 12,
                  marginBottom: 20,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    background: "#222",
                    borderBottom: "1px solid #2a2a2a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Batting — {currentInnings.batting_team_name}
                  </span>

                  <span style={{ fontSize: 18, fontWeight: 700 }}>
                    {currentInnings.total_runs}/{currentInnings.total_wickets}
                    <span
                      style={{
                        fontSize: 13,
                        color: "#888",
                        fontWeight: 400,
                        marginLeft: 8,
                      }}
                    >
                      ({oversDisplay(currentInnings)})
                    </span>
                  </span>
                </div>

                {batRows.length === 0 ? (
                  <p
                    style={{
                      padding: 20,
                      color: "#555",
                      textAlign: "center",
                    }}
                  >
                    Batting data not available yet.
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#111" }}>
                          {[
                            "Batsman",
                            "Dismissal",
                            "R",
                            "B",
                            "4s",
                            "6s",
                            "SR",
                          ].map((h) => (
                            <th key={h} style={thS}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {batRows.map((b) => {
                          const dnb = b.dismissal_type === "did not bat";

                          return (
                            <tr
                              key={b.id || `${b.innings_id}-${b.player_id}`}
                              style={{
                                background: dnb ? "#0d0d0d" : "transparent",
                                opacity: dnb ? 0.5 : 1,
                              }}
                            >
                              <td
                                style={{
                                  ...tdS,
                                  fontWeight: dnb ? 400 : 600,
                                  color: dnb ? "#555" : "#fff",
                                }}
                              >
                                {b.player_name}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  color: "#888",
                                  fontSize: 12,
                                  maxWidth: 220,
                                }}
                              >
                                {getDismissalText(b)}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  fontWeight: 700,
                                  fontSize: dnb ? 13 : 15,
                                  color: dnb ? "#555" : "#fff",
                                }}
                              >
                                {dnb ? "-" : b.runs}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  color: dnb ? "#555" : "#aaa",
                                }}
                              >
                                {dnb ? "-" : b.balls}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  color: dnb ? "#555" : "#aaa",
                                }}
                              >
                                {dnb ? "-" : b.fours}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  color: dnb ? "#555" : "#aaa",
                                }}
                              >
                                {dnb ? "-" : b.sixes}
                              </td>

                              <td
                                style={{
                                  ...tdS,
                                  color: "#888",
                                  fontSize: 12,
                                }}
                              >
                                {dnb ? "-" : calcSR(b.runs, b.balls)}
                              </td>
                            </tr>
                          );
                        })}

                        <tr style={{ background: "#111" }}>
                          <td
                            style={{
                              ...tdS,
                              color: "#888",
                              fontStyle: "italic",
                            }}
                            colSpan={2}
                          >
                            Extras
                          </td>
                          <td
                            style={{ ...tdS, color: "#888" }}
                            colSpan={5}
                          >
                            {currentInnings.extras || 0}
                          </td>
                        </tr>

                        <tr style={{ background: "#1e1e1e" }}>
                          <td
                            style={{ ...tdS, fontWeight: 700 }}
                            colSpan={2}
                          >
                            Total
                          </td>
                          <td
                            style={{ ...tdS, fontWeight: 700, fontSize: 15 }}
                            colSpan={5}
                          >
                            {currentInnings.total_runs}/
                            {currentInnings.total_wickets}
                            <span
                              style={{
                                color: "#888",
                                fontWeight: 400,
                                fontSize: 12,
                                marginLeft: 8,
                              }}
                            >
                              ({oversDisplay(currentInnings)})
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Bowling table */}
            {bowlRows.length > 0 && currentInnings && (
              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    background: "#222",
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Bowling — {currentInnings.bowling_team_name}
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#111" }}>
                        {[
                          "Bowler",
                          "O",
                          "M",
                          "R",
                          "W",
                          "Eco",
                          "Wd",
                          "NB",
                        ].map((h) => (
                          <th key={h} style={thS}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {bowlRows.map((b) => (
                        <tr
                          key={b.id || `${b.innings_id}-${b.player_id}`}
                        >
                          <td
                            style={{
                              ...tdS,
                              fontWeight: 600,
                            }}
                          >
                            {b.player_name}
                          </td>
                          <td style={tdS}>{b.overs}</td>
                          <td style={{ ...tdS, color: "#888" }}>
                            {b.maidens}
                          </td>
                          <td style={tdS}>{b.runs_conceded}</td>
                          <td
                            style={{
                              ...tdS,
                              fontWeight: 700,
                              color:
                                Number(b.wickets) > 0 ? "#d85a30" : "#fff",
                            }}
                          >
                            {b.wickets}
                          </td>
                          <td style={{ ...tdS, color: "#888" }}>
                            {calcEco(b.runs_conceded, b.overs)}
                          </td>
                          <td style={{ ...tdS, color: "#888" }}>
                            {b.wides}
                          </td>
                          <td style={{ ...tdS, color: "#888" }}>
                            {b.no_balls}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}