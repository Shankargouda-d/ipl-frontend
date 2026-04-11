import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import http from "../../api/http";

export default function MatchSetupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("bat");
  const [selected1, setSelected1] = useState({});
  const [selected2, setSelected2] = useState({});
  const [impact1, setImpact1] = useState("");
  const [impact2, setImpact2] = useState("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    http.get(`/matches/${id}`).then((r) => {
      setMatch(r.data);
      http.get(`/players?team_id=${r.data.team1_id}`).then((p) => setTeam1Players(p.data));
      http.get(`/players?team_id=${r.data.team2_id}`).then((p) => setTeam2Players(p.data));
    });
  }, [id]);

  const saveToss = async () => {
    if (!tossWinner) return setMsg("Select toss winner");
    setSaving(true);
    try {
      await http.post("/toss", { match_id: id, toss_winner_team_id: tossWinner, decision });
      setStep(2);
      setMsg("");
    } catch { setMsg("Error saving toss"); }
    setSaving(false);
  };

  const toggleSelect = (pid, obj, setObj) => {
    setObj((prev) => {
      const next = { ...prev };
      if (next[pid]) delete next[pid];
      else if (Object.keys(next).length < 11) next[pid] = true;
      return next;
    });
  };

  const savePlaying11 = async () => {
    const s1 = Object.keys(selected1);
    const s2 = Object.keys(selected2);
    if (s1.length !== 11) return setMsg("Select exactly 11 players for Team 1");
    if (s2.length !== 11) return setMsg("Select exactly 11 players for Team 2");
    setSaving(true);
    try {
      await http.post("/squad", {
        match_id: id, team_id: match.team1_id,
        players: s1.map((pid) => ({ player_id: pid, is_impact_player: pid === impact1 }))
      });
      await http.post("/squad", {
        match_id: id, team_id: match.team2_id,
        players: s2.map((pid) => ({ player_id: pid, is_impact_player: pid === impact2 }))
      });
      navigate(`/admin/matches/${id}/scorecard`);
    } catch { setMsg("Error saving playing 11"); }
    setSaving(false);
  };

  if (!match) return <Loading />;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      <nav style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "16px 24px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 20, color: "#d85a30" }}>Match #{match.match_number} Setup</h1>
        <Link to="/admin/dashboard" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Match info */}
        <div style={{ textAlign: "center", marginBottom: 32, color: "#888" }}>
          <h2 style={{ color: "#fff", margin: "0 0 8px" }}>{match.team1_name} vs {match.team2_name}</h2>
          <p style={{ margin: 0 }}>{new Date(match.match_date).toDateString()} · {match.venue}</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {["Toss", "Playing 11"].map((s, i) => (
            <div key={s} style={{
              padding: "6px 18px", borderRadius: 20, fontSize: 13,
              background: step === i + 1 ? "#d85a30" : "#2a2a2a",
              color: step === i + 1 ? "#fff" : "#666"
            }}>{i + 1}. {s}</div>
          ))}
        </div>

        {msg && <p style={{ color: "#e24b4a", textAlign: "center" }}>{msg}</p>}

        {/* STEP 1: Toss */}
        {step === 1 && (
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 28, maxWidth: 500, margin: "0 auto" }}>
            <h3 style={{ margin: "0 0 24px" }}>Toss Result</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Who won the toss?</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[{ id: match.team1_id, name: match.team1_short }, { id: match.team2_id, name: match.team2_short }].map((t) => (
                  <button key={t.id} onClick={() => setTossWinner(String(t.id))}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 8, cursor: "pointer",
                      background: tossWinner == t.id ? "#d85a30" : "#111",
                      color: "#fff", border: tossWinner == t.id ? "2px solid #d85a30" : "1px solid #333",
                      fontWeight: 600, fontSize: 15
                    }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Elected to?</label>
              <div style={{ display: "flex", gap: 12 }}>
                {["bat", "field"].map((d) => (
                  <button key={d} onClick={() => setDecision(d)}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 8, cursor: "pointer",
                      background: decision === d ? "#378ADD" : "#111",
                      color: "#fff", border: decision === d ? "2px solid #378ADD" : "1px solid #333",
                      fontWeight: 600, fontSize: 15, textTransform: "capitalize"
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveToss} disabled={saving} style={primaryBtn}>
              {saving ? "Saving..." : "Save Toss & Continue →"}
            </button>
          </div>
        )}

        {/* STEP 2: Playing 11 */}
        {step === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <TeamSelector
                teamName={match.team1_name}
                players={team1Players}
                selected={selected1}
                impact={impact1}
                onToggle={(pid) => toggleSelect(pid, selected1, setSelected1)}
                onImpact={setImpact1}
              />
              <TeamSelector
                teamName={match.team2_name}
                players={team2Players}
                selected={selected2}
                impact={impact2}
                onToggle={(pid) => toggleSelect(pid, selected2, setSelected2)}
                onImpact={setImpact2}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button onClick={savePlaying11} disabled={saving} style={primaryBtn}>
                {saving ? "Saving..." : "Save Playing 11 & Go to Scorecard →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamSelector({ teamName, players, selected, impact, onToggle, onImpact }) {
  const count = Object.keys(selected).length;
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{teamName}</h3>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>
        Selected: {count}/11
        {count === 11 && <span style={{ color: "#639922" }}> ✓</span>}
      </p>
      <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {players.map((p) => {
          const isSelected = !!selected[p.player_id];
          const isImpact = impact === p.player_id;
          return (
            <div key={p.player_id} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: isSelected ? "#1e2e1e" : "#111",
              border: isSelected ? "1px solid #3B6D11" : "1px solid #222",
              borderRadius: 8, padding: "8px 12px", cursor: "pointer"
            }} onClick={() => onToggle(p.player_id)}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, border: "2px solid",
                borderColor: isSelected ? "#639922" : "#444",
                background: isSelected ? "#639922" : "transparent",
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13 }}>{p.player_name}</span>
                <span style={{ color: "#555", fontSize: 11, marginLeft: 6 }}>{p.role}</span>
              </div>
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onImpact(isImpact ? "" : p.player_id); }}
                  style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "none", cursor: "pointer",
                    background: isImpact ? "#d85a30" : "#333",
                    color: isImpact ? "#fff" : "#888"
                  }}>
                  {isImpact ? "IMPACT" : "Impact?"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Loading() {
  return <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading...</div>;
}

const labelStyle = { color: "#888", fontSize: 13, display: "block", marginBottom: 10 };
const primaryBtn = {
  padding: "12px 28px", borderRadius: 8, background: "#d85a30", color: "#fff",
  border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer"
};