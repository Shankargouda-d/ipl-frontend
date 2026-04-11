import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];

const emptyForm = { player_name: "", role: "Batsman", batting_style: "", bowling_style: "" };

export default function AddPlayersPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    http.get("/teams").then((r) => setTeams(r.data));
  }, []);

  useEffect(() => {
    if (!selectedTeam) return setPlayers([]);
    http.get(`/players?team_id=${selectedTeam}`).then((r) => setPlayers(r.data));
  }, [selectedTeam]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.player_name.trim()) return;
    setSaving(true);
    try {
      const res = await http.post("/players", { ...form, team_id: selectedTeam });
      setMsg(`✅ ${res.data.player_name} added as ${res.data.player_id}`);
      setForm(emptyForm);
      const r = await http.get(`/players?team_id=${selectedTeam}`);
      setPlayers(r.data);
    } catch {
      setMsg("❌ Error adding player");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = async (player_id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    await http.delete(`/players/${player_id}`);
    setPlayers((prev) => prev.filter((p) => p.player_id !== player_id));
  };

  const teamName = teams.find((t) => t.team_id == selectedTeam)?.team_name || "";

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      <nav style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "16px 24px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 20, color: "#d85a30" }}>🏏 Add Players</h1>
        <Link to="/admin/dashboard" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Team selector */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 8 }}>Select Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={selectStyle}
          >
            <option value="">-- Choose a team --</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.short_name})</option>
            ))}
          </select>
        </div>

        {selectedTeam && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Add player form */}
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", color: "#d85a30" }}>Add Player to {teamName}</h3>
              <form onSubmit={handleAdd}>
                <Field label="Player Name">
                  <input
                    value={form.player_name}
                    onChange={(e) => setForm({ ...form, player_name: e.target.value })}
                    placeholder="e.g. Virat Kohli"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Role">
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Batting Style (optional)">
                  <select value={form.batting_style} onChange={(e) => setForm({ ...form, batting_style: e.target.value })} style={selectStyle}>
                    <option value="">-- Select --</option>
                    <option>Right-handed</option>
                    <option>Left-handed</option>
                  </select>
                </Field>
                <Field label="Bowling Style (optional)">
                  <select value={form.bowling_style} onChange={(e) => setForm({ ...form, bowling_style: e.target.value })} style={selectStyle}>
                    <option value="">-- Select --</option>
                    <option>Right-arm Fast</option>
                    <option>Right-arm Medium</option>
                    <option>Right-arm Off-spin</option>
                    <option>Left-arm Fast</option>
                    <option>Left-arm Spin</option>
                    <option>Leg-spin</option>
                  </select>
                </Field>
                {msg && <p style={{ color: msg.startsWith("✅") ? "#639922" : "#e24b4a", fontSize: 13 }}>{msg}</p>}
                <button type="submit" disabled={saving} style={{
                  width: "100%", padding: "12px", borderRadius: 8,
                  background: "#d85a30", color: "#fff", border: "none",
                  fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8
                }}>
                  {saving ? "Adding..." : "Add Player"}
                </button>
              </form>
            </div>

            {/* Players list */}
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px" }}>
                {teamName} Squad
                <span style={{ color: "#888", fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
                  ({players.length} players)
                </span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                {players.length === 0 ? (
                  <p style={{ color: "#555", fontSize: 14 }}>No players added yet.</p>
                ) : players.map((p) => (
                  <div key={p.player_id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#111", borderRadius: 8, padding: "10px 14px"
                  }}>
                    <div>
                      <span style={{ color: "#d85a30", fontSize: 12, fontFamily: "monospace", marginRight: 8 }}>
                        {p.player_id}
                      </span>
                      <span style={{ fontSize: 14 }}>{p.player_name}</span>
                      <span style={{ color: "#555", fontSize: 12, marginLeft: 8 }}>{p.role}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(p.player_id, p.player_name)}
                      style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid #333", background: "#111", color: "#fff",
  fontSize: 14, outline: "none", boxSizing: "border-box"
};
const selectStyle = {
  ...inputStyle, cursor: "pointer"
};