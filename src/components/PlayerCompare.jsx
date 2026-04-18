import { useEffect, useRef, useState } from "react";
import http from "../api/http";
import { getTeamColor } from "../utils/teamColors";

/* ─────────────────────────────────────────────
   DEFAULT SEARCH-BOX ACCENT (before player selected)
───────────────────────────────────────────── */
const DEFAULT_C1 = "#d85a30"; // player-1 accent before team is known
const DEFAULT_C2 = "#3b82f6"; // player-2 accent before team is known

/* ─────────────────────────────────────────────
   SEARCH INPUT with live suggestions
───────────────────────────────────────────── */
function PlayerSearchBox({ allPlayers, selected, onSelect, placeholder, color }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim().length < 1
    ? []
    : allPlayers.filter((p) =>
        p.player_name.toLowerCase().includes(query.toLowerCase()) ||
        p.short_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  const handleSelect = (p) => {
    onSelect(p);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 220 }}>
      {/* Selected badge */}
      {selected && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          background: color + "18", border: `1px solid ${color}55`,
          borderRadius: 8, padding: "6px 12px",
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{selected.player_name}</span>
          <span style={{ color: "#888", fontSize: 12 }}>[{selected.short_name}]</span>
          <button
            onClick={() => { onSelect(null); setQuery(""); }}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>
      )}

      {/* Search input */}
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={selected ? "Change player..." : placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          background: "#111", border: `1px solid ${open ? color : "#333"}`,
          color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
          transition: "border 0.2s",
        }}
      />

      {/* Suggestions dropdown */}
      {open && query.trim().length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, overflow: "hidden",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", color: "#555", fontSize: 13 }}>
              No player found for "{query}"
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.player_id}
                onClick={() => handleSelect(p)}
                style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: 13,
                  borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  background: "#2a2a2a", padding: "2px 6px", borderRadius: 4,
                  fontSize: 11, fontWeight: 700, color: color,
                }}>{p.short_name}</span>
                <span style={{ color: "#fff" }}>{p.player_name}</span>
                <span style={{ color: "#555", fontSize: 11, marginLeft: "auto" }}>{p.role}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PIE CHART (SVG, no library)
───────────────────────────────────────────── */
function MiniPie({ v1, v2, label, c1 = DEFAULT_C1, c2 = DEFAULT_C2, short1, short2 }) {
  const total = v1 + v2;
  const size = 140;
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;

  if (total === 0) return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="#1a1a1a" />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#444" fontSize={12}>No data</text>
      </svg>
      <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );

  const slices = [
    { value: v1, color: c1, short: short1 },
    { value: v2, color: c2, short: short2 },
  ];
  let start = -Math.PI / 2;
  const paths = slices.map(({ value, color, short }) => {
    const angle = (value / total) * 2 * Math.PI;
    const end = start + angle;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const pct = Math.round((value / total) * 100);
    const midA = start + angle / 2;
    const lx = cx + r * 0.58 * Math.cos(midA);
    const ly = cy + r * 0.58 * Math.sin(midA);
    const d = `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
    start = end;
    return { d, color, pct, lx, ly, short };
  });

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size}>
        {paths.map((s, i) => (
          <g key={i}>
            <path d={s.d} fill={s.color} stroke="#0a0a0a" strokeWidth={2} />
            {s.pct >= 14 && (
              <>
                <text x={s.lx} y={s.ly - 6} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10} fontWeight={700}>{s.short}</text>
                <text x={s.lx} y={s.ly + 6} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10}>{s.pct}%</text>
              </>
            )}
          </g>
        ))}
      </svg>
      <div style={{ color: "#aaa", fontSize: 12, marginTop: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 4 }}>
        {slices.map((s, i) => (
          <span key={i} style={{ fontSize: 11, color: "#ccc", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            {s.short}: <b style={{ color: "#fff" }}>{[v1, v2][i]}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RUN TREND CHART (SVG line / stock style)
───────────────────────────────────────────── */
function RunTrendChart({ trend1, trend2, name1, name2, c1 = DEFAULT_C1, c2 = DEFAULT_C2 }) {
  if (!trend1.length && !trend2.length) return null;

  const W = 560, H = 180, PAD = { top: 20, bottom: 40, left: 36, right: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Build unified match list
  const allLabels = Array.from(new Set([
    ...trend1.map((d) => d.match_label),
    ...trend2.map((d) => d.match_label),
  ]));

  const getVal = (trend, label) => {
    const row = trend.find((d) => d.match_label === label);
    return row ? Number(row.runs) : null;
  };

  const allVals = allLabels.flatMap((l) => [getVal(trend1, l), getVal(trend2, l)]).filter((v) => v !== null);
  const maxV = Math.max(...allVals, 1);

  const xPos = (i) => PAD.left + (i / Math.max(allLabels.length - 1, 1)) * innerW;
  const yPos = (v) => PAD.top + innerH - (v / maxV) * innerH;

  const buildPath = (trend) => {
    const pts = allLabels.map((l, i) => {
      const v = getVal(trend, l);
      return v !== null ? `${xPos(i)},${yPos(v)}` : null;
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return "M " + pts.join(" L ");
  };

  const path1 = buildPath(trend1);
  const path2 = buildPath(trend2);

  // Y-axis grid lines
  const gridLines = [0, 25, 50, 75, 100].map((pct) => {
    const v = Math.round((pct / 100) * maxV);
    const y = yPos(v);
    return { v, y };
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ color: "#aaa", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>📈 Run Trend (Match by Match)</div>
      <svg width={W} height={H} style={{ display: "block", minWidth: W }}>
        {/* Grid lines */}
        {gridLines.map(({ v, y }) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#222" strokeWidth={1} />
            <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="#444" fontSize={9}>{v}</text>
          </g>
        ))}

        {/* X-axis labels */}
        {allLabels.map((l, i) => (
          <text
            key={i}
            x={xPos(i)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fill="#444"
            fontSize={8}
            transform={`rotate(-30, ${xPos(i)}, ${H - PAD.bottom + 14})`}
          >
            {l}
          </text>
        ))}

        {/* Lines */}
        {path1 && <path d={path1} fill="none" stroke={c1} strokeWidth={2} strokeLinejoin="round" />}
        {path2 && <path d={path2} fill="none" stroke={c2} strokeWidth={2} strokeLinejoin="round" />}

        {/* Dots + trend arrows */}
        {[{ trend: trend1, color: c1 }, { trend: trend2, color: c2 }].map(({ trend, color }, ti) =>
          allLabels.map((l, i) => {
            const v = getVal(trend, l);
            if (v === null) return null;
            const cx = xPos(i), cy = yPos(v);
            const prev = i > 0 ? getVal(trend, allLabels[i - 1]) : null;
            const arrow = prev === null ? "" : v > prev ? "▲" : v < prev ? "▼" : "–";
            const arrowColor = v > prev ? "#22c55e" : v < prev ? "#ef4444" : "#888";
            return (
              <g key={`${ti}-${i}`}>
                <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#0a0a0a" strokeWidth={1.5} />
                {/* Tooltip-style value on hover via title */}
                <title>{l}: {v} runs</title>
                {arrow && (
                  <text x={cx} y={cy - 10} textAnchor="middle" fill={arrowColor} fontSize={9} fontWeight={700}>{arrow}</text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        {[{ name: name1, color: c1 }, { name: name2, color: c2 }].map(({ name, color }) => (
          <span key={name} style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 24, height: 2, background: color, display: "inline-block", borderRadius: 2 }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT ROW (for compare cards)
───────────────────────────────────────────── */
function StatRow({ label, v1, v2, highlight = false, c1 = DEFAULT_C1, c2 = DEFAULT_C2 }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #111" }}>
      <span style={{ color: highlight ? c1 : "#888", fontSize: 13, fontWeight: highlight ? 700 : 400 }}>{v1}</span>
      <span style={{ color: "#555", fontSize: 12, flex: 1, textAlign: "center" }}>{label}</span>
      <span style={{ color: highlight ? c2 : "#fff", fontSize: 13, fontWeight: highlight ? 700 : 600 }}>{v2}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function PlayerCompare() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [sel1, setSel1] = useState(null);
  const [sel2, setSel2] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [trend1, setTrend1] = useState([]);
  const [trend2, setTrend2] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get("/stats/all-players").then((r) => setAllPlayers(r.data));
  }, []);

  const handleCompare = async () => {
    if (!sel1 || !sel2) return;
    setLoading(true);
    try {
      const [cmp, t1, t2] = await Promise.all([
        http.get(`/stats/compare?player1=${sel1.player_id}&player2=${sel2.player_id}`),
        http.get(`/stats/player-matches/${sel1.player_id}`),
        http.get(`/stats/player-matches/${sel2.player_id}`),
      ]);
      setCompareData(cmp.data);
      setTrend1(t1.data || []);
      setTrend2(t2.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const p1 = compareData?.[0];
  const p2 = compareData?.[1];

  // Resolve per-team IPL brand colours from the player's team name
  const c1 = p1 ? getTeamColor(p1.team_name || "", 0) : DEFAULT_C1;
  const c2 = p2 ? getTeamColor(p2.team_name || "", 1) : DEFAULT_C2;

  const showWickets = p1 && p2 && (Number(p1.total_wickets) > 0 || Number(p2.total_wickets) > 0);

  return (
    <div>
      {/* ── Search section ── */}
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>🔍 Search & Compare Players</h3>
        <p style={{ color: "#555", fontSize: 12, margin: "0 0 16px" }}>Type a player name to search</p>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <PlayerSearchBox
            allPlayers={allPlayers}
            selected={sel1}
            onSelect={setSel1}
            placeholder="Search Player 1..."
            color={p1 ? c1 : DEFAULT_C1}
          />
          <span style={{ color: "#555", alignSelf: "center", fontWeight: 700, paddingTop: sel1 ? 36 : 0 }}>vs</span>
          <PlayerSearchBox
            allPlayers={allPlayers}
            selected={sel2}
            onSelect={setSel2}
            placeholder="Search Player 2..."
            color={p2 ? c2 : DEFAULT_C2}
          />
          <button
            onClick={handleCompare}
            disabled={!sel1 || !sel2 || loading}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none", cursor: sel1 && sel2 ? "pointer" : "not-allowed",
              background: sel1 && sel2 ? "#d85a30" : "#2a2a2a",
              color: sel1 && sel2 ? "#fff" : "#555", fontWeight: 700, fontSize: 14,
              alignSelf: sel1 ? "flex-end" : "center", marginTop: sel1 ? 4 : 0,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Loading..." : "Compare ⚡"}
          </button>
        </div>
      </div>

      {/* ── Stats Cards (existing layout) ── */}
      {compareData?.length === 2 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
            {[p1, p2].map((p, i) => (
              <div key={p.player_id} style={{
                background: "#1a1a1a", border: `1px solid ${[c1, c2][i]}44`,
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #2a2a2a" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: [c1, c2][i], display: "inline-block", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{p.player_name}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>{p.team_name} · {p.role}</div>
                  </div>
                </div>

                <div style={{ color: [c1, c2][i], fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>BATTING</div>
                {[
                  ["Matches", p.bat_matches],
                  ["Runs", p.total_runs],
                  ["Avg", p.batting_avg],
                  ["Strike Rate", p.strike_rate],
                  ["Highest Score", p.highest_score],
                  ["50s / 100s", `${p.fifties} / ${p.hundreds}`],
                  ["4s / 6s", `${p.total_fours} / ${p.total_sixes}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #111" }}>
                    <span style={{ color: "#666", fontSize: 12 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}

                <div style={{ color: "#7F77DD", fontSize: 11, fontWeight: 700, margin: "14px 0 8px", letterSpacing: 1 }}>BOWLING</div>
                {[
                  ["Wickets", p.total_wickets],
                  ["Overs", p.total_overs],
                  ["Economy", p.economy],
                  ["Bowling Avg", p.bowling_avg],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #111" }}>
                    <span style={{ color: "#666", fontSize: 12 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── Graphical Section ── */}
          <div style={{
            marginTop: 28, background: "#111",
            border: "1px solid #1f1f1f", borderRadius: 14, padding: "24px 20px",
          }}>
            <h3 style={{ margin: "0 0 24px", fontSize: 16, color: "#fff", letterSpacing: 0.4 }}>
              📊 Visual Comparison
            </h3>

            {/* Pie charts row */}
            <div style={{
              display: "flex", gap: 20, flexWrap: "wrap",
              justifyContent: "space-around", marginBottom: 32,
            }}>
              <MiniPie
                v1={Number(p1.total_runs)} v2={Number(p2.total_runs)}
                label="Runs" short1={p1.short_name} short2={p2.short_name}
                c1={c1} c2={c2}
              />
              <MiniPie
                v1={Number(p1.total_fours)} v2={Number(p2.total_fours)}
                label="Fours (4s)" short1={p1.short_name} short2={p2.short_name}
                c1={c1} c2={c2}
              />
              <MiniPie
                v1={Number(p1.total_sixes)} v2={Number(p2.total_sixes)}
                label="Sixes (6s)" short1={p1.short_name} short2={p2.short_name}
                c1={c1} c2={c2}
              />
              {showWickets && (
                <MiniPie
                  v1={Number(p1.total_wickets)} v2={Number(p2.total_wickets)}
                  label="Wickets" short1={p1.short_name} short2={p2.short_name}
                  c1={c1} c2={c2}
                />
              )}
            </div>

            {/* Run Trend chart */}
            {(trend1.length > 0 || trend2.length > 0) && (
              <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 16, border: "1px solid #222" }}>
                <RunTrendChart
                  trend1={trend1}
                  trend2={trend2}
                  name1={p1.player_name}
                  name2={p2.player_name}
                  c1={c1}
                  c2={c2}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
