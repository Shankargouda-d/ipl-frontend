import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import { getTeamColor } from "../../utils/teamColors";
import MatchPrediction from "../../components/MatchPrediction";
import DailyMomentSnippet from "../../components/DailyMomentSnippet";

const CapIcon = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ verticalAlign: "middle" }}>
    <path d="M12 4C8.13401 4 5 7.13401 5 11V13H19V11C19 7.13401 15.866 4 12 4Z" />
    <path d="M3 13H21C21.5523 13 22 13.4477 22 14C22 14.5523 21.5523 15 21 15H3C2.44772 15 2 14.5523 2 14C2 13.4477 2.44772 13 3 13Z" />
  </svg>
);

// Generate a random visitor ID if not present
const getVisitorId = () => {
  let vid = localStorage.getItem("ipl_visitor_id");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem("ipl_visitor_id", vid);
  }
  return vid;
};

function FanbaseWidget({ triggerUpdate }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    http.get("/fans/standings").then((res) => {
      setStandings(res.data);
      setLoading(false);
    });
  }, [triggerUpdate]);

  const buttonStyle = {
    background: "rgba(15,15,15,0.85)", 
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)", 
    borderRadius: 24,
    padding: "10px 20px", 
    color: "#fff", 
    cursor: "pointer",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)", 
    fontWeight: "bold",
    display: "flex", 
    alignItems: "center", 
    gap: 8,
    width: "fit-content",
    transition: "all 0.2s"
  };

  if (loading || standings.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
      {!isOpen && (
        <>
          <Link to="/do-you-know" style={{ textDecoration: "none" }}>
            <button 
              style={{ ...buttonStyle, animation: "slideInUp 0.8s ease-out" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(15,15,15,0.85)"}
            >
              💡 Do You Know?
            </button>
          </Link>
          <Link to="/quiz" style={{ textDecoration: "none" }}>
            <button 
              style={{ ...buttonStyle, animation: "slideInUp 0.7s ease-out" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(15,15,15,0.85)"}
            >
              🧠 IPL Quiz
            </button>
          </Link>
          <button 
            onClick={() => setIsOpen(true)}
            style={{ ...buttonStyle, animation: "slideInUp 0.6s ease-out" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(15,15,15,0.85)"}
          >
            🔥 Fans Stand
          </button>
        </>
      )}
      
      {isOpen && (
        <div style={{
          width: 280,
          background: "rgba(15,15,15,0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          animation: "slideInUp 0.3s ease-out"
        }}>
          <h4 style={{ margin: "0 0 12px", color: "#fff", fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🔥 Fanbase Standings</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "300px", overflowY: "auto", paddingRight: 4 }}>
            {standings.map((t, idx) => {
              const color = getTeamColor(t.short_name);
              return (
                <div key={t.team_id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: 8,
                  borderLeft: `3px solid ${color}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#888", fontSize: 12, fontWeight: 700, width: 14 }}>{idx + 1}.</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{t.short_name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#ccc", fontSize: 12, fontWeight: 600 }}>{t.fan_count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


function FavoriteTeamModal({ onComplete }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    http.get("/teams").then(r => setTeams(r.data));
  }, []);

  const selectTeam = async (teamId) => {
    setLoading(true);
    const vid = getVisitorId();
    try {
      await http.post("/fans/vote", { visitor_id: vid, team_id: teamId });
      localStorage.setItem("ipl_favorite_team", teamId);
      
      const res = await http.get("/fans/standings");
      setStandings(res.data);
      setShowResults(true);
      
      setTimeout(() => {
        onComplete();
      }, 4000); // Wait 4 seconds then complete
    } catch (err) {
      console.error("Vote failed", err);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: "#111", border: "1px solid #333", borderRadius: 24,
        padding: "40px 30px", maxWidth: 500, width: "100%",
        textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        animation: "fadeIn 0.4s ease-out"
      }}>
        {!showResults ? (
          <>
            <h2 style={{ color: "#fff", margin: "0 0 10px", fontSize: 24 }}>What is your favorite team?</h2>
            <p style={{ color: "#888", marginBottom: 30, fontSize: 14 }}>Join the fanbase and push your team up the leaderboard!</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {teams.map(t => {
                const color = getTeamColor(t.short_name);
                return (
                  <button
                    key={t.team_id}
                    disabled={loading}
                    onClick={() => selectTeam(t.team_id)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${color}44`,
                      borderRadius: 12, padding: "14px",
                      color: "#fff", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = `${color}44`; }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 900, color }}>{t.short_name}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{t.team_name}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <h2 style={{ color: "#fff", margin: "0 0 20px", fontSize: 24 }}>Live Fan Standings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
              {standings.map((t, idx) => {
                const color = getTeamColor(t.short_name);
                return (
                  <div key={t.team_id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: 8,
                    borderLeft: `3px solid ${color}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#888", fontSize: 12, fontWeight: 700, width: 14 }}>{idx + 1}.</span>
                      <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.short_name}</span>
                    </div>
                    <div style={{ color: "#ccc", fontSize: 14, fontWeight: 600 }}>{t.fan_count}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ color: "#888", marginTop: 24, fontSize: 12 }}>Closing in a few seconds...</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function Navbar() {
  return (
    <nav style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "14px 24px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 700, textDecoration: "none", fontSize: 18 }}>🏏 IPL</Link>
      {/* Matches link, Stats link, Team Stats link, Points link */}
      {[["Matches", "/matches"], ["Stats", "/stats"], ["Team Stats", "/team-stats"], ["Points", "/points"]].map(([l, h]) => (
        <Link key={l} to={h} style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>{l}</Link>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <Link to="/admin" style={{ color: "#555", textDecoration: "none", fontSize: 12 }}>Admin</Link>
      </div>
    </nav>
  );
}

function MatchCard({ match }) {
  const statusColors = { live: "#639922", scheduled: "#378ADD", completed: "#888" };
  return (
    <Link to={`/matches/${match.match_id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12,
        padding: "16px 20px", marginBottom: 12, display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, cursor: "pointer"
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
            {match.team1_short} vs {match.team2_short}
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            {new Date(match.match_date).toDateString()} · {match.venue}
          </div>
          {match.result_text && (
            <div style={{ color: "#639922", fontSize: 13, marginTop: 4 }}>{match.result_text}</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: (statusColors[match.status] || "#888") + "22",
            color: statusColors[match.status] || "#888"
          }}>
            {match.status === "live" ? "🔴 LIVE" : match.status.toUpperCase()}
          </span>
          <span style={{ color: "#555", fontSize: 14 }}>→</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Single top-performer card ── */
function TopCard({ icon, title, accentColor, player, statKey, statLabel, statSuffix = "" }) {
  if (!player) {
    return (
      <div style={{
        flex: 1, minWidth: 220,
        background: "#111", border: `1px solid #1f1f1f`,
        borderRadius: 16, padding: "22px 20px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        <div style={{ fontSize: 30 }}>{icon}</div>
        <div style={{ color: "#666", fontSize: 12 }}>{title}</div>
        <div style={{ color: "#333", fontSize: 13 }}>No data yet</div>
      </div>
    );
  }

  const tc = getTeamColor(player.short_name);

  return (
    <Link to="/stats" style={{ textDecoration: "none", flex: 1, minWidth: 220 }}>
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, #111 60%)`,
        border: `1px solid ${accentColor}44`,
        borderRadius: 16, padding: "22px 20px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 8, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative", overflow: "hidden",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${accentColor}33`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {/* Top glow strip */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

        {/* Icon + title */}
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div style={{ color: accentColor, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{title}</div>

        {/* Big stat */}
        <div style={{ fontSize: 44, fontWeight: 900, color: accentColor, lineHeight: 1, margin: "4px 0" }}>
          {player[statKey]}<span style={{ fontSize: 18, fontWeight: 600, color: accentColor + "aa" }}>{statSuffix}</span>
        </div>
        <div style={{ color: "#888", fontSize: 10, fontWeight: 600, letterSpacing: 0.5, marginTop: -4 }}>{statLabel}</div>

        {/* Divider */}
        <div style={{ width: "80%", height: 1, background: "#1f1f1f", margin: "4px 0" }} />

        {/* Player name + team badge */}
        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", textAlign: "center" }}>{player.player_name}</div>
        <span style={{
          background: `${tc}22`, border: `1px solid ${tc}55`,
          color: tc, fontSize: 11, fontWeight: 700,
          padding: "2px 10px", borderRadius: 20,
        }}>
          {player.short_name}
        </span>
      </div>
    </Link>
  );
}

export default function UserHomePage() {
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [orangeCap, setOrangeCap] = useState(null);
  const [purpleCap, setPurpleCap] = useState(null);
  const [mostSixes, setMostSixes] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [fanbaseUpdate, setFanbaseUpdate] = useState(0);

  useEffect(() => {
    http.get("/matches?status=live").then((r) => setLive(r.data));
    http.get("/matches?status=scheduled").then((r) => setUpcoming(r.data.slice(0, 3)));
    http.get("/matches?status=completed").then((r) => setRecent(r.data.slice(0, 2)));

    Promise.all([
      http.get("/stats/orange-cap"),
      http.get("/stats/purple-cap"),
      http.get("/stats/most-sixes"),
    ]).then(([oc, pc, sx]) => {
      setOrangeCap(oc.data?.[0] || null);
      setPurpleCap(pc.data?.[0] || null);
      setMostSixes(sx.data?.[0] || null);
    }).finally(() => setStatsLoading(false));

    // Check favorite team logic
    const fav = localStorage.getItem("ipl_favorite_team");
    if (!fav) {
      setShowModal(true);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      {showModal && <FavoriteTeamModal onComplete={() => { setShowModal(false); setFanbaseUpdate(prev => prev + 1); }} />}
      <FanbaseWidget triggerUpdate={fanbaseUpdate} />
      <Navbar />

      {/* Hero section */}
      <div style={{
        position: "relative", textAlign: "center",
        padding: "90px 16px 70px",
        backgroundImage: "url('/ipl_hero_bg.png')",
        backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(10,10,10,0.85) 70%, #0a0a0a 100%)",
          zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>

          <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 10px", textShadow: "0 2px 20px rgba(0,0,0,0.9)", letterSpacing: "-0.5px" }}>
            TATA IPL 2026
          </h1>
          <p style={{ color: "#ccc", fontSize: 16, marginBottom: 32, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            Live scores · Stats · Points Table
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/matches" style={{ padding: "13px 28px", borderRadius: 10, background: "#d85a30", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 20px rgba(216,90,48,0.45)" }}>View All Matches</Link>
            <Link to="/stats" style={{ padding: "13px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>Player Stats</Link>
            <Link to="/team-stats" style={{ padding: "13px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>Team Stats</Link>
            <Link to="/points" style={{ padding: "13px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>Points Table</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 16px" }}>
        
        {/* Daily Moment Snippet */}
        <DailyMomentSnippet />

        {/* ── Top Performers Widget ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 4, height: 22, background: "#d85a30", borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 18 }}>🏅 Season Leaders</h2>
            <span style={{ color: "#555", fontSize: 12, marginLeft: "auto" }}>TATA IPL 2026</span>
          </div>

          {statsLoading ? (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, minWidth: 220, height: 200, background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <TopCard
                icon={<CapIcon color="#d85a30" size={32} />}
                title="Orange Cap"
                accentColor="#d85a30"
                player={orangeCap}
                statKey="total_runs"
                statLabel="RUNS"
              />
              <TopCard
                icon={<CapIcon color="#7F77DD" size={32} />}
                title="Purple Cap"
                accentColor="#7F77DD"
                player={purpleCap}
                statKey="total_wickets"
                statLabel="WICKETS"
              />
              <TopCard
                icon="💥"
                title="Most Sixes"
                accentColor="#22c55e"
                player={mostSixes}
                statKey="total_sixes"
                statLabel="SIXES"
              />
            </div>
          )}
        </div>

        {/* Live matches */}
        {live.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, background: "#639922", borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18 }}>🟢 Live Now</h2>
            </div>
            {live.map((m) => <MatchCard key={m.match_id} match={m} />)}
          </div>
        )}

        {/* Recently Completed matches */}
        {recent.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, background: "#888", borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18 }}>🏁 Recently Completed</h2>
            </div>
            {recent.map((m) => (
              <div key={m.match_id}>
                <MatchCard match={m} />
              </div>
            ))}
          </div>
        )}

        {/* Upcoming matches */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 22, background: "#378ADD", borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 18 }}>📅 Upcoming Matches</h2>
          </div>
          {upcoming.length === 0
            ? <p style={{ color: "#555" }}>No upcoming matches scheduled.</p>
            : upcoming.map((m) => (
                <div key={m.match_id}>
                  <MatchCard match={m} />
                  <MatchPrediction match={m} />
                </div>
              ))}
          <Link to="/matches" style={{ color: "#d85a30", fontSize: 14, textDecoration: "none" }}>View all matches →</Link>
        </div>
      </div>
    </div>
  );
}