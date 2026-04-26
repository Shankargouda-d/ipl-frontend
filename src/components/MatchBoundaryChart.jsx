// src/components/MatchBoundaryChart.jsx
import { getTeamColor } from "../utils/teamColors";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PLAYER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
  "#D4A5A5", "#9B59B6", "#3498DB", "#E67E22", "#2ECC71",
  "#F1C40F", "#1ABC9C", "#E74C3C", "#34495E", "#7F8C8D",
  "#F39C12", "#8E44AD", "#16A085", "#27AE60", "#D35400"
];

const renderRunsLabel = (props) => {
  const { cx, cy, midAngle, outerRadius, name, value, fill } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  // Shorten name (e.g., Virat Kohli -> V. Kohli)
  const parts = name.split(' ');
  const shortName = parts.length > 1 
    ? `${parts[0][0]}. ${parts.slice(1).join(' ')}`
    : name;

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#ddd" fontSize={11} fontWeight={600} dominantBaseline="central">
        {shortName} <tspan fill="#888">({value})</tspan>
      </text>
    </g>
  );
};

/* ── Donut Pie ── */
function DonutPie({ data, size = 180 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 10;
  const ri = R * 0.5;

  if (total === 0) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={R} fill="#1a1a1a" />
      <circle cx={cx} cy={cy} r={ri} fill="#0d0d0d" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={13}>No Data</text>
    </svg>
  );

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const lg = angle > Math.PI ? 1 : 0;
    const ox1 = cx + R * Math.cos(startAngle), oy1 = cy + R * Math.sin(startAngle);
    const ox2 = cx + R * Math.cos(endAngle),   oy2 = cy + R * Math.sin(endAngle);
    const ix1 = cx + ri * Math.cos(endAngle),  iy1 = cy + ri * Math.sin(endAngle);
    const ix2 = cx + ri * Math.cos(startAngle), iy2 = cy + ri * Math.sin(startAngle);
    const path = `M${ox1} ${oy1} A${R} ${R} 0 ${lg} 1 ${ox2} ${oy2} L${ix1} ${iy1} A${ri} ${ri} 0 ${lg} 0 ${ix2} ${iy2} Z`;
    const mid = startAngle + angle / 2;
    const lx = cx + R * 0.74 * Math.cos(mid);
    const ly = cy + R * 0.74 * Math.sin(mid);
    const pct = Math.round((d.value / total) * 100);
    startAngle = endAngle;
    return { path, color: d.color, short: d.short, pct, lx, ly };
  });

  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} stroke="#0a0a0a" strokeWidth={2.5} />
          {s.pct >= 12 && (
            <>
              <text x={s.lx} y={s.ly - 7} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10} fontWeight={700}>{s.short}</text>
              <text x={s.lx} y={s.ly + 6} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10}>{s.pct}%</text>
            </>
          )}
        </g>
      ))}
      {/* Center */}
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={22} fontWeight={800}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={10}>Total</text>
    </svg>
  );
}

/* ── Horizontal Bar ── */
function HBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ width: "100%" }}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                <span style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>{d.label}</span>
                <span style={{ background: d.color + "22", color: d.color, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{d.short}</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{d.value}</span>
            </div>
            <div style={{ height: 10, background: "#1a1a1a", borderRadius: 5, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 5,
                background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MatchBoundaryChart({ innings, batting, match }) {
  if (!match || match.status !== "completed") return null;
  if (!innings || innings.length < 1) return null;

  const shortNameMap = {
    [String(match.team1_id)]: match.team1_short || match.team1_name || "T1",
    [String(match.team2_id)]: match.team2_short || match.team2_name || "T2",
  };

  const innData = innings.map((inn, idx) => {
    const rows = batting[inn.innings_id] || [];
    const fours = rows.reduce((s, b) => s + (parseInt(b.fours, 10) || 0), 0);
    const sixes = rows.reduce((s, b) => s + (parseInt(b.sixes, 10) || 0), 0);
    const short = shortNameMap[String(inn.batting_team_id)] || "Team";
    const fullName = inn.battingteamname || short;
    const color = getTeamColor(fullName || short, idx);
    return { team: fullName, short, fours, sixes, color };
  });

  const stats = [
    { key: "fours", label: "Fours (4s)", emoji: "🔷", icon: "4️⃣" },
    { key: "sixes", label: "Sixes (6s)", emoji: "💥", icon: "6️⃣" },
  ];

  const totalFours = innData.reduce((s, d) => s + d.fours, 0);
  const totalSixes = innData.reduce((s, d) => s + d.sixes, 0);

  return (
    <div style={{
      marginTop: 48, padding: "32px 24px",
      background: "linear-gradient(135deg, #0d0d0d 0%, #111 100%)",
      borderRadius: 16, border: "1px solid #1f1f1f",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#fff", letterSpacing: 0.5 }}>🏏 Boundary Analysis</h2>
        <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>
          Total Boundaries: <strong style={{ color: "#d85a30" }}>{totalFours + totalSixes}</strong>
          &nbsp;·&nbsp;4s: <strong style={{ color: "#378ADD" }}>{totalFours}</strong>
          &nbsp;·&nbsp;6s: <strong style={{ color: "#22c55e" }}>{totalSixes}</strong>
        </p>
      </div>

      {/* Charts grid */}
      {stats.map(({ key, label, emoji }) => {
        const chartData = innData.map((d) => ({
          label: d.team,
          short: d.short,
          value: d[key],
          color: d.color,
        }));
        const total = chartData.reduce((s, d) => s + d.value, 0);

        return (
          <div key={key} style={{
            background: "#0a0a0a", borderRadius: 14, border: "1px solid #1a1a1a",
            padding: "24px 28px", marginBottom: 20,
          }}>
            {/* Section header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                {emoji} {label}
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#888" }}>
                Total: <strong style={{ color: "#fff" }}>{total}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
              {/* Donut pie */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <DonutPie data={chartData} size={170} />
                {/* Legend */}
                <div style={{ display: "flex", gap: 16 }}>
                  {chartData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                      <span style={{ color: d.color, fontSize: 11, fontWeight: 700 }}>{d.short}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical divider */}
              <div style={{ width: 1, background: "#1f1f1f", alignSelf: "stretch", minHeight: 120 }} />

              {/* Horizontal bar chart */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
                  Breakdown
                </div>
                <HBarChart data={chartData} />

                {/* Percentage bar */}
                {total > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 6 }}>Share</div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      {chartData.map((d, i) => {
                        const pct = Math.round((d.value / total) * 100);
                        return (
                          <div key={i} style={{
                            width: `${pct}%`, height: "100%",
                            background: `linear-gradient(90deg, ${d.color}99, ${d.color})`,
                            borderRadius: i === 0 ? "4px 0 0 4px" : "0 4px 4px 0",
                          }} />
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {chartData.map((d, i) => {
                        const pct = Math.round((d.value / total) * 100);
                        return (
                          <span key={i} style={{ fontSize: 11, color: d.color, fontWeight: 700 }}>{pct}%</span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Player Runs Contribution Charts */}
      <div style={{ textAlign: "center", marginBottom: 32, marginTop: 48 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#fff", letterSpacing: 0.5 }}>📊 Player Runs Contribution</h2>
        <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>
          Individual runs scored by players in each innings
        </p>
      </div>
      
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {innings.map((inn, idx) => {
          const rows = batting[inn.innings_id] || [];
          const chartData = rows
            .filter(b => parseInt(b.runs, 10) > 0)
            .map(b => ({
              name: b.player_name,
              value: parseInt(b.runs, 10)
            }));
            
          const short = shortNameMap[String(inn.batting_team_id)] || "Team";
          const fullName = inn.battingteamname || short;
          const teamColor = getTeamColor(fullName || short, idx);
          const totalRuns = chartData.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={inn.innings_id} style={{
              background: "#0a0a0a", borderRadius: 14, border: "1px solid #1a1a1a",
              padding: "24px", flex: "1 1 400px", minWidth: 300, display: "flex", flexDirection: "column", alignItems: "center"
            }}>
               <div style={{ fontSize: 16, fontWeight: 700, color: teamColor, marginBottom: 4 }}>
                 {fullName} Innings
               </div>
               <div style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>
                 Total Batter Runs: <strong style={{ color: "#fff" }}>{totalRuns}</strong>
               </div>
               
               {chartData.length > 0 ? (
                 <div style={{ width: "100%", height: 350, position: "relative" }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={chartData}
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={100}
                         dataKey="value"
                         stroke="#0a0a0a"
                         strokeWidth={2}
                         label={renderRunsLabel}
                         labelLine={false}
                         isAnimationActive={true}
                       >
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={PLAYER_COLORS[index % PLAYER_COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff" }}
                         itemStyle={{ color: "#fff", fontWeight: 700 }}
                         formatter={(value) => [`${value} runs`, "Runs"]}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                   <div style={{ 
                     position: "absolute", top: "50%", left: "50%", 
                     transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" 
                   }}>
                     <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{totalRuns}</div>
                     <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Runs</div>
                   </div>
                 </div>
               ) : (
                 <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
                   No runs data available
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
