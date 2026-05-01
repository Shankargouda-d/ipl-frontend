import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import quizData from "../../data/quizData.json";

export default function QuizPage() {
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [pointsChange, setPointsChange] = useState(null); // { amount: 10, type: 'plus' }

  // Initialize points and attempts from localStorage
  useEffect(() => {
    const savedPoints = localStorage.getItem("ipl_quiz_points");
    if (savedPoints) setTotalPoints(parseInt(savedPoints, 10));

    const savedAttempts = localStorage.getItem("ipl_quiz_attempts");
    if (savedAttempts) setAttempts(JSON.parse(savedAttempts));
  }, []);

  const handleAnswer = (date, questionId, selectedOption, correctAnswer) => {
    if (attempts[questionId]) return; // Already answered

    const isCorrect = selectedOption === correctAnswer;
    const pointsDelta = isCorrect ? 10 : -2;

    // Update state
    const newPoints = totalPoints + pointsDelta;
    const newAttempts = { 
      ...attempts, 
      [questionId]: { selectedOption, isCorrect } 
    };

    setTotalPoints(newPoints);
    setAttempts(newAttempts);
    setPointsChange({ amount: pointsDelta, type: isCorrect ? 'plus' : 'minus' });

    // Save to localStorage
    localStorage.setItem("ipl_quiz_points", newPoints.toString());
    localStorage.setItem("ipl_quiz_attempts", JSON.stringify(newAttempts));

    // Clear points change indicator after animation
    setTimeout(() => setPointsChange(null), 2000);
  };

  const dates = Object.keys(quizData).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0a0a", 
      color: "#fff", 
      padding: "80px 20px 40px",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Left Corner Points */}
      <div style={{
        position: "fixed",
        top: 24,
        left: 24,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        zIndex: 100
      }}>
        <div style={{
          background: "rgba(15,15,15,0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <span style={{ fontSize: 20 }}>💰</span>
          <div>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Total Points</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#d85a30" }}>{totalPoints}</div>
          </div>
        </div>
        
        {pointsChange && (
          <div style={{
            alignSelf: "flex-end",
            fontSize: 18,
            fontWeight: 800,
            color: pointsChange.type === 'plus' ? '#639922' : '#ff4444',
            animation: "slideFadeUp 1.5s ease-out forwards",
            textShadow: `0 0 10px ${pointsChange.type === 'plus' ? '#639922' : '#ff4444'}88`
          }}>
            {pointsChange.type === 'plus' ? `+${pointsChange.amount}` : pointsChange.amount}
          </div>
        )}
      </div>

      <button 
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "10px 20px",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 100
        }}
      >
        ← Home
      </button>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 10px", background: "linear-gradient(to right, #fff, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IPL Quiz</h1>
          <p style={{ color: "#888" }}>Answer daily questions and earn points! Correct (+10), Wrong (-2)</p>
        </div>

        {dates.map(date => (
          <div key={date} style={{ marginBottom: 80 }}>
            {/* Date in Middle */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 40
            }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #222)" }} />
              <div style={{
                background: "#1a1a1a",
                padding: "8px 24px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 700,
                color: "#d85a30",
                border: "1px solid #333",
                letterSpacing: 1
              }}>
                {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #222)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {quizData[date].map((q, idx) => {
                const attempt = attempts[q.id];
                return (
                  <div key={q.id} style={{
                    background: "#111",
                    borderRadius: 24,
                    padding: "32px",
                    border: "1px solid #222",
                    boxShadow: attempt 
                      ? (attempt.isCorrect 
                        ? "0 0 40px rgba(99,153,34,0.1)" 
                        : "0 0 40px rgba(255,68,68,0.1)") 
                      : "none",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#d85a30" }}>{idx + 1}.</span>
                      <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.4 }}>{q.question}</h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {q.options.map(option => {
                        const isSelected = attempt?.selectedOption === option;
                        const isCorrectOption = option === q.answer;
                        
                        let borderColor = "#333";
                        let background = "rgba(255,255,255,0.03)";
                        let glow = "none";

                        if (attempt) {
                          if (isCorrectOption) {
                            borderColor = "#639922";
                            background = "rgba(99,153,34,0.1)";
                            if (isSelected) glow = "0 0 20px rgba(99,153,34,0.4)";
                          } else if (isSelected) {
                            borderColor = "#ff4444";
                            background = "rgba(255,68,68,0.1)";
                            glow = "0 0 20px rgba(255,68,68,0.4)";
                          }
                        }

                        return (
                          <button
                            key={option}
                            disabled={!!attempt}
                            onClick={() => handleAnswer(date, q.id, option, q.answer)}
                            style={{
                              padding: "16px 20px",
                              borderRadius: 16,
                              border: `1px solid ${borderColor}`,
                              background: background,
                              color: attempt ? (isCorrectOption ? "#fff" : (isSelected ? "#fff" : "#666")) : "#fff",
                              cursor: attempt ? "default" : "pointer",
                              fontSize: 15,
                              fontWeight: 600,
                              textAlign: "left",
                              transition: "all 0.2s",
                              boxShadow: glow
                            }}
                            onMouseEnter={e => {
                              if (!attempt) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.borderColor = "#d85a30";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!attempt) {
                                e.currentTarget.style.background = background;
                                e.currentTarget.style.borderColor = borderColor;
                              }
                            }}
                          >
                            {option}
                            {attempt && isCorrectOption && <span style={{ float: "right" }}>✅</span>}
                            {attempt && isSelected && !attempt.isCorrect && <span style={{ float: "right" }}>❌</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideFadeUp {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
