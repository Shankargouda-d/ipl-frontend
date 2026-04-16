import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadAll();
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

  const currentInnings = innings?.[activeInnings] || null;

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
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading scorecard...
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <h1>{match.team1_name} vs {match.team2_name}</h1>
        </div>

        {currentInnings && (
          <div>
            <h2>Batting</h2>
            {batRows.map((b) => (
              <div key={b.id}>
                {b.player_name} - {b.runs} ({b.balls})
              </div>
            ))}

            <h2>Bowling</h2>
            {bowlRows.map((b) => (
              <div key={b.id}>
                {b.player_name} - {b.wickets}/{b.runs_conceded}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}