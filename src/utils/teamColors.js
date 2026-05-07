// src/utils/teamColors.js
// Official-inspired IPL team colours for pie-chart slices.
// Matched by normalising the team name / short-name to lowercase and
// checking if it CONTAINS one of the known keywords.

const TEAM_COLOR_MAP = [
  { keywords: ["rcb", "royal challengers"], color: "#EC1C24" },       // RCB  — bold red
  { keywords: ["srh", "sunrisers"],         color: "#EE7429" },       // SRH  — vivid orange
  { keywords: ["kkr", "knight riders"],     color: "#8852daff" },       // KKR  — deep purple
  { keywords: ["csk", "super kings"],       color: "#F9CD05" },       // CSK  — golden yellow
  { keywords: ["mi", "mumbai indians"],     color: "#004BA0" },       // MI   — navy blue
  { keywords: ["rr", "rajasthan"],          color: "#E91E8C" },       // RR   — hot pink
  { keywords: ["lsg", "lucknow"],           color: "#8B2FC9" },       // LSG  — red-blue-maroon → purple-maroon blend
  { keywords: ["gt", "gujarat titans"],     color: "#393bd3ff" },       // GT   — dark navy blue
  { keywords: ["pbks", "punjab kings"],     color: "#C0185A" },       // PBKS — dark crimson-pink/red
  { keywords: ["dc", "delhi capitals"],     color: "#2E86DE" },       // DC   — sky-steel blue (distinct from MI navy)
];

const FALLBACK_COLORS = [
  "#d85a30", "#3b82f6", "#22c55e", "#f59e0b",
  "#a855f7", "#ec4899", "#14b8a6", "#f97316",
];

/**
 * Returns the IPL team colour hex for a given team name/short-name.
 * Falls back to a generic palette colour (by index) if no match found.
 *
 * @param {string} teamName  - full name or short name of the team
 * @param {number} fallbackIndex - index into the fallback palette (0 or 1, etc.)
 * @returns {string} hex colour string
 */
export function getTeamColor(teamName = "", fallbackIndex = 0) {
  const lower = teamName.toLowerCase();
  for (const entry of TEAM_COLOR_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.color;
    }
  }
  return FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}
