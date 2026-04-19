import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import http from "../../api/http";

const ci = {
  background: "#111", border: "1px solid #333", borderRadius: 6,
  color: "#fff", padding: "4px 8px", fontSize: 13, outline: "none",
};

const sb = {
  padding: "10px 24px", borderRadius: 8, background: "#d85a30",
  color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

function fixOvers(val) {
  const str = String(val);
  if (!str.includes(".")) return str;
  const [whole, dec] = str.split(".");
  if (dec !== undefined && parseInt(dec) >= 6) {
    return (parseInt(whole) + 1) + ".0";
  }
  return str;
}

function calcSR(runs, balls) {
  if (!balls || parseInt(balls) === 0) return "0.00";
  return ((parseInt(runs) / parseInt(balls)) * 100).toFixed(2);
}

function calcEco(runs, overs) {
  if (!overs || parseFloat(overs) === 0) return "0.00";
  return (parseInt(runs) / parseFloat(overs)).toFixed(2);
}

function validateInnings(batting, bowling, overs) {
  const errors = [];

  if (parseFloat(overs) > 20) errors.push("Total overs cannot exceed 20");

  const wickets = batting.filter(
    (b) => b.dismissal_type !== "not out" && b.dismissal_type !== "did not bat"
  ).length;
  if (wickets > 10) errors.push("Wickets cannot exceed 10");

  for (const b of batting) {
    if (b.dismissal_type === "did not bat") continue;

    const runs = parseInt(b.runs) || 0;
    const balls = parseInt(b.balls) || 0;
    const fours = parseInt(b.fours) || 0;
    const sixes = parseInt(b.sixes) || 0;

    if (runs < 0) errors.push(`${b.player_name}: runs cannot be negative`);
    if (balls < 0) errors.push(`${b.player_name}: balls cannot be negative`);

    const boundaryRuns = fours * 4 + sixes * 6;
    if (boundaryRuns > runs) {
      errors.push(`${b.player_name}: boundary runs (${boundaryRuns}) exceed total runs (${runs})`);
    }
    if (balls > 0 && (fours + sixes) > balls) {
      errors.push(`${b.player_name}: boundaries cannot exceed balls faced`);
    }
  }

  for (const b of bowling) {
    if (!b.player_id || !parseFloat(b.overs)) continue;
    if (parseFloat(b.overs) > 4) {
      errors.push(`${b.player_name}: cannot bowl more than 4 overs in T20`);
    }
    if (parseInt(b.wickets) > 10) {
      errors.push(`${b.player_name}: wickets cannot exceed 10`);
    }
  }

  return errors;
}

function BattingTable({
  rows, setRows, overs, setOvers, extras,
  setExtras, onSave, saving, bowlingSquad
}) {
  const playingRows = rows.filter((r) => r.dismissal_type !== "did not bat");
  const extTotal = Object.values(extras).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const totalRuns = playingRows.reduce((s, r) => s + (parseInt(r.runs) || 0), 0) + extTotal;
  const totalWickets = playingRows.filter((r) => r.dismissal_type !== "not out").length;

  const isOut = (d) => d !== "not out" && d !== "did not bat";
  const needsBowler = (d) => ["bowled", "caught", "lbw", "stumped", "hit wicket"].includes(d);
  const needsFielder = (d) => ["caught", "run out", "stumped"].includes(d);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              {["Pos", "Player", "Dismissal", "Bowler", "Fielder", "R", "B", "4s", "6s", "SR"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "#888",
                    fontWeight: 600,
                    fontSize: 12,
                    borderBottom: "1px solid #2a2a2a",
                    whiteSpace: "nowrap"
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.player_id}
                style={{
                  borderBottom: "1px solid #1a1a1a",
                  background:
                    r.dismissal_type === "did not bat"
                      ? "#101010"
                      : isOut(r.dismissal_type)
                      ? "#1a0f0f"
                      : "transparent"
                }}
              >
                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    min="1"
                    value={r.batting_order}
                    onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                      idx === i ? { ...row, batting_order: e.target.value } : row
                    ))}
                    style={{ ...ci, width: 58, textAlign: "center" }}
                  />
                </td>

                <td
                  style={{
                    padding: "8px 12px",
                    whiteSpace: "nowrap",
                    color: r.dismissal_type === "did not bat" ? "#777" : isOut(r.dismissal_type) ? "#888" : "#fff"
                  }}
                >
                  {r.player_name}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <select
                    value={r.dismissal_type}
                    onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                      idx === i ? {
                        ...row,
                        dismissal_type: e.target.value,
                        wicket_taker_player_id: "",
                        fielder_player_id: "",
                        fielder_sub_name: "",
                        ...(e.target.value === "did not bat"
                          ? { runs: "", balls: "", fours: "", sixes: "" }
                          : {})
                      } : row
                    ))}
                    style={ci}
                  >
                    {["not out", "bowled", "caught", "lbw", "run out", "stumped", "hit wicket", "did not bat"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {r.dismissal_type !== "did not bat" && isOut(r.dismissal_type) && needsBowler(r.dismissal_type) ? (
                    <select
                      value={r.wicket_taker_player_id || ""}
                      onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                        idx === i ? { ...row, wicket_taker_player_id: e.target.value } : row
                      ))}
                      style={{ ...ci, minWidth: 130 }}
                    >
                      <option value="">Select bowler</option>
                      {bowlingSquad.map((p) => (
                        <option key={p.player_id} value={p.player_id}>{p.player_name}</option>
                      ))}
                    </select>
                  ) : <span style={{ color: "#444" }}>—</span>}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  {r.dismissal_type !== "did not bat" && isOut(r.dismissal_type) && needsFielder(r.dismissal_type) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <select
                        value={r.fielder_player_id || ""}
                        onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                          idx === i ? {
                            ...row,
                            fielder_player_id: e.target.value,
                            fielder_sub_name: e.target.value === "sub_out" ? (row.fielder_sub_name || "") : ""
                          } : row
                        ))}
                        style={{ ...ci, minWidth: 140 }}
                      >
                        <option value="">Select fielder</option>
                        {bowlingSquad.map((p) => (
                          <option key={p.player_id} value={p.player_id}>{p.player_name}</option>
                        ))}
                        <option value="sub_out">🔄 Sub Out</option>
                      </select>
                      {r.fielder_player_id === "sub_out" && (
                        <input
                          type="text"
                          placeholder="Enter sub fielder name"
                          value={r.fielder_sub_name || ""}
                          onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                            idx === i ? { ...row, fielder_sub_name: e.target.value } : row
                          ))}
                          style={{ ...ci, minWidth: 140, fontSize: 12, padding: "4px 8px" }}
                        />
                      )}
                    </div>
                  ) : <span style={{ color: "#444" }}>—</span>}
                </td>

                {["runs", "balls", "fours", "sixes"].map((f) => (
                  <td key={f} style={{ padding: "8px 12px" }}>
                    <input
                      type="number"
                      min="0"
                      value={r[f]}
                      disabled={r.dismissal_type === "did not bat"}
                      onChange={(e) => setRows((prev) => prev.map((row, idx) =>
                        idx === i ? { ...row, [f]: e.target.value } : row
                      ))}
                      style={{
                        ...ci,
                        width: 52,
                        textAlign: "center",
                        opacity: r.dismissal_type === "did not bat" ? 0.45 : 1
                      }}
                    />
                  </td>
                ))}

                <td style={{ padding: "8px 12px", color: "#aaa", fontSize: 12, textAlign: "center" }}>
                  {r.dismissal_type === "did not bat" ? "-" : calcSR(r.runs, r.balls)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h4 style={{ margin: "0 0 12px", color: "#888", fontSize: 13 }}>Extras</h4>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["wides", "no_balls", "byes", "leg_byes"].map((f) => (
            <div key={f}>
              <label style={{ color: "#666", fontSize: 12, display: "block", marginBottom: 4, textTransform: "capitalize" }}>
                {f.replace("_", " ")}
              </label>
              <input
                type="number"
                min="0"
                value={extras[f]}
                onChange={(e) => setExtras({ ...extras, [f]: e.target.value })}
                style={{ ...ci, width: 60, textAlign: "center" }}
              />
            </div>
          ))}
          <div>
            <label style={{ color: "#666", fontSize: 12, display: "block", marginBottom: 4 }}>
              Overs
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={overs}
              onChange={(e) => setOvers(fixOvers(e.target.value))}
              style={{ ...ci, width: 70, textAlign: "center" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div style={{ color: "#888", fontSize: 14 }}>
          Total:{" "}
          <strong style={{ color: "#fff", fontSize: 18 }}>{totalRuns}/{totalWickets}</strong>
          <span style={{ marginLeft: 8, fontSize: 13, color: "#666" }}>
            ({overs || 0} ov) · Extras: {extTotal}
          </span>
        </div>
        <button onClick={onSave} disabled={saving} style={sb}>
          {saving ? "Saving..." : "Save Innings"}
        </button>
      </div>
    </div>
  );
}

function BowlingTable({ rows, setRows, onSave, saving }) {
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              {["Player", "O", "M", "R", "W", "Eco", "Wd", "NB"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #2a2a2a" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player_id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "8px 12px" }}>{r.player_name}</td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={r.overs}
                    onChange={(e) => {
                      const fixed = fixOvers(e.target.value);
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, overs: fixed } : row
                        )
                      );
                    }}
                    style={{ ...ci, width: 60, textAlign: "center" }}
                  />
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    value={r.maidens}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, maidens: e.target.value } : row
                        )
                      )
                    }
                    style={{ ...ci, width: 52, textAlign: "center" }}
                  />
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    value={r.runs_conceded}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, runs_conceded: e.target.value } : row
                        )
                      )
                    }
                    style={{ ...ci, width: 52, textAlign: "center" }}
                  />
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    value={r.wickets}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, wickets: e.target.value } : row
                        )
                      )
                    }
                    style={{ ...ci, width: 52, textAlign: "center" }}
                  />
                </td>

                <td style={{ padding: "8px 12px", textAlign: "center", color: "#aaa" }}>
                  {calcEco(r.runs_conceded, r.overs)}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    value={r.wides}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, wides: e.target.value } : row
                        )
                      )
                    }
                    style={{ ...ci, width: 52, textAlign: "center" }}
                  />
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <input
                    type="number"
                    value={r.no_balls}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, no_balls: e.target.value } : row
                        )
                      )
                    }
                    style={{ ...ci, width: 52, textAlign: "center" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button onClick={onSave} disabled={saving} style={sb}>
          {saving ? "Saving..." : "Save Bowling"}
        </button>
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [toss, setToss] = useState(null);
  const [bfSquad, setBfSquad] = useState([]);
  const [bsSquad, setBsSquad] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("inn1-bat");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadError, setLoadError] = useState("");
  const [potmPlayerId, setPotmPlayerId] = useState("");

  const [bat1, setBat1] = useState([]);
  const [bat2, setBat2] = useState([]);
  const [bowl1, setBowl1] = useState([]);
  const [bowl2, setBowl2] = useState([]);
  const [ext1, setExt1] = useState({ wides: 0, no_balls: 0, byes: 0, leg_byes: 0 });
  const [ext2, setExt2] = useState({ wides: 0, no_balls: 0, byes: 0, leg_byes: 0 });
  const [inn1Overs, setInn1Overs] = useState("");
  const [inn2Overs, setInn2Overs] = useState("");

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [mr, tr] = await Promise.all([
        http.get(`/matches/${id}`),
        http.get(`/toss/${id}`),
      ]);

      setMatch(mr.data);
      setToss(tr.data);

      const team1Id = mr.data.team1_id;
      const team2Id = mr.data.team2_id;

      const [sq1, sq2] = await Promise.all([
        http.get(`/squad/${id}/${team1Id}`),
        http.get(`/squad/${id}/${team2Id}`),
      ]);

      const batFirstId = tr.data?.batting_first_team_id;
      const batSecondId = batFirstId === team1Id ? team2Id : team1Id;

      const batFirstSquad = [
        ...sq1.data.filter((p) => p.team_id === batFirstId),
        ...sq2.data.filter((p) => p.team_id === batFirstId),
      ];
      const batSecondSquad = [
        ...sq1.data.filter((p) => p.team_id === batSecondId),
        ...sq2.data.filter((p) => p.team_id === batSecondId),
      ];

      setBfSquad(batFirstSquad);
      setBsSquad(batSecondSquad);
      setAllPlayers([...sq1.data, ...sq2.data]);

      setBat1(batFirstSquad.map((p, i) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        runs: "",
        balls: "",
        fours: "",
        sixes: "",
        dismissal_type: "not out",
        wicket_taker_player_id: "",
        fielder_player_id: "",
        fielder_sub_name: "",
        batting_order: i + 1,
      })));

      setBat2(batSecondSquad.map((p, i) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        runs: "",
        balls: "",
        fours: "",
        sixes: "",
        dismissal_type: "not out",
        wicket_taker_player_id: "",
        fielder_player_id: "",
        fielder_sub_name: "",
        batting_order: i + 1,
      })));

      setBowl1(batSecondSquad.map((p) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        overs: "",
        maidens: "0",
        runs_conceded: "",
        wickets: "",
        wides: "0",
        no_balls: "0",
      })));

      setBowl2(batFirstSquad.map((p) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        overs: "",
        maidens: "0",
        runs_conceded: "",
        wickets: "",
        wides: "0",
        no_balls: "0",
      })));

    } catch (e) {
      console.error("loadData error:", e);
      setLoadError(e?.response?.data?.error || e.message || "Failed to load match data");
    }
  };

  const saveInnings = async (num) => {
    if (!toss) { setMsg("Toss missing. Complete toss setup first."); return; }

    const batting = num === 1 ? bat1 : bat2;
    const bowling = num === 1 ? bowl1 : bowl2;
    const extras = num === 1 ? ext1 : ext2;
    const overs = num === 1 ? inn1Overs : inn2Overs;

    const errors = validateInnings(batting, bowling, overs);
    if (errors.length > 0) {
      setMsg("❌ " + errors.join(" | "));
      return;
    }

    const batFirstId = toss.batting_first_team_id;
    const batSecondId = batFirstId === match.team1_id ? match.team2_id : match.team1_id;
    const batting_team_id = num === 1 ? batFirstId : batSecondId;
    const bowling_team_id = num === 1 ? batSecondId : batFirstId;

    const playingBatting = batting.filter((b) => b.dismissal_type !== "did not bat");
    const extTotal = Object.values(extras).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const totalRuns = playingBatting.reduce((s, r) => s + (parseInt(r.runs) || 0), 0) + extTotal;
    const totalWickets = playingBatting.filter((b) => b.dismissal_type !== "not out").length;
    const activeBowlers = bowling.filter((b) => parseFloat(b.overs) > 0);

    setSaving(true);
    try {
      await http.post("/innings/save", {
        match_id: id,
        innings_number: num,
        batting_team_id,
        bowling_team_id,
        total_runs: totalRuns,
        total_wickets: totalWickets,
        overs: parseFloat(overs) || 20,
        extras: extTotal,
        batting: batting.map((b) => ({
          player_id: b.player_id,
          runs: b.dismissal_type === "did not bat" ? 0 : parseInt(b.runs) || 0,
          balls: b.dismissal_type === "did not bat" ? 0 : parseInt(b.balls) || 0,
          fours: b.dismissal_type === "did not bat" ? 0 : parseInt(b.fours) || 0,
          sixes: b.dismissal_type === "did not bat" ? 0 : parseInt(b.sixes) || 0,
          dismissal_type: b.dismissal_type || "not out",
          wicket_taker_player_id: b.wicket_taker_player_id || null,
          fielder_player_id: b.fielder_player_id === "sub_out" ? null : (b.fielder_player_id || null),
          fielder_sub_name: b.fielder_player_id === "sub_out" ? (b.fielder_sub_name || null) : null,
          batting_order: parseInt(b.batting_order) || null,
        })),
        bowling: activeBowlers.map((b) => ({
          player_id: b.player_id,
          overs: parseFloat(b.overs) || 0,
          maidens: parseInt(b.maidens) || 0,
          runs_conceded: parseInt(b.runs_conceded) || 0,
          wickets: parseInt(b.wickets) || 0,
          wides: parseInt(b.wides) || 0,
          no_balls: parseInt(b.no_balls) || 0,
        })),
      });

      setMsg(`✅ Innings ${num} saved! Total: ${totalRuns}/${totalWickets} (${overs} ov)`);
    } catch (e) {
      setMsg("❌ Error: " + (e?.response?.data?.error || e.message));
    }
    setSaving(false);
  };

  const completeMatch = async () => {
  if (!potmPlayerId) {
    setMsg("❌ Please select Player of the Match (or choose 'None' for abandoned match).");
    return;
  }

  const isAbandoned = potmPlayerId === "none";
  const confirmMsg = isAbandoned
    ? "Mark as COMPLETED with No Result (Abandoned)? Both teams get 1 point."
    : "Mark COMPLETED? Stats and points table will auto-update.";

  if (!window.confirm(confirmMsg)) {
    return;
  }

  setCompleting(true);
  setMsg("");

  try {
    const res = await http.post("/results/complete", {
      match_id: id,
      player_of_match_id: isAbandoned ? null : potmPlayerId,
      abandoned: isAbandoned,
    });

    const potmLabel = isAbandoned ? "No POTM (Abandoned)" : potmPlayerId;
    alert(`Match Complete!\n${res.data.result_text}\nPOTM: ${potmLabel}`);
    navigate("/admin/dashboard");
  } catch (err) {
    setMsg(
      err?.response?.data?.error ||
      err?.response?.data?.sqlMessage ||
      "❌ Make sure both innings are saved first."
    );
  } finally {
    setCompleting(false);
  }
};

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 16 }}>
        <p style={{ color: "#F09595", fontSize: 16 }}>❌ {loadError}</p>
        <button onClick={() => navigate("/admin/dashboard")} style={sb}>← Back to Dashboard</button>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading match data...
      </div>
    );
  }

  if (!toss) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 16 }}>
        <p style={{ color: "#F09595", fontSize: 16 }}>⚠️ Toss not recorded for this match yet.</p>
        <p style={{ color: "#888", fontSize: 14 }}>Please complete the toss before entering scores.</p>
        <button onClick={() => navigate("/admin/dashboard")} style={sb}>← Back to Dashboard</button>
      </div>
    );
  }

  const tabs = [
    { key: "inn1-bat", label: "1st Inn Batting" },
    { key: "inn1-bowl", label: "1st Inn Bowling" },
    { key: "inn2-bat", label: "2nd Inn Batting" },
    { key: "inn2-bowl", label: "2nd Inn Bowling" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      <nav style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 16, color: "#d85a30" }}>
          Scorecard — {match.team1_name} vs {match.team2_name}
        </h1>
        <Link to="/admin/dashboard" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 20 }}>
          Batting first: <strong style={{ color: "#fff" }}>{toss.batting_first_name}</strong>
        </p>

        {msg && (
          <div style={{
            background: msg.startsWith("✅") ? "#1e2e1e" : "#2e1e1e",
            border: `1px solid ${msg.startsWith("✅") ? "#3B6D11" : "#791F1F"}`,
            borderRadius: 8, padding: "10px 16px", marginBottom: 16,
            color: msg.startsWith("✅") ? "#97C459" : "#F09595", fontSize: 14,
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none",
                cursor: "pointer", fontSize: 13,
                background: activeTab === t.key ? "#d85a30" : "#1a1a1a",
                color: activeTab === t.key ? "#fff" : "#888" }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "inn1-bat" && (
          <BattingTable rows={bat1} setRows={setBat1}
            overs={inn1Overs} setOvers={setInn1Overs}
            extras={ext1} setExtras={setExt1}
            onSave={() => saveInnings(1)} saving={saving}
            bowlingSquad={bsSquad} />
        )}
        {activeTab === "inn1-bowl" && (
          <BowlingTable rows={bowl1} setRows={setBowl1}
            onSave={() => saveInnings(1)} saving={saving} />
        )}
        {activeTab === "inn2-bat" && (
          <BattingTable rows={bat2} setRows={setBat2}
            overs={inn2Overs} setOvers={setInn2Overs}
            extras={ext2} setExtras={setExt2}
            onSave={() => saveInnings(2)} saving={saving}
            bowlingSquad={bfSquad} />
        )}
        {activeTab === "inn2-bowl" && (
          <BowlingTable rows={bowl2} setRows={setBowl2}
            onSave={() => saveInnings(2)} saving={saving} />
        )}

        <div style={{ marginTop: 40, padding: 24, background: "#1a1a1a",
          border: "1px solid #2a2a2a", borderRadius: 12 }}>

          <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#fff" }}>
            Complete Match
          </h3>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
            Save both innings first. Then select Player of the Match and mark as completed.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 8 }}>
              Player of the Match
            </label>
            <select
              value={potmPlayerId}
              onChange={(e) => setPotmPlayerId(e.target.value)}
              style={{ ...ci, minWidth: 240, padding: "8px 12px", fontSize: 14 }}
            >
              <option value="">— Select player —</option>
              <option value="none">🌧️ None (Rain / Abandoned / No Result)</option>
              <optgroup label={match.team1_name}>
                {allPlayers
                  .filter((p) => p.team_id === match.team1_id)
                  .map((p) => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.player_name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label={match.team2_name}>
                {allPlayers
                  .filter((p) => p.team_id === match.team2_id)
                  .map((p) => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.player_name}
                    </option>
                  ))}
              </optgroup>
            </select>
            {potmPlayerId === "none" && (
              <p style={{ color: "#EF9F27", fontSize: 12, marginTop: 6 }}>
                ⚠️ No POTM — both teams will receive 1 point each (No Result).
              </p>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={completeMatch}
              disabled={completing || !potmPlayerId}
              style={{
                padding: "14px 36px", borderRadius: 10, border: "none",
                fontSize: 16, fontWeight: 700,
                background: potmPlayerId ? (potmPlayerId === "none" ? "#5a7d2a" : "#639922") : "#2a2a2a",
                color: potmPlayerId ? "#fff" : "#555",
                cursor: potmPlayerId ? "pointer" : "not-allowed",
              }}
            >
              {completing ? "Processing..." : potmPlayerId === "none" ? "🌧️ Mark as No Result" : "✅ Mark Match as Completed"}
            </button>
            {!potmPlayerId && (
              <p style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
                Select Player of the Match (or None for abandoned) to enable this button
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
