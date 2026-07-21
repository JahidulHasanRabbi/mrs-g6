// Static mission content from Figma node 633:1208 ("Missions"). There is no
// missions API in the Postman collection yet, so the page renders from this
// table — same approach as the game's mockApi.js. When a real endpoint lands,
// swap this array for the mapped server response; the card components only
// depend on the shape below.
//
// Mission shape:
//   id        — stable key
//   tab       — which tab it belongs to ("daily" | "weekly" | "challenge")
//   icon      — "target" | "star" | "bolt" (see MissionCard)
//   title     — heading line
//   reward    — token reward (number)
//   badge     — optional pill label shown top-right (e.g. "Daily")
//   progress  — { current, total }
//   status    — "completed" (claimable) | "in-progress" (locked)

export const MISSION_TABS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "challenge", label: "Challenge" },
];

export const MISSIONS = [
  {
    id: "score-5-goals",
    tab: "daily",
    icon: "target",
    title: "Score 5 goals",
    reward: 50,
    badge: "Daily",
    progress: { current: 5, total: 5 },
    status: "completed",
  },
  {
    id: "3-star-2-rounds",
    tab: "daily",
    icon: "star",
    title: "3-Star 2 Rounds",
    reward: 120,
    progress: { current: 1, total: 2 },
    status: "in-progress",
  },
  {
    id: "win-3-daily",
    tab: "daily",
    icon: "bolt",
    title: "Win 3 Daily Missions",
    reward: 300,
    progress: { current: 0, total: 3 },
    status: "in-progress",
  },
];

// Mission-page palette, lifted straight from the Figma. Kept separate from the
// game's COLORS map (constants.js) because the missions surface uses the
// deep-green VIP backdrop (#07190D) and gold scrollwork accents rather than
// the pitch's #121414 / neon-green scheme.
export const MISSION_COLORS = {
  bg: "#07190D",
  // Near-transparent on dark themes; opaque navy on kgame99's bright backdrop
  // (see --lb-mission-card-fill in app/globals.css) so cards + text stay legible.
  cardFill: "var(--lb-mission-card-fill)",
  // Neutral on the default theme; gold-tinted on a custom theme (see
  // --lb-card-border in app/globals.css) so mission cards read as themed.
  cardBorder: "var(--lb-card-border)",
  title: "#E2E2E2",
  muted: "#BBCBBB",
  gold: "#FFDD74",
  goldDeep: "#E9AF41",
  goldText: "#60803C",
  // Completed-state accent. Resolves to the theme-aware accent variable
  // (app/globals.css): the original World-Cup green on the default theme, the
  // active portal theme's gold otherwise. Only /missions renders MissionCard,
  // so this never touches the green penalty-kick arcade.
  green: "var(--lb-accent)",
  track: "#333535",
  pillFill: "#282A2B",
  tabsFill: "rgba(26,28,28,0.6)",
  iconChip: "rgba(255,221,116,0.2)",
};
