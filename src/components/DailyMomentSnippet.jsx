import { Link } from "react-router-dom";
import momentsData from "../data/momentsData.json";

export default function DailyMomentSnippet() {
  // Get the most recent date
  const dates = Object.keys(momentsData).sort((a, b) => new Date(b) - new Date(a));
  if (dates.length === 0) return null;

  const latestDate = dates[0];
  const moment = momentsData[latestDate][0]; // Take the first moment of the latest date

  return (
    <div style={{
      marginBottom: 40,
      animation: "fadeInUp 0.6s ease-out"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 22, background: "#ff8c00", borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 18 }}>💡 Did You Know?</h2>
      </div>

      <Link to="/do-you-know" style={{ textDecoration: "none" }}>
        <div style={{
          background: "linear-gradient(145deg, #1a1a1a, #0f0f0f)",
          border: "1px solid #2a2a2a",
          borderRadius: 20,
          padding: "20px 24px",
          display: "flex",
          gap: 20,
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = "#ff8c0066";
          e.currentTarget.style.boxShadow = "0 15px 40px rgba(255,140,0,0.15)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "#2a2a2a";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        }}
        >
          {moment.image && (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              overflow: "hidden",
              flexShrink: 0,
              background: "#222"
            }}>
              <img 
                src={moment.image} 
                alt={moment.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#ff8c00", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Moment of the Day · {new Date(latestDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#fff", fontWeight: 800 }}>{moment.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#aaa", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {moment.text}
            </p>
          </div>
          <div style={{ color: "#444", fontSize: 24, fontWeight: 900 }}>→</div>
        </div>
      </Link>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
