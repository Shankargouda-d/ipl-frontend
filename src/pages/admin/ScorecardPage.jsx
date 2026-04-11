import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import http from "../../api/http";

const ci = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#fff",
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
};

const sb = {
  padding: "10px 24px",
  borderRadius: 8,
  background: "#d85a30",
  color: "#fff",
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function BattingTable({ rows, setRows, overs, setOvers, extras, setExtras, onSave, saving }) {
  const extTotal = Object.values(extras).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const totalRuns = rows.reduce((s, r) => s + (parseInt(r.runs) || 0), 0) + extTotal;
  const totalWickets = rows.filter((r) => r.dismissal_type !== "not out").length;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              {["Player", "Dismissal", "R", "B", "4s", "6s"].map((h) => (
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
                  <select
                    value={r.dismissal_type}
                    onChange={(e) => setRows((prev) => prev.map((row, idx) => idx === i ? { ...row, dismissal_type: e.target.value } : row))}
                    style={ci}
                  >
                    {["not out", "bowled", "caught", "lbw", "run out", "stumped", "hit wicket"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </td>
                {["runs", "balls", "fours", "sixes"].map((f) => (
                  <td key={f} style={{ padding: "8px 12px" }}>
                    <input
                      type="number"
                      min="0"
                      value={r[f]}
                      onChange={(e) => setRows((prev) => prev.map((row, idx) => idx === i ? { ...row, [f]: e.target.value } : row))}
                      style={{ ...ci, width: 52, textAlign: "center" }}
                    />
                  </td>
                ))}
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
            <label style={{ color: "#666", fontSize: 12, display: "block", marginBottom: 4 }}>Overs</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={overs}
              onChange={(e) => setOvers(e.target.value)}
              style={{ ...ci, width: 70, textAlign: "center" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div style={{ color: "#888", fontSize: 14 }}>
          Total: <strong style={{ color: "#fff", fontSize: 18 }}>{totalRuns}/{totalWickets}</strong>
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
              {["Player", "O", "M", "R", "W", "Wd", "NB"].map((h) => (
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
                {["overs", "maidens", "runs_conceded", "wickets", "wides", "no_balls"].map((f) => (
                  <td key={f} style={{ padding: "8px 12px" }}>
                    <input
                      type="number"
                      min="0"
                      step={f === "overs" ? "0.1" : "1"}
                      value={r[f]}
                      onChange={(e) => setRows((prev) => prev.map((row, idx) => idx === i ? { ...row, [f]: e.target.value } : row))}
                      style={{ ...ci, width: f === "overs" ? 60 : 52, textAlign: "center" }}
                    />
                  </td>
                ))}
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
  const [squad, setSquad] = useState([]);
  const [activeTab, setActiveTab] = useState("inn1-bat");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadError, setLoadError] = useState("");
  const [bat1, setBat1] = useState([]);
  const [bat2, setBat2] = useState([]);
  const [bowl1, setBowl1] = useState([]);
  const [bowl2, setBowl2] = useState([]);
  const [ext1, setExt1] = useState({ wides: 0, no_balls: 0, byes: 0, leg_byes: 0 });
  const [ext2, setExt2] = useState({ wides: 0, no_balls: 0, byes: 0, leg_byes: 0 });
  const [inn1Overs, setInn1Overs] = useState("");
  const [inn2Overs, setInn2Overs] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Step 1: load match and toss
      const [mr, tr] = await Promise.all([
        http.get(`/matches/${id}`),
        http.get(`/toss/${id}`),
      ]);

      setMatch(mr.data);
      setToss(tr.data);

      const team1Id = mr.data.team1_id;
      const team2Id = mr.data.team2_id;

      // Step 2: load squad for BOTH teams separately with teamId
      const [sq1, sq2] = await Promise.all([
        http.get(`/squad/${id}/${team1Id}`),
        http.get(`/squad/${id}/${team2Id}`),
      ]);

      const combinedSquad = [...sq1.data, ...sq2.data];
      setSquad(combinedSquad);

      const batFirst = tr.data?.batting_first_team_id;
      const batSecond = batFirst === team1Id ? team2Id : team1Id;

      const bfSquad = combinedSquad.filter((p) => p.team_id === batFirst);
      const bsSquad = combinedSquad.filter((p) => p.team_id === batSecond);

      setBat1(bfSquad.map((p, i) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        runs: "", balls: "", fours: "", sixes: "",
        dismissal_type: "not out",
        batting_order: i + 1,
      })));

      setBat2(bsSquad.map((p, i) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        runs: "", balls: "", fours: "", sixes: "",
        dismissal_type: "not out",
        batting_order: i + 1,
      })));

      setBowl1(bsSquad.map((p) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        overs: "", maidens: "0", runs_conceded: "",
        wickets: "", wides: "0", no_balls: "0",
      })));

      setBowl2(bfSquad.map((p) => ({
        player_id: p.player_id,
        player_name: p.player_name,
        overs: "", maidens: "0", runs_conceded: "",
        wickets: "", wides: "0", no_balls: "0",
      })));

    } catch (e) {
      console.error("loadData error:", e);
      setLoadError(e?.response?.data?.error || e.message || "Failed to load match data");
    }
  };

  const saveInnings = async (num) => {
    if (!toss) {
      setMsg("Toss missing. Complete toss setup first.");
      return;
    }

    const batting = num === 1 ? bat1 : bat2;
    const bowling = num === 1 ? bowl1 : bowl2;
    const extras = num === 1 ? ext1 : ext2;
    const overs = num === 1 ? inn1Overs : inn2Overs;

    const batFirst = toss.batting_first_team_id;
    const batSecond = batFirst === match.team1_id ? match.team2_id : match.team1_id;

    const batting_team_id = num === 1 ? batFirst : batSecond;
    const bowling_team_id = num === 1 ? batSecond : batFirst;

    const extTotal = Object.values(extras).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const totalRuns = batting.reduce((s, r) => s + (parseInt(r.runs) || 0), 0) + extTotal;
    const totalWickets = batting.filter((b) => b.dismissal_type !== "not out").length;

    setSaving(true);

    try {
      const res = await http.post("/innings/create", {
        match_id: id,
        innings_number: num,
        batting_team_id,
        bowling_team_id,
        total_runs: totalRuns,
        total_wickets: totalWickets,
        overs: parseFloat(overs) || 20,
        extras: extTotal,
      });

      const innings_id = res.data.innings_id;

      await http.post("/innings/batting", {
        innings_id,
        batting: batting.map((b, i) => ({
          ...b,
          runs: parseInt(b.runs) || 0,
          balls: parseInt(b.balls) || 0,
          fours: parseInt(b.fours) || 0,
          sixes: parseInt(b.sixes) || 0,
          batting_order: i + 1,
        })),
      });

      const activeBowlers = bowling.filter((b) => parseFloat(b.overs) > 0);

      await http.post("/innings/bowling", {
        innings_id,
        bowling: activeBowlers.map((b) => ({
          ...b,
          overs: parseFloat(b.overs) || 0,
          runs_conceded: parseInt(b.runs_conceded) || 0,
          wickets: parseInt(b.wickets) || 0,
        })),
      });

      await http.post("/innings/extras", {
        match_id: id,
        innings_number: num,
        ...extras,
      });

      setMsg(`✅ Innings ${num} saved! Total: ${totalRuns}/${totalWickets}`);
    } catch (e) {
      setMsg("❌ Error: " + (e?.response?.data?.error || e.message));
    }

    setSaving(false);
  };

  const completeMatch = async () => {
    if (!window.confirm("Mark COMPLETED? Stats and points table will auto-update.")) return;

    setCompleting(true);
    try {
      const res = await http.post("/results/complete", { match_id: id });
      alert(`Match Complete!\n${res.data.result_text}\nPOTM: ${res.data.player_of_match}`);
      navigate("/admin/dashboard");
    } catch {
      setMsg("❌ Make sure both innings are saved first.");
    }
    setCompleting(false);
  };

  // Show error if loading failed
  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 16 }}>
        <p style={{ color: "#F09595", fontSize: 16 }}>❌ {loadError}</p>
        <button onClick={() => navigate("/admin/dashboard")} style={sb}>← Back to Dashboard</button>
      </div>
    );
  }

  // Show loading while match data is being fetched
  if (!match) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading match data...
      </div>
    );
  }

  // Show warning if toss not done yet
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
          Scorecard — Match #{match.match_number}: {match.team1_short} vs {match.team2_short}
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
          <div style={{ background: msg.startsWith("✅") ? "#1e2e1e" : "#2e1e1e", border: `1px solid ${msg.startsWith("✅") ? "#3B6D11" : "#791F1F"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: msg.startsWith("✅") ? "#97C459" : "#F09595", fontSize: 14 }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, background: activeTab === t.key ? "#d85a30" : "#1a1a1a", color: activeTab === t.key ? "#fff" : "#888" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "inn1-bat" && (
          <BattingTable rows={bat1} setRows={setBat1} overs={inn1Overs} setOvers={setInn1Overs} extras={ext1} setExtras={setExt1} onSave={() => saveInnings(1)} saving={saving} />
        )}
        {activeTab === "inn1-bowl" && (
          <BowlingTable rows={bowl1} setRows={setBowl1} onSave={() => saveInnings(1)} saving={saving} />
        )}
        {activeTab === "inn2-bat" && (
          <BattingTable rows={bat2} setRows={setBat2} overs={inn2Overs} setOvers={setInn2Overs} extras={ext2} setExtras={setExt2} onSave={() => saveInnings(2)} saving={saving} />
        )}
        {activeTab === "inn2-bowl" && (
          <BowlingTable rows={bowl2} setRows={setBowl2} onSave={() => saveInnings(2)} saving={saving} />
        )}

        <div style={{ marginTop: 40, padding: 24, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, textAlign: "center" }}>
          <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>
            Save both innings first, then click below. Winner, POTM, stats and points table will all auto-update.
          </p>
          <button onClick={completeMatch} disabled={completing} style={{ padding: "14px 36px", borderRadius: 10, background: "#639922", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            {completing ? "Processing..." : "✅ Mark Match as Completed"}
          </button>
        </div>
      </div>
    </div>
  );
}