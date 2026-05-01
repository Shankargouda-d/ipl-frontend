import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { getVisitorId } from "../../utils/visitorId";
import quizData from "../../data/quizData.json";

export default function QuizPage() {
  const navigate = useNavigate();
  const visitorId = getVisitorId();

  const [userStats, setUserStats] = useState({ nickname: null, total_points: 0, rank: null });
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals state
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Data for modals
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [pointsChange, setPointsChange] = useState(null);

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, attemptsRes] = await Promise.all([
        http.get(`/quiz/stats/${visitorId}`),
        http.get(`/quiz/attempts/${visitorId}`)
      ]);
      
      setUserStats(statsRes.data);
      setAttempts(attemptsRes.data);
      
      // If nickname is null, show nickname modal
      if (!statsRes.data.nickname) {
        setShowNicknameModal(true);
      }
    } catch (err) {
      console.error("Failed to load quiz data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, selectedOption, correctAnswer) => {
    if (attempts[questionId] || submitting) return;

    setSubmitting(true);
    const isCorrect = selectedOption === correctAnswer;
    const pointsDelta = isCorrect ? 10 : -2;

    try {
      await http.post("/quiz/attempt", {
        visitor_id: visitorId,
        question_id: questionId,
        is_correct: isCorrect,
        points_earned: pointsDelta
      });

      // Update local state
      setAttempts(prev => ({ ...prev, [questionId]: { isCorrect } }));
      setUserStats(prev => ({ ...prev, total_points: prev.total_points + pointsDelta }));
      setPointsChange({ amount: pointsDelta, type: isCorrect ? 'plus' : 'minus' });
      
      // Refresh rank
      const statsRes = await http.get(`/quiz/stats/${visitorId}`);
      setUserStats(statsRes.data);

      setTimeout(() => setPointsChange(null), 2000);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetNickname = async (nickname) => {
    if (!nickname.trim()) return;
    try {
      await http.post("/quiz/nickname", { visitor_id: visitorId, nickname });
      setUserStats(prev => ({ ...prev, nickname }));
      setShowNicknameModal(false);
    } catch (err) {
      console.error("Failed to set nickname:", err);
    }
  };

  const openLeaderboard = async () => {
    setShowLeaderboardModal(true);
    try {
      const res = await http.get("/quiz/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  };

  const openHistory = async () => {
    setShowHistoryModal(true);
    try {
      const res = await http.get(`/quiz/history/${visitorId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const dates = Object.keys(quizData).sort((a, b) => new Date(b) - new Date(a));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>🧠 Loading Quiz...</div>
          <div style={{ color: "#555" }}>Connecting to backend</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: "80px 20px 40px", fontFamily: "'Inter', sans-serif" }}>
      {/* Top UI Bar */}
      <div style={{ position: "fixed", top: 24, left: 24, display: "flex", flexDirection: "column", gap: 12, zIndex: 100 }}>
        {/* Points Display */}
        <div 
          onClick={openHistory}
          style={{
            background: "rgba(15,15,15,0.85)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
            padding: "12px 24px", display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)", cursor: "pointer", transition: "transform 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 24 }}>💰</span>
          <div>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Total Points</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#d85a30" }}>{userStats.total_points}</div>
          </div>
        </div>

        {/* Leaderboard Button */}
        <button 
          onClick={openLeaderboard}
          style={{
            background: "rgba(216,90,48,0.1)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(216,90,48,0.3)", borderRadius: 16,
            padding: "10px 18px", color: "#d85a30", fontSize: 13, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(216,90,48,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(216,90,48,0.1)"}
        >
          🏆 Leaderboard {userStats.rank && <span style={{ color: "#fff", opacity: 0.6 }}>#{userStats.rank}</span>}
        </button>

        {pointsChange && (
          <div style={{
            alignSelf: "flex-start", fontSize: 20, fontWeight: 900,
            color: pointsChange.type === 'plus' ? '#639922' : '#ff4444',
            animation: "slideFadeUp 1.5s ease-out forwards",
            textShadow: `0 0 10px ${pointsChange.type === 'plus' ? '#639922' : '#ff4444'}88`
          }}>
            {pointsChange.type === 'plus' ? `+${pointsChange.amount}` : pointsChange.amount}
          </div>
        )}
      </div>

      <button onClick={() => navigate("/")} style={{ position: "fixed", top: 24, right: 24, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 20px", color: "#fff", cursor: "pointer", fontWeight: "bold", zIndex: 100 }}>← Home</button>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 10px", background: "linear-gradient(to right, #fff, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IPL Quiz</h1>
          <p style={{ color: "#888" }}>{userStats.nickname ? `Welcome back, ${userStats.nickname}!` : "Answer daily questions and earn points!"}</p>
        </div>

        {dates.map(date => (
          <div key={date} style={{ marginBottom: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #222)" }} />
              <div style={{ background: "#1a1a1a", padding: "8px 24px", borderRadius: 20, fontSize: 14, fontWeight: 700, color: "#d85a30", border: "1px solid #333", letterSpacing: 1 }}>
                {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #222)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {quizData[date].map((q, idx) => {
                const attempt = attempts[q.id];
                return (
                  <div key={q.id} style={{
                    background: "#111", borderRadius: 24, padding: "32px", border: "1px solid #222",
                    boxShadow: attempt ? (attempt.isCorrect ? "0 0 40px rgba(99,153,34,0.1)" : "0 0 40px rgba(255,68,68,0.1)") : "none",
                    transition: "all 0.3s ease", opacity: submitting ? 0.7 : 1
                  }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#d85a30" }}>{idx + 1}.</span>
                      <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.4 }}>{q.question}</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {q.options.map(option => {
                        const isSelected = attempt && (option === q.answer ? attempt.isCorrect : !attempt.isCorrect); // simplified logic for demo
                        const isCorrectOption = option === q.answer;
                        let borderColor = "#333", background = "rgba(255,255,255,0.03)", glow = "none";
                        if (attempt) {
                          if (isCorrectOption) { borderColor = "#639922"; background = "rgba(99,153,34,0.1)"; }
                          else if (isSelected) { borderColor = "#ff4444"; background = "rgba(255,68,68,0.1)"; }
                        }
                        return (
                          <button key={option} disabled={!!attempt || submitting} onClick={() => handleAnswer(q.id, option, q.answer)}
                            style={{ padding: "16px 20px", borderRadius: 16, border: `1px solid ${borderColor}`, background: background, color: attempt ? (isCorrectOption ? "#fff" : "#666") : "#fff", cursor: attempt ? "default" : "pointer", fontSize: 15, fontWeight: 600, textAlign: "left", transition: "all 0.2s", boxShadow: glow }}
                            onMouseEnter={e => { if (!attempt) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "#d85a30"; } }}
                            onMouseLeave={e => { if (!attempt) { e.currentTarget.style.background = background; e.currentTarget.style.borderColor = borderColor; } }}
                          >
                            {option}
                            {attempt && isCorrectOption && <span style={{ float: "right" }}>✅</span>}
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

      {/* --- MODALS --- */}

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1a1a", padding: 40, borderRadius: 24, border: "1px solid #333", maxWidth: 400, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>👋</div>
            <h2 style={{ margin: "0 0 10px" }}>What's your name?</h2>
            <p style={{ color: "#888", marginBottom: 30 }}>Enter a nickname to show on the leaderboard.</p>
            <input id="nicknameInput" type="text" placeholder="Ex: KohliFan_99" style={{ width: "100%", background: "#000", border: "1px solid #333", borderRadius: 12, padding: "14px 16px", color: "#fff", marginBottom: 20, fontSize: 16, textAlign: "center" }} />
            <button onClick={() => handleSetNickname(document.getElementById("nicknameInput").value)} style={{ width: "100%", background: "#d85a30", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: "bold", cursor: "pointer" }}>Save & Continue</button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1a1a", padding: 32, borderRadius: 24, border: "1px solid #333", maxWidth: 450, width: "100%", position: "relative" }}>
            <button onClick={() => setShowLeaderboardModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#888", fontSize: 24, cursor: "pointer" }}>×</button>
            <h2 style={{ margin: "0 0 24px", textAlign: "center" }}>🏆 Top 10 Fans</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leaderboard.length === 0 ? <p style={{ textAlign: "center", color: "#555" }}>Loading leaderboard...</p> : 
                leaderboard.map((user, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: user.nickname === userStats.nickname ? "rgba(216,90,48,0.2)" : "#111", padding: "12px 16px", borderRadius: 12, border: user.nickname === userStats.nickname ? "1px solid #d85a30" : "1px solid #222" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontWeight: 900, color: i < 3 ? "#d85a30" : "#555", width: 20 }}>{i + 1}</span>
                      <span style={{ fontWeight: 600 }}>{user.nickname || "Anonymous"}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: "#d85a30" }}>{user.total_points} pts</span>
                  </div>
                ))
              }
            </div>
            {userStats.rank > 10 && (
              <div style={{ marginTop: 20, textAlign: "center", color: "#888", fontSize: 13 }}>
                You are currently ranked <strong style={{ color: "#fff" }}>#{userStats.rank}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1a1a", padding: 32, borderRadius: 24, border: "1px solid #333", maxWidth: 400, width: "100%", position: "relative" }}>
            <button onClick={() => setShowHistoryModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#888", fontSize: 24, cursor: "pointer" }}>×</button>
            <h2 style={{ margin: "0 0 24px", textAlign: "center" }}>📅 Daily Points</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
              {history.length === 0 ? <p style={{ textAlign: "center", color: "#555" }}>No history yet.</p> : 
                history.map((day, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#111", padding: "14px 18px", borderRadius: 12, border: "1px solid #222" }}>
                    <span style={{ color: "#aaa" }}>{new Date(day.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                    <span style={{ fontWeight: 800, color: day.points >= 0 ? "#639922" : "#ff4444" }}>{day.points > 0 ? `+${day.points}` : day.points} pts</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

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
