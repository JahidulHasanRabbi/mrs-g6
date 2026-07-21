// The "primary"/"green"/"rank" accent tokens resolve to CSS variables defined
// in app/globals.css (:root + per-theme :root[data-theme=...] overrides), so the
// leaderboard re-tints to the active portal theme's gold. On the default theme
// the variables fall back to the original World-Cup green. Everything else
// (panels, neutrals, tier colors) stays fixed across themes.
export const LB_COLORS = {
  bg: "#121414",
  primary: "var(--lb-accent)",
  primaryDeep: "var(--lb-on-accent)",
  primarySoft: "rgba(var(--lb-accent-rgb), 0.1)",
  primarySoft20: "rgba(var(--lb-accent-rgb), 0.2)",
  primaryGreenBtn: "var(--lb-accent)",
  gold: "#FFDD74",
  goldStrong: "#E9DD54",
  blueTier: "#5FBAFF",
  cyan: "#54DAE9",
  challengerTier: "#3D4A3E",
  textPrimary: "#E2E2E2",
  textMuted: "#BBCBBB",
  textWhite: "#FFFFFF",
  rankGreen: "var(--lb-rank)",
  red: "#FF3B30",
  blue: "#007AFF",
  orange: "#FF9500",
  panelDark: "rgba(40,42,43,0.95)",
  panelLight: "var(--lb-panel-light)",
  cardOverlay: "var(--lb-card-overlay)",
  borderSoft: "rgba(255,255,255,0.1)",
  borderGreen30: "rgba(var(--lb-accent-rgb), 0.3)",
  borderGreen50: "rgba(var(--lb-accent-rgb), 0.5)",
};

export const LB_SCREENS = {
  NATION_SELECT: "NATION_SELECT",
  ONBOARDING: "ONBOARDING",
  COUNTRIES: "COUNTRIES",
  GLOBAL_PLAYERS: "GLOBAL_PLAYERS",
  MY_COUNTRY: "MY_COUNTRY",
  PREDICTIONS_LIST: "PREDICTIONS_LIST",
  MY_PREDICTIONS: "MY_PREDICTIONS",
  PRIZE_COUNTRY: "PRIZE_COUNTRY",
  PRIZE_PLAYERS: "PRIZE_PLAYERS",
  PRIZE_PREDICTIONS: "PRIZE_PREDICTIONS",
  PRIZE_INFO: "PRIZE_INFO",
};

export const LB_TABS = {
  COUNTRIES: "COUNTRIES",
  PLAYERS: "PLAYERS",
  PREDICTIONS: "PREDICTIONS",
};
