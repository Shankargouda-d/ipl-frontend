import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

const thS = { padding: "10px 14px", textAlign: "left", color: "#666", fontSize: 11, fontWeight: 600, borderBottom: "1px solid #2a2a2a", whiteSpace: "nowrap" };
const tdS = { padding: "10px 14px", borderBottom: "1px solid #111", whiteSpace: "nowrap" };

export default function UserMatchDetailsPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState([]);

  useEffect(() => {
    http.get(`/matches/${id}`).then((r) => setMatch(r.data));
    http.get(`/innings/${id}`).then((r) => setInnings(r.data));
  }, [id]);

  if (!match) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <Link to="/matches" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>← All Matches</Link>

        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Match #{match.match_number}</div>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>{match.team1_name} vs {match.team2_name}</h1>
          <p style={{ color: "#888", margin: "0 0 4px" }}>{new Date(match.match_date).toDateString()} · {match.venue}</p>
          {match.result_text && <p style={{ color: "#639922", fontWeight: 600, marginTop: 8 }}>{match.result_text}</p>}
          {match.potm_name && <p style={{ color: "#EF9F27", fontSize: 14 }}>Player of the Match: {match.potm_name}</p>}
        </div>

        {innings.length === 0 && (
          <p style={{ color: "#555", textAlign: "center", marginTop: 32 }}>
            {match.status === "scheduled" ? "Match hasn't started yet." : "No scorecard available."}
          </p>
        )}

        {innings.map((inn) => (
          <div key={inn.innings_id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
            {/* Innings header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                {inn.batting_team_name} — Innings {inn.innings_number}
              </span>
              <span style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>
                {inn.total_runs}/{inn.total_wickets}
                <span style={{ fontSize: 14, color: "#888", marginLeft: 8 }}>({inn.overs} ov)</span>
              </span>
            </div>

            {/* Batting */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#111" }}>
                    {["Batsman", "Status", "R", "B", "4s", "6s", "SR"].map((h) => (
                      <th key={h} style={thS}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inn.batting?.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #111" }}>
                      <td style={{ ...tdS, fontWeight: 600 }}>{b.player_name}</td>
                      <td style={{ ...tdS, color: "#888", fontSize: 12 }}>{b.dismissal_type}</td>
                      <td style={{ ...tdS, fontWeight: 700 }}>{b.runs}</td>
                      <td style={tdS}>{b.balls}</td>
                      <td style={tdS}>{b.fours}</td>
                      <td style={tdS}>{b.sixes}</td>
                      <td style={tdS}>{b.strike_rate}</td>
                    </tr>
                  ))}
                  {/* Extras row */}
                  {inn.extrasDetail && (
                    <tr style={{ background: "#111" }}>
                      <td style={{ ...tdS, color: "#888" }} colSpan={2}>Extras</td>
                      <td style={{ ...tdS, color: "#888" }} colSpan={5}>
                        {inn.extrasDetail.total} (w {inn.extrasDetail.wides}, nb {inn.extrasDetail.no_balls}, b {inn.extrasDetail.byes}, lb {inn.extrasDetail.leg_byes})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bowling */}
            {inn.bowling?.length > 0 && (
              <>
                <div style={{ padding: "10px 20px", background: "#111", fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: "0.05em" }}>
                  BOWLING
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#111" }}>
                        {["Bowler", "O", "M", "R", "W", "Econ", "Wd", "NB"].map((h) => (
                          <th key={h} style={thS}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inn.bowling.map((b) => (
                        <tr key={b.id} style={{ borderBottom: "1px solid #111" }}>
                          <td style={{ ...tdS, fontWeight: 600 }}>{b.player_name}</td>
                          <td style={tdS}>{b.overs}</td>
                          <td style={tdS}>{b.maidens}</td>
                          <td style={tdS}>{b.runs_conceded}</td>
                          <td style={{ ...tdS, fontWeight: 700, color: "#7F77DD" }}>{b.wickets}</td>
                          <td style={tdS}>{b.economy}</td>
                          <td style={tdS}>{b.wides}</td>
                          <td style={tdS}>{b.no_balls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}