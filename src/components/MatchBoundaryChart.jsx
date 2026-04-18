// src/components/MatchBoundaryChart.jsx

function PieChart({ data, size = 160 }) {
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
        const labelX = cx + (r * 0.6) * Math.cos(midAngle);
        const labelY = cy + (r * 0.6) * Math.sin(midAngle);
        startAngle = endAngle;
        return { path, color: d.color, label: d.value, labelX, labelY, pct: Math.round((d.value / total) * 100) };
    });

    return (
        <svg width={size} height={size}>
            {slices.map((s, i) => (
                <g key={i}>
                    <path d={s.path} fill={s.color} stroke="#0a0a0a" strokeWidth={2} />
                    {s.pct >= 10 && (
                        <text
                            x={s.labelX}
                            y={s.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#fff"
                            fontSize={12}
                            fontWeight={700}
                        >
                            {s.pct}%
                        </text>
                    )}
                </g>
            ))}
        </svg>
    );
}

const COLORS = ["#d85a30", "#3b82f6"];

export default function MatchBoundaryChart({ innings, batting, match }) {
    // Show only when match status is 'completed' (DB enum: scheduled/live/completed)
    if (!match || match.status !== "completed") return null;
    if (!innings || innings.length < 1) return null;

    // Calculate totals per innings
    const innData = innings.map((inn) => {
        const rows = batting[inn.innings_id] || [];
        const fours = rows.reduce((s, b) => s + (parseInt(b.fours, 10) || 0), 0);
        const sixes = rows.reduce((s, b) => s + (parseInt(b.sixes, 10) || 0), 0);
        return { team: inn.team_name, fours, sixes };
    });

    const charts = [
        {
            label: "4s Comparison",
            emoji: "🔷",
            data: innData.map((d, i) => ({ label: d.team, value: d.fours, color: COLORS[i] })),
        },
        {
            label: "6s Comparison",
            emoji: "💥",
            data: innData.map((d, i) => ({ label: d.team, value: d.sixes, color: COLORS[i] })),
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
                                minWidth: 200,
                                border: "1px solid #222",
                            }}
                        >
                            <div
                                style={{ color: "#aaa", fontSize: 13, marginBottom: 16, fontWeight: 600 }}
                            >
                                {chart.emoji} {chart.label}
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                                <PieChart data={chart.data} size={160} />
                            </div>

                            {/* Legend */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                {chart.data.map((d, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                                        <span style={{ color: "#ccc", fontSize: 13 }}>
                                            {d.label}
                                        </span>
                                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginLeft: "auto" }}>
                                            {d.value}
                                        </span>
                                    </div>
                                ))}
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
