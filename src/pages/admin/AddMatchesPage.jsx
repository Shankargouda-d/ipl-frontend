import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../../api/http";

const empty = { match_number: "", team1_id: "", team2_id: "", match_date: "", match_time: "19:30", venue: "" };

export default function AddMatchesPage() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(empty);
  const [matches, setMatches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    http.get("/teams").then((r) => setTeams(r.data));
    loadMatches();
  }, []);

  const loadMatches = () => {
    http.get("/matches").then((r) => setMatches(r.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.team1_id === form.team2_id) return setMsg("❌ Teams must be different");
    setSaving(true);
    try {
      await http.post("/matches", form);
      setMsg("✅ Match created successfully!");
      setForm(empty);
      loadMatches();
    } catch {
      setMsg("❌ Error creating match");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this match?")) return;
    await http.delete(`/matches/${id}`);
    loadMatches();
  };

  const scheduled = matches.filter((m) => m.status === "scheduled");
  const others = matches.filter((m) => m.status !== "scheduled");

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      <nav style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "16px 24px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 20, color: "#d85a30" }}>🏏 Add Match</h1>
        <Link to="/admin/dashboard" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Form */}
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 28, marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18 }}>Create New Match</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Match Number">
                <input type="number" value={form.match_number}
                  onChange={(e) => setForm({ ...form, match_number: e.target.value })}
                  placeholder="e.g. 1" style={inputStyle} required />
              </Field>
              <Field label="Venue">
                <input value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. M. Chinnaswamy Stadium" style={inputStyle} required />
              </Field>
              <Field label="Team 1">
                <select value={form.team1_id} onChange={(e) => setForm({ ...form, team1_id: e.target.value })} style={inputStyle} required>
                  <option value="">-- Select team --</option>
                  {teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
              </Field>
              <Field label="Team 2">
                <select value={form.team2_id} onChange={(e) => setForm({ ...form, team2_id: e.target.value })} style={inputStyle} required>
                  <option value="">-- Select team --</option>
                  {teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
              </Field>
              <Field label="Match Date">
                <input type="date" value={form.match_date}
                  onChange={(e) => setForm({ ...form, match_date: e.target.value })}
                  style={inputStyle} required />
              </Field>
              <Field label="Match Time">
                <input type="time" value={form.match_time}
                  onChange={(e) => setForm({ ...form, match_time: e.target.value })}
                  style={inputStyle} required />
              </Field>
            </div>
            {msg && <p style={{ color: msg.startsWith("✅") ? "#639922" : "#e24b4a", marginTop: 12 }}>{msg}</p>}
            <button type="submit" disabled={saving} style={{
              marginTop: 20, padding: "12px 28px", borderRadius: 8,
              background: "#d85a30", color: "#fff", border: "none",
              fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>
              {saving ? "Creating..." : "Create Match"}
            </button>
          </form>
        </div>

        {/* Scheduled matches list */}
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>📅 Scheduled Matches</h2>
        {scheduled.length === 0 ? (
          <p style={{ color: "#555" }}>No scheduled matches yet.</p>
        ) : scheduled.map((m) => (
          <div key={m.match_id} style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
            padding: "16px 20px", marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                Match #{m.match_number} — {m.team1_short} vs {m.team2_short}
              </div>
              <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                {new Date(m.match_date).toDateString()} · {m.venue}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate(`/admin/matches/${m.match_id}/setup`)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#378ADD", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
                Setup →
              </button>
              <button onClick={() => handleDelete(m.match_id)}
                style={{ padding: "8px 12px", borderRadius: 8, background: "#2a2a2a", color: "#e24b4a", border: "1px solid #3a2a2a", cursor: "pointer", fontSize: 13 }}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Other matches summary */}
        {others.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, marginTop: 32 }}>Other Matches</h2>
            {others.map((m) => (
              <div key={m.match_id} style={{
                background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
                padding: "12px 16px", marginBottom: 8, opacity: 0.7
              }}>
                <span style={{ color: "#888", fontSize: 13 }}>
                  Match #{m.match_number} — {m.team1_short} vs {m.team2_short} ·{" "}
                  <span style={{ textTransform: "capitalize" }}>{m.status}</span>
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
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