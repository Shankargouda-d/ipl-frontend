import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "SSDESAI") {
      sessionStorage.setItem("ipl_admin", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid access code. Try again.");
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0f0f0f"
    }}>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 16, padding: "48px 40px", width: "100%",
        maxWidth: 400, textAlign: "center",
        animation: shake ? "shake 0.5s ease" : "none"
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏏</div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
          IPL Admin Panel
        </h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>
          Enter access code to continue
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="Enter access code"
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10,
              border: error ? "1px solid #e24b4a" : "1px solid #333",
              background: "#111", color: "#fff", fontSize: 16,
              outline: "none", marginBottom: 12, boxSizing: "border-box",
              letterSpacing: "0.2em", textAlign: "center"
            }}
          />
          {error && (
            <p style={{ color: "#e24b4a", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button
            type="submit"
            style={{
              width: "100%", padding: "14px", borderRadius: 10,
              background: "#d85a30", color: "#fff", border: "none",
              fontSize: 16, fontWeight: 600, cursor: "pointer"
            }}
          >
            Enter Admin Panel
          </button>
        </form>
        <p style={{ color: "#444", fontSize: 12, marginTop: 24 }}>
          <a href="/" style={{ color: "#666", textDecoration: "none" }}>
            ← Back to user site
          </a>
        </p>
      </div>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}