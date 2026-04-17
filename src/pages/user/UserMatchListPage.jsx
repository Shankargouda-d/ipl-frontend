import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../../api/http";

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
  const [activeInnings, setActiveInnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [mr, ir] = await Promise.all([
        http.get(`/matches/${id}`),
        http.get(`/innings/match/${id}`),
      ]);

      const matchData = mr?.data || null;
      const inningsData = ir?.data || [];

      setMatch(matchData);
      setInnings(inningsData);
      setActiveInnings(0);

      const batMap = {};
      const bowlMap = {};

      await Promise.all(
        inningsData.map(async (inn) => {
          try {
            const [batRes, bowlRes] = await Promise.all([
              http.get(`/innings/${inn.innings_id}/batting`),
              http.get(`/innings/${inn.innings_id}/bowling`),
            ]);

            batMap[inn.innings_id] = batRes?.data || [];
            bowlMap[inn.innings_id] = bowlRes?.data || [];
          } catch {
            batMap[inn.innings_id] = [];
            bowlMap[inn.innings_id] = [];
          }
        })
      );

      setBatting(batMap);
      setBowling(bowlMap);
    } catch (e) {
      console.error("loadAll error:", e);
      setLoadError(e?.response?.data?.error || e.message || "Failed to load match details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const currentInnings =
    innings.length > 0
      ? innings[Math.min(activeInnings, innings.length - 1)]
      : null;

  const batRows =
    currentInnings && batting[currentInnings.innings_id]
      ? batting[currentInnings.innings_id]
      : [];

  const bowlRows =
    currentInnings && bowling[currentInnings.innings_id]
      ? bowling[currentInnings.innings_id]
      : [];

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

  if (loadError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 20,
          textAlign: "center",
        }}
      >
        <p style={{ color: "#F09595", fontSize: 16 }}>❌ {loadError}</p>
        <Link to="/matches" style={{ color: "#d85a30", textDecoration: "none" }}>
          ← Back to Matches
        </Link>
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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <Link to="/matches" style={{ color: "#888", textDecoration: "none" }}>
          ← All Matches
        </Link>

        <div style={{ textAlign: "center", margin: "24px 0 32px" }}>
          <h1>
            {match.team1_name} vs {match.team2_name}
          </h1>
          <div style={{ color: "#aaa", fontSize: 13 }}>
            {match.venue || "Unknown Venue"} •{" "}
            {match.match_date
              ? new Date(match.match_date).toLocaleDateString()
              : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {innings.map((inn, index) => (
            <button
              key={inn.innings_id}
              onClick={() => setActiveInnings(index)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background: activeInnings === index ? "#d85a30" : "#1a1a1a",
                color: activeInnings === index ? "#fff" : "#aaa",
              }}
            >
              {inn.team_name} Innings
            </button>
          ))}
        </div>

        {currentInnings && (
          <div>
            <h3>
              {currentInnings.team_name} - {currentInnings.total_runs}/
              {currentInnings.total_wickets} ({oversDisplay(currentInnings)})
            </h3>

            <h2>Batting</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>Batsman</th>
                  <th style={thS}>R</th>
                  <th style={thS}>B</th>
                  <th style={thS}>4s</th>
                  <th style={thS}>6s</th>
                  <th style={thS}>SR</th>
                </tr>
              </thead>
              <tbody>
                {batRows.map((b, index) => (
                  <tr key={b.id || b.player_id || index}>
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
                  <tr key={b.id || b.player_id || index}>
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

        {!currentInnings && (
          <div style={{ marginTop: 24, color: "#888", textAlign: "center" }}>
            No innings data available yet.
          </div>
        )}

        {match.player_of_match && (
          <div
            style={{
              marginTop: 40,
              padding: 16,
              background: "#111",
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#d85a30" }}>Player of the Match</h3>
            <p style={{ fontSize: 18 }}>{match.player_of_match}</p>
          </div>
        )}
      </div>
    </div>
  );
}
