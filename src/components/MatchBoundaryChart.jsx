// src/components/MatchBoundaryChart.jsx
import { getTeamColor } from "../utils/teamColors";

function PieChart({ data, size = 180 }) {
    const total = data.reduce((s, d) => s + d.value, 0);

    if (total === 0) {
        return (
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#1a1a1a" />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#555"
                    fontSize={13}
                >
                    No Data
                </text>
            </svg>
        );
    }

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;

    let startAngle = -Math.PI / 2;
    const slices = data.map((d) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const endAngle = startAngle + angle;
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        const midAngle = startAngle + angle / 2;
        // label at 58% of radius from center
        const labelX = cx + r * 0.58 * Math.cos(midAngle);
        const labelY = cy + r * 0.58 * Math.sin(midAngle);
        const pct = Math.round((d.value / total) * 100);
        startAngle = endAngle;
        return { path, color: d.color, short: d.short, pct, labelX, labelY, angle };
    });

    return (
        <svg width={size} height={size}>
            {slices.map((s, i) => (
                <g key={i}>
                    <path d={s.path} fill={s.color} stroke="#0a0a0a" strokeWidth={2} />
                    {/* Only show label if slice is big enough (>= 12%) */}
                    {s.pct >= 12 && (
                        <>
                            {/* Team short name on top line */}
                            <text
                                x={s.labelX}
                                y={s.labelY - 7}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize={11}
                                fontWeight={700}
                            >
                                {s.short}
                            </text>
                            {/* Percentage on bottom line */}
                            <text
                                x={s.labelX}
                                y={s.labelY + 7}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize={11}
                                fontWeight={600}
                            >
                                {s.pct}%
                            </text>
                        </>
                    )}
                </g>
            ))}
        </svg>
    );
}

// Team colours are resolved dynamically from the team name via getTeamColor.

export default function MatchBoundaryChart({ innings, batting, match }) {
    // Show only when match status is 'completed' (DB enum: scheduled/live/completed)
    if (!match || match.status !== "completed") return null;
    if (!innings || innings.length < 1) return null;

    // Build short name lookup: batting_team_id -> short name
    // match has team1_id, team1_short, team2_id, team2_short from API
    const shortNameMap = {
        [String(match.team1_id)]: match.team1_short || match.team1_name || "T1",
        [String(match.team2_id)]: match.team2_short || match.team2_name || "T2",
    };

    // Calculate totals per innings
    const innData = innings.map((inn, idx) => {
        const rows = batting[inn.innings_id] || [];
        const fours = rows.reduce((s, b) => s + (parseInt(b.fours, 10) || 0), 0);
        const sixes = rows.reduce((s, b) => s + (parseInt(b.sixes, 10) || 0), 0);
        const short = shortNameMap[String(inn.batting_team_id)] || inn.battingteamname || "Team";
        const fullName = inn.battingteamname || short;
        // Resolve team colour: prefer full name for better keyword matching
        const color = getTeamColor(fullName || short, idx);
        return { team: fullName, short, fours, sixes, color };
    });

    const charts = [
        {
            label: "Fours (4s)",
            emoji: "🔷",
            data: innData.map((d) => ({
                label: d.team,
                short: d.short,
                value: d.fours,
                color: d.color,
            })),
        },
        {
            label: "Sixes (6s)",
            emoji: "💥",
            data: innData.map((d) => ({
                label: d.team,
                short: d.short,
                value: d.sixes,
                color: d.color,
            })),
        },
    ];

    return (
        <div
            style={{
                marginTop: 48,
                padding: "28px 24px",
                background: "#111",
                borderRadius: 14,
                border: "1px solid #1f1f1f",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    color: "#fff",
                    fontSize: 18,
                    marginBottom: 32,
                    letterSpacing: 0.5,
                }}
            >
                🏏 Boundary Stats
            </h2>

            <div
                style={{
                    display: "flex",
                    gap: 32,
                    justifyContent: "center",
                    flexWrap: "wrap",
                }}
            >
                {charts.map((chart) => {
                    const total = chart.data.reduce((s, d) => s + d.value, 0);
                    return (
                        <div
                            key={chart.label}
                            style={{
                                textAlign: "center",
                                background: "#0d0d0d",
                                borderRadius: 12,
                                padding: "20px 24px",
                                minWidth: 220,
                                border: "1px solid #222",
                            }}
                        >
                            {/* Chart title */}
                            <div
                                style={{ color: "#aaa", fontSize: 13, marginBottom: 16, fontWeight: 600 }}
                            >
                                {chart.emoji} {chart.label}
                            </div>

                            {/* Pie chart */}
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                                <PieChart data={chart.data} size={180} />
                            </div>

                            {/* Legend — color dot + full team name + count */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                {chart.data.map((d, i) => {
                                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                    return (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                    background: d.color,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {/* Short name badge */}
                                            <span
                                                style={{
                                                    background: d.color + "22",
                                                    color: d.color,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    padding: "2px 6px",
                                                    borderRadius: 4,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                {d.short}
                                            </span>
                                            <span style={{ color: "#ccc", fontSize: 12, flex: 1 }}>
                                                {d.label}
                                            </span>
                                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                                                {d.value}
                                            </span>
                                            <span style={{ color: "#555", fontSize: 11 }}>
                                                ({pct}%)
                                            </span>
                                        </div>
                                    );
                                })}
                                <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>
                                    Total: {total}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
