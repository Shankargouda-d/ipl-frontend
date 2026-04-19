import { useEffect, useRef, useState } from "react";
import http from "../api/http";
import { getTeamColor } from "../utils/teamColors";

const DEFAULT_C1 = "#d85a30";
const DEFAULT_C2 = "#3b82f6";

/* ── Player Search Box ── */
function PlayerSearchBox({ allPlayers, selected, onSelect, placeholder, color }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim().length < 1 ? [] :
    allPlayers.filter((p) =>
      p.player_name.toLowerCase().includes(query.toLowerCase()) ||
      p.short_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

  const handleSelect = (p) => { onSelect(p); setQuery(""); setOpen(false); };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 220 }}>
      {selected && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          background: color + "18", border: `1px solid ${color}55`,
          borderRadius: 8, padding: "6px 12px",
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{selected.player_name}</span>
          <span style={{ color: "#888", fontSize: 12 }}>[{selected.short_name}]</span>
          <button onClick={() => { onSelect(null); setQuery(""); }}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}
      <input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={selected ? "Change player..." : placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          background: "#111", border: `1px solid ${open ? color : "#333"}`,
          color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.2s",
        }}
      />
      {open && query.trim().length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, overflow: "hidden",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", color: "#555", fontSize: 13 }}>No player found for "{query}"</div>
          ) : filtered.map((p) => (
            <div key={p.player_id} onClick={() => handleSelect(p)}
              style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span style={{ background: "#2a2a2a", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, color }}>{p.short_name}</span>
              <span style={{ color: "#fff" }}>{p.player_name}</span>
              <span style={{ color: "#555", fontSize: 11, marginLeft: "auto" }}>{p.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Donut Pie Chart with player name labels ── */
function DonutPie({ v1, v2, label, c1 = DEFAULT_C1, c2 = DEFAULT_C2, name1 = "P1", name2 = "P2" }) {
  const total = v1 + v2;
  const size = 200;
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 10; // outer radius
  const ri = R * 0.52;     // inner radius (donut hole)

  // Shorten long names to first name only
  const short1 = name1.split(" ")[0];
  const short2 = name2.split(" ")[0];

  if (total === 0) return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={R} fill="#1a1a1a" />
        <circle cx={cx} cy={cy} r={ri} fill="#0d0d0d" />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#444" fontSize={13}>No data</text>
      </svg>
      <div style={{ color: "#555", fontSize: 13, marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );

  const slices = [
    { value: v1, color: c1, name: short1, full: v1 },
    { value: v2, color: c2, name: short2, full: v2 },
  ];
  let start = -Math.PI / 2;
  const paths = slices.map(({ value, color, name, full }) => {
    const angle = (value / total) * 2 * Math.PI;
    const end = start + angle;
    const pct = Math.round((value / total) * 100);
    const mid = start + angle / 2;
    // outer arc
    const ox1 = cx + R * Math.cos(start), oy1 = cy + R * Math.sin(start);
    const ox2 = cx + R * Math.cos(end),   oy2 = cy + R * Math.sin(end);
    // inner arc (reversed)
    const ix1 = cx + ri * Math.cos(end),  iy1 = cy + ri * Math.sin(end);
    const ix2 = cx + ri * Math.cos(start), iy2 = cy + ri * Math.sin(start);
    const lg = angle > Math.PI ? 1 : 0;
    const d = `M${ox1} ${oy1} A${R} ${R} 0 ${lg} 1 ${ox2} ${oy2} L${ix1} ${iy1} A${ri} ${ri} 0 ${lg} 0 ${ix2} ${iy2} Z`;
    // label position at 75% of outer radius
    const lx = cx + (R * 0.76) * Math.cos(mid);
    const ly = cy + (R * 0.76) * Math.sin(mid);
    start = end;
    return { d, color, pct, lx, ly, name, full };
  });

  const pct1 = Math.round((v1 / total) * 100);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {paths.map((s, i) => (
          <g key={i}>
            <path d={s.d} fill={s.color} stroke="#0d0d0d" strokeWidth={2.5} />
            {s.pct >= 12 && (
              <>
                <text x={s.lx} y={s.ly - 7} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={9} fontWeight={700}>{s.name}</text>
                <text x={s.lx} y={s.ly + 6} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={9}>{s.pct}%</text>
              </>
            )}
          </g>
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={18} fontWeight={800}>{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={10}>Total</text>
      </svg>

      {/* Label */}
      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 8 }}>{label}</div>

      {/* Legend bar */}
      <div style={{ margin: "10px auto 0", width: "80%", height: 6, borderRadius: 4, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pct1}%`, background: c1, transition: "width 0.5s" }} />
        <div style={{ flex: 1, background: c2 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "80%", margin: "6px auto 0" }}>
        <span style={{ fontSize: 11, color: c1, fontWeight: 700 }}>{name1.split(" ")[0]}: <b style={{ color: "#fff" }}>{v1}</b></span>
        <span style={{ fontSize: 11, color: c2, fontWeight: 700 }}>{name2.split(" ")[0]}: <b style={{ color: "#fff" }}>{v2}</b></span>
      </div>
    </div>
  );
}

/* ── Stat Bar Row ── */
function StatBar({ label, v1, v2, c1, c2, name1, name2 }) {
  const total = Number(v1) + Number(v2);
  const pct1 = total > 0 ? Math.round((Number(v1) / total) * 100) : 50;
  const winner = Number(v1) > Number(v2) ? 1 : Number(v2) > Number(v1) ? 2 : 0;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontWeight: winner === 1 ? 800 : 500, color: winner === 1 ? c1 : "#bbb", fontSize: 13 }}>{v1}</span>
        <span style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontWeight: winner === 2 ? 800 : 500, color: winner === 2 ? c2 : "#bbb", fontSize: 13 }}>{v2}</span>
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "#1a1a1a" }}>
        <div style={{ width: `${pct1}%`, background: `linear-gradient(90deg, ${c1}cc, ${c1})`, transition: "width 0.6s ease", borderRadius: "4px 0 0 4px" }} />
        <div style={{ flex: 1, background: `linear-gradient(90deg, ${c2}, ${c2}cc)`, borderRadius: "0 4px 4px 0" }} />
      </div>
    </div>
  );
}

/* ── Run Trend Chart ── */
function RunTrendChart({ trend1, trend2, name1, name2, c1 = DEFAULT_C1, c2 = DEFAULT_C2 }) {
  if (!trend1.length && !trend2.length) return null;
  const W = 560, H = 180, PAD = { top: 20, bottom: 40, left: 36, right: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const allLabels = Array.from(new Set([...trend1.map((d) => d.match_label), ...trend2.map((d) => d.match_label)]));
  const getVal = (trend, label) => { const row = trend.find((d) => d.match_label === label); return row ? Number(row.runs) : null; };
  const allVals = allLabels.flatMap((l) => [getVal(trend1, l), getVal(trend2, l)]).filter((v) => v !== null);
  const maxV = Math.max(...allVals, 1);
  const xPos = (i) => PAD.left + (i / Math.max(allLabels.length - 1, 1)) * innerW;
  const yPos = (v) => PAD.top + innerH - (v / maxV) * innerH;
  const buildPath = (trend) => {
    const pts = allLabels.map((l, i) => { const v = getVal(trend, l); return v !== null ? `${xPos(i)},${yPos(v)}` : null; }).filter(Boolean);
    return pts.length < 2 ? null : "M " + pts.join(" L ");
  };
  const path1 = buildPath(trend1), path2 = buildPath(trend2);
  const gridLines = [0, 25, 50, 75, 100].map((pct) => { const v = Math.round((pct / 100) * maxV); return { v, y: yPos(v) }; });

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ color: "#aaa", fontSize: 13, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>📈 Run Trend (Match by Match)</div>
      <svg width={W} height={H} style={{ display: "block", minWidth: W }}>
        {gridLines.map(({ v, y }) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#1f1f1f" strokeWidth={1} />
            <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="#444" fontSize={9}>{v}</text>
          </g>
        ))}
        {allLabels.map((l, i) => (
          <text key={i} x={xPos(i)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#444" fontSize={8} transform={`rotate(-30, ${xPos(i)}, ${H - PAD.bottom + 14})`}>{l}</text>
        ))}
        {path1 && <path d={path1} fill="none" stroke={c1} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {path2 && <path d={path2} fill="none" stroke={c2} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {[{ trend: trend1, color: c1 }, { trend: trend2, color: c2 }].map(({ trend, color }, ti) =>
          allLabels.map((l, i) => {
            const v = getVal(trend, l);
            if (v === null) return null;
            const px = xPos(i), py = yPos(v);
            const prev = i > 0 ? getVal(trend, allLabels[i - 1]) : null;
            const arrow = prev === null ? "" : v > prev ? "▲" : v < prev ? "▼" : "–";
            const arrowColor = v > prev ? "#22c55e" : v < prev ? "#ef4444" : "#888";
            return (
              <g key={`${ti}-${i}`}>
                <circle cx={px} cy={py} r={4} fill={color} stroke="#0a0a0a" strokeWidth={1.5} />
                <title>{l}: {v} runs</title>
                {arrow && <text x={px} y={py - 11} textAnchor="middle" fill={arrowColor} fontSize={9} fontWeight={700}>{arrow}</text>}
              </g>
            );
          })
        )}
      </svg>
      <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
        {[{ name: name1, color: c1 }, { name: name2, color: c2 }].map(({ name, color }) => (
          <span key={name} style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 24, height: 3, background: color, display: "inline-block", borderRadius: 2 }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function PlayerCompare() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [sel1, setSel1] = useState(null);
  const [sel2, setSel2] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [trend1, setTrend1] = useState([]);
  const [trend2, setTrend2] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { http.get("/stats/all-players").then((r) => setAllPlayers(r.data)); }, []);

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const p1 = compareData?.[0];
  const p2 = compareData?.[1];
  const c1 = p1 ? getTeamColor(p1.team_name || "", 0) : DEFAULT_C1;
  const c2 = p2 ? getTeamColor(p2.team_name || "", 1) : DEFAULT_C2;
  const showWickets = p1 && p2 && (Number(p1.total_wickets) > 0 || Number(p2.total_wickets) > 0);

  return (
    <div>
      {/* Search section */}
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>🔍 Search & Compare Players</h3>
        <p style={{ color: "#555", fontSize: 12, margin: "0 0 16px" }}>Type a player name to search</p>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <PlayerSearchBox allPlayers={allPlayers} selected={sel1} onSelect={setSel1} placeholder="Search Player 1..." color={p1 ? c1 : DEFAULT_C1} />
          <span style={{ color: "#555", alignSelf: "center", fontWeight: 700, paddingTop: sel1 ? 36 : 0 }}>vs</span>
          <PlayerSearchBox allPlayers={allPlayers} selected={sel2} onSelect={setSel2} placeholder="Search Player 2..." color={p2 ? c2 : DEFAULT_C2} />
          <button onClick={handleCompare} disabled={!sel1 || !sel2 || loading}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none", cursor: sel1 && sel2 ? "pointer" : "not-allowed",
              background: sel1 && sel2 ? "#d85a30" : "#2a2a2a", color: sel1 && sel2 ? "#fff" : "#555",
              fontWeight: 700, fontSize: 14, alignSelf: sel1 ? "flex-end" : "center", marginTop: sel1 ? 4 : 0, transition: "background 0.2s",
            }}>
            {loading ? "Loading..." : "Compare ⚡"}
          </button>
        </div>
      </div>

      {compareData?.length === 2 && (
        <>
          {/* Player cards side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
            {[p1, p2].map((p, i) => {
              const col = [c1, c2][i];
              return (
                <div key={p.player_id} style={{ background: "#1a1a1a", border: `1px solid ${col}44`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #2a2a2a" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: col, display: "inline-block", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>{p.player_name}</div>
                      <div style={{ color: "#666", fontSize: 12 }}>{p.team_name} · {p.role}</div>
                    </div>
                  </div>
                  <div style={{ color: col, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>BATTING</div>
                  {[["Matches", p.bat_matches], ["Runs", p.total_runs], ["Avg", p.batting_avg], ["Strike Rate", p.strike_rate], ["Highest Score", p.highest_score], ["50s / 100s", `${p.fifties} / ${p.hundreds}`], ["4s / 6s", `${p.total_fours} / ${p.total_sixes}`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #111" }}>
                      <span style={{ color: "#666", fontSize: 12 }}>{k}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ color: "#7F77DD", fontSize: 11, fontWeight: 700, margin: "14px 0 8px", letterSpacing: 1 }}>BOWLING</div>
                  {[["Wickets", p.total_wickets], ["Overs", p.total_overs], ["Economy", p.economy], ["Bowling Avg", p.bowling_avg]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #111" }}>
                      <span style={{ color: "#666", fontSize: 12 }}>{k}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* ── Visual Comparison Section ── */}
          <div style={{ marginTop: 28, background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 16, padding: "28px 24px" }}>
            {/* Header with player names */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              {/* Avatar silhouettes */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
                  {/* Head */}
                  <circle cx="32" cy="12" r="10" fill={`color-mix(in srgb, ${c1} 55%, white)`} />
                  {/* Body */}
                  <path d="M18 42 Q18 28 32 26 Q46 28 46 42 L44 60 Q38 64 32 64 Q26 64 20 60 Z" fill={`color-mix(in srgb, ${c1} 55%, white)`} />
                  {/* Left arm folded */}
                  <path d="M18 36 Q10 38 12 46 Q16 48 20 44 Q20 40 22 38 Z" fill={`color-mix(in srgb, ${c1} 55%, white)`} />
                  {/* Right arm folded */}
                  <path d="M46 36 Q54 38 52 46 Q48 48 44 44 Q44 40 42 38 Z" fill={`color-mix(in srgb, ${c1} 55%, white)`} />
                  {/* Folded hands */}
                  <ellipse cx="32" cy="44" rx="10" ry="5" fill={`color-mix(in srgb, ${c1} 40%, white)`} />
                  {/* Legs */}
                  <path d="M26 62 Q24 72 22 78" stroke={`color-mix(in srgb, ${c1} 55%, white)`} strokeWidth="7" strokeLinecap="round" fill="none" />
                  <path d="M38 62 Q40 72 42 78" stroke={`color-mix(in srgb, ${c1} 55%, white)`} strokeWidth="7" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ color: c1, fontWeight: 800, fontSize: 15 }}>{p1.player_name}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, color: "#aaa", letterSpacing: 0.5 }}>📊 Visual Comparison</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="12" r="10" fill={`color-mix(in srgb, ${c2} 55%, white)`} />
                  <path d="M18 42 Q18 28 32 26 Q46 28 46 42 L44 60 Q38 64 32 64 Q26 64 20 60 Z" fill={`color-mix(in srgb, ${c2} 55%, white)`} />
                  <path d="M18 36 Q10 38 12 46 Q16 48 20 44 Q20 40 22 38 Z" fill={`color-mix(in srgb, ${c2} 55%, white)`} />
                  <path d="M46 36 Q54 38 52 46 Q48 48 44 44 Q44 40 42 38 Z" fill={`color-mix(in srgb, ${c2} 55%, white)`} />
                  <ellipse cx="32" cy="44" rx="10" ry="5" fill={`color-mix(in srgb, ${c2} 40%, white)`} />
                  <path d="M26 62 Q24 72 22 78" stroke={`color-mix(in srgb, ${c2} 55%, white)`} strokeWidth="7" strokeLinecap="round" fill="none" />
                  <path d="M38 62 Q40 72 42 78" stroke={`color-mix(in srgb, ${c2} 55%, white)`} strokeWidth="7" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ color: c2, fontWeight: 800, fontSize: 15 }}>{p2.player_name}</span>
              </div>
            </div>

            {/* Stat Bars */}
            <div style={{ background: "#111", borderRadius: 12, padding: "20px 24px", marginBottom: 24, border: "1px solid #1a1a1a" }}>
              <div style={{ color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" }}>Head-to-Head Stats</div>
              {[
                ["Runs", p1.total_runs, p2.total_runs],
                ["Matches", p1.bat_matches, p2.bat_matches],
                ["Batting Avg", p1.batting_avg, p2.batting_avg],
                ["Strike Rate", p1.strike_rate, p2.strike_rate],
                ["Highest Score", p1.highest_score, p2.highest_score],
                ["Fours (4s)", p1.total_fours, p2.total_fours],
                ["Sixes (6s)", p1.total_sixes, p2.total_sixes],
                ...(showWickets ? [["Wickets", p1.total_wickets, p2.total_wickets]] : []),
              ].map(([label, v1, v2]) => (
                <StatBar key={label} label={label} v1={v1} v2={v2} c1={c1} c2={c2} name1={p1.player_name} name2={p2.player_name} />
              ))}
            </div>

            {/* Pie / Donut Charts — one below other */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Runs Comparison", v1: Number(p1.total_runs), v2: Number(p2.total_runs) },
                { label: "Fours (4s) Comparison", v1: Number(p1.total_fours), v2: Number(p2.total_fours) },
                { label: "Sixes (6s) Comparison", v1: Number(p1.total_sixes), v2: Number(p2.total_sixes) },
                ...(showWickets ? [{ label: "Wickets Comparison", v1: Number(p1.total_wickets), v2: Number(p2.total_wickets) }] : []),
              ].map(({ label, v1, v2 }) => (
                <div key={label} style={{
                  background: "#111", borderRadius: 12, padding: "20px 24px",
                  border: "1px solid #1a1a1a", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 32, flexWrap: "wrap",
                }}>
                  <DonutPie v1={v1} v2={v2} label={label} c1={c1} c2={c2} name1={p1.player_name} name2={p2.player_name} />
                </div>
              ))}
            </div>

            {/* Run Trend */}
            {(trend1.length > 0 || trend2.length > 0) && (
              <div style={{ background: "#111", borderRadius: 12, padding: 20, border: "1px solid #1a1a1a", marginTop: 20 }}>
                <RunTrendChart trend1={trend1} trend2={trend2} name1={p1.player_name} name2={p2.player_name} c1={c1} c2={c2} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
