import { useNavigate } from "react-router-dom";

export default function QuizPage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0a0a", 
      color: "#fff", 
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <button 
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "10px 20px",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      >
        ← Back
      </button>
      
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>🧠 IPL Quiz</h1>
      <p style={{ color: "#888", fontSize: 16 }}>Coming soon...</p>
    </div>
  );
}
