import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../../api/http";

const STATUS_COLOR = {
  scheduled: "#378ADD",
  live: "#639922",
  completed: "#888780",
};

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("ipl_admin");
    navigate("/admin");
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const r = await http.get("/matches");
      setMatches(r.data);
    } catch (e) {
      console.error("Error loading matches:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const scheduled = matches.filter((m) => m.status === "scheduled");
  const live = matches.filter((m) => m.status === "live");
  const completed = matches.filter((m) => m.status === "completed");

  const deleteMatch = async (matchId) => {
    if (!window.confirm("Delete this match and ALL its data?")) return;
    try {
      await http.delete(`/matches/${matchId}`);
      loadMatches();
    } catch (e) {
      alert("Error deleting match: " + e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, color: "#d85a30" }}>
          🏏 IPL Admin
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/admin/players" style={navBtn("#1a1a1a")}>
            + Add Players
          </Link>
          <Link to="/admin/matches/add" style={navBtn("#d85a30")}>
            + New Match
          </Link>
          <button onClick={logout} style={navBtn("#2a2a2a")}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Scheduled", count: scheduled.length, color: "#378ADD" },
            { label: "Live", count: live.length, color: "#639922" },
            { label: "Completed", count: completed.length, color: "#888780" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>
                {s.count}
              </div>
              <div style={{ color: "#888", fontSize: 14 }}>
                {s.label} Matches
              </div>
            </div>
          ))}
        </div>

        {/* Live matches */}
        {live.length > 0 && (
          <Section title="🟢 Live Matches">
            {live.map((m) => (
              <MatchCard
                key={m.match_id}
                match={m}
                onDelete={deleteMatch}
              />
            ))}
          </Section>
        )}

        {/* Scheduled */}
        <Section title="📅 Scheduled Matches">
          {loading ? (
            <p style={{ color: "#666" }}>Loading...</p>
          ) : scheduled.length === 0 ? (
            <p style={{ color: "#666" }}>No scheduled matches.</p>
          ) : (
            scheduled.map((m) => (
              <MatchCard
                key={m.match_id}
                match={m}
                onDelete={deleteMatch}
              />
            ))
          )}
        </Section>

        {/* Completed */}
        {completed.length > 0 && (
          <Section title="✅ Completed Matches">
            {completed.map((m) => (
              <MatchCard
                key={m.match_id}
                match={m}
                completed
                onDelete={deleteMatch}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function MatchCard({ match, completed, onDelete }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          Match #{match.match_number} — {match.team1_short} vs{" "}
          {match.team2_short}
        </div>
        <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
          {new Date(match.match_date).toDateString()} · {match.venue}
        </div>
        {match.result_text && (
          <div style={{ color: "#639922", fontSize: 13, marginTop: 4 }}>
            {match.result_text}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12,
            background: STATUS_COLOR[match.status] + "22",
            color: STATUS_COLOR[match.status],
            fontWeight: 600,
          }}
        >
          {match.status.toUpperCase()}
        </span>

        {!completed && (
          <>
            {match.status === "scheduled" && (
              <button
                onClick={() =>
                  navigate(`/admin/matches/${match.match_id}/setup`)
                }
                style={actionBtn("#378ADD")}
              >
                Setup Match
              </button>
            )}
            {match.status === "live" && (
              <button
                onClick={() =>
                  navigate(`/admin/matches/${match.match_id}/scorecard`)
                }
                style={actionBtn("#d85a30")}
              >
                Enter Scores
              </button>
            )}
          </>
        )}

        <button
          onClick={() => onDelete(match.match_id)}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            background: "transparent",
            border: "1px solid #791F1F",
            color: "#F09595",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const navBtn = (bg) => ({
  padding: "8px 16px",
  borderRadius: 8,
  background: bg,
  color: "#fff",
  border: "1px solid #333",
  cursor: "pointer",
  fontSize: 14,
  textDecoration: "none",
  display: "inline-block",
});

const actionBtn = (bg) => ({
  padding: "6px 14px",
  borderRadius: 8,
  background: bg,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
});