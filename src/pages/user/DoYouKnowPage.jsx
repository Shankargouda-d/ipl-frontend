import { useNavigate } from "react-router-dom";
import momentsData from "../../data/momentsData.json";

export default function DoYouKnowPage() {
  const navigate = useNavigate();

  // Sort dates descending (latest first)
  const sortedDates = Object.keys(momentsData).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0a0a", 
      color: "#fff", 
      padding: "100px 20px 60px",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(20px)",
        zIndex: 100,
        padding: "20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <button 
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            left: 24,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "8px 16px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          ← Home
        </button>
        <h1 style={{ 
          fontSize: 24, 
          fontWeight: 900, 
          margin: 0,
          background: "linear-gradient(45deg, #d85a30, #ff8c00)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          💡 IPL Chronicles
        </h1>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Did You Know?</h2>
          <p style={{ color: "#666", fontSize: 16 }}>Relive the historic moments and hidden facts of the TATA IPL.</p>
        </div>

        {sortedDates.map(date => (
          <div key={date} style={{ marginBottom: 60 }}>
            {/* Date Badge */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 16, 
              marginBottom: 32 
            }}>
              <div style={{ 
                background: "rgba(216,90,48,0.1)", 
                color: "#d85a30",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1,
                border: "1px solid rgba(216,90,48,0.2)"
              }}>
                {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              {momentsData[date].map((moment, index) => (
                <div key={moment.id} style={{
                  background: "linear-gradient(145deg, #161616, #0f0f0f)",
                  borderRadius: 24,
                  border: "1px solid #222",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: window.innerWidth < 600 ? "column" : "row",
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                }}>
                  {moment.image && (
                    <div style={{ 
                      width: window.innerWidth < 600 ? "100%" : "300px", 
                      height: window.innerWidth < 600 ? "200px" : "auto",
                      background: "#1a1a1a",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <img 
                        src={moment.image} 
                        alt={moment.title}
                        onError={(e) => { e.target.style.display = 'none'; }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      {/* Overlay for image depth */}
                      <div style={{ 
                        position: "absolute", 
                        inset: 0, 
                        background: "linear-gradient(to right, transparent, rgba(15,15,15,0.5))" 
                      }} />
                    </div>
                  )}

                  <div style={{ padding: 32, flex: 1 }}>
                    <h3 style={{ 
                      fontSize: 22, 
                      fontWeight: 800, 
                      marginBottom: 16, 
                      color: "#fff" 
                    }}>
                      {moment.title}
                    </h3>
                    <p style={{ 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      color: "#aaa",
                      margin: 0
                    }}>
                      {moment.text}
                    </p>
                    
                    <div style={{ 
                      marginTop: 24, 
                      display: "flex", 
                      gap: 8,
                      flexWrap: "wrap"
                    }}>
                      <span style={{ 
                        fontSize: 10, 
                        background: "#222", 
                        padding: "4px 10px", 
                        borderRadius: 6, 
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1
                      }}>
                        #IPLHistory
                      </span>
                      <span style={{ 
                        fontSize: 10, 
                        background: "#222", 
                        padding: "4px 10px", 
                        borderRadius: 6, 
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1
                      }}>
                        #DailyMoments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
