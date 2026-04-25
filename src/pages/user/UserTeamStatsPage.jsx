import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import TeamStatsCharts from "../../components/TeamStatsCharts";
import TeamCompare from "../../components/TeamCompare";
import { ChartBar, ArrowLeftRight } from "lucide-react";

const TABS = [
  { key: "charts", label: "Team Performance", icon: ChartBar },
  { key: "compare", label: "Compare Teams", icon: ArrowLeftRight },
];

export default function UserTeamStatsPage() {
  const [tab, setTab] = useState("charts");
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "charts") {
      setLoading(true);
      http.get("/stats/team-stats").then((r) => {
        setTeamsData(r.data);
        setLoading(false);
      });
    }
  }, [tab]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Navbar />
      
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>Team Stats</h1>
          <p style={{ color: "#666", fontSize: "16px" }}>Comprehensive graphical analysis of TATA IPL 2026 teams</p>
        </div>

        {/* Tab bar */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "40px", 
          background: "#111", 
          padding: "6px", 
          borderRadius: "16px",
          width: "fit-content",
          border: "1px solid #1f1f1f"
        }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)} 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px", 
                  borderRadius: "12px", 
                  border: "none", 
                  cursor: "pointer", 
                  fontSize: "14px", 
                  fontWeight: 700,
                  transition: "all 0.2s",
                  background: active ? "#d85a30" : "transparent",
                  color: active ? "#fff" : "#666",
                  boxShadow: active ? "0 4px 12px rgba(216,90,48,0.3)" : "none"
                }}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid #d85a30", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <p style={{ color: "#555", marginTop: "16px" }}>Fetching latest statistics...</p>
          </div>
        )}

        <div style={{ display: loading ? "none" : "block" }}>
          {tab === "charts" && <TeamStatsCharts teamsData={teamsData} />}
          {tab === "compare" && <TeamCompare />}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Navbar() {
  return (
    <nav style={{ 
      background: "rgba(10,10,10,0.8)", 
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1a1a1a", 
      padding: "16px 24px", 
      display: "flex", 
      gap: 32, 
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ color: "#d85a30", fontWeight: 900, textDecoration: "none", fontSize: 20, letterSpacing: "-0.5px" }}>🏏 IPL</Link>
      <div style={{ display: "flex", gap: 24 }}>
        {[["Matches", "/matches"], ["Stats", "/stats"], ["Team Stats", "/team-stats"], ["Points", "/points"]].map(([l, h]) => (
          <Link 
            key={l} 
            to={h} 
            style={{ 
              color: h === "/team-stats" ? "#fff" : "#666", 
              textDecoration: "none", 
              fontSize: 14, 
              fontWeight: 600,
              transition: "color 0.2s"
            }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = h === "/team-stats" ? "#fff" : "#666"}
          >
            {l}
          </Link>
        ))}
      </div>
    </nav>
  );
}
