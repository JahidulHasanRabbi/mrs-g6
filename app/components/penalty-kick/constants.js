export const COLORS = {
  bg: "#121414",
  primary: "#54E98A",
  primaryDeep: "#003919",
  primaryShadow: "#005228",
  primaryGradStart: "#2ECC71",
  textPrimary: "#E2E2E2",
  textMuted: "#BBCBBB",
  goldText: "#FFDD74",
  goldIcon: "#EBBF01",
  navGold: "#E9AF41",
  red: "#FF3B30",
  diskDark: "#1E2020",
  trackDark: "#333535",
  glassFill: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.1)",
  hudFill: "rgba(255,255,255,0.1)",
  hudBorder: "rgba(255,255,255,0.2)",
  greenSoft10: "rgba(84,233,138,0.1)",
  greenSoft20: "rgba(84,233,138,0.2)",
  greenSoft50: "rgba(84,233,138,0.5)",
};

export const DURATIONS = {
  loadingMs: 2000,
  kickMs: 1200,
  keeperDiveMs: 450,
  modalEnterMs: 250,
};

export const STORAGE_KEYS = {
  muted: "mrs_penalty_kick_muted",
};

export const AUDIO_PATHS = {
  whistle: "/assets/penalty-kick/audio/whistle.mp3",
  kick: "/assets/penalty-kick/audio/kick.mp3",
  goal: "/assets/penalty-kick/audio/goal-cheer.mp3",
  save: "/assets/penalty-kick/audio/save-thud.mp3",
  tap: "/assets/penalty-kick/audio/ui-tap.mp3",
};

export const ICONS = {
  // Vendored Figma art for the header chips — gold-rimmed info badge + the
  // arcade-style hamburger bars. PNGs from the Figma export (see
  // public/assets/penalty-kick/icons/). The plain SVG fallbacks stay around
  // because dialogs (close button, soccer mask, etc.) still reference them.
  info: "/assets/penalty-kick/icons/info-badge.png",
  menu: "/assets/penalty-kick/icons/menu-bars.png",
  volumeOn: "/assets/penalty-kick/icons/mdi-volume-high.svg",
  volumeOff: "/assets/penalty-kick/icons/mdi-volume-off.svg",
  play: "/assets/penalty-kick/icons/material-symbols-play-arrow-rounded.svg",
  soccer: "/assets/penalty-kick/icons/mdi-soccer.svg",
  coin: "/assets/penalty-kick/icons/iconoir-coins.svg",
  flag: "/assets/penalty-kick/icons/material-symbols-flag.svg",
  close: "/assets/penalty-kick/icons/mdi-close.svg",
};

// Arcade-style bottom nav assets (Figma node 614:110). Five PNG icons +
// the Union bezel SVG that frames them with a curved cutout for the
// elevated HOME button. Decorative only — actions are no-ops for now.
export const NAV_ICONS = {
  leaderboard: "/assets/penalty-kick/nav/leaderboard.png",
  hot: "/assets/penalty-kick/nav/hot.png",
  home: "/assets/penalty-kick/nav/home.png",
  profile: "/assets/penalty-kick/nav/profile.png",
  livechat: "/assets/penalty-kick/nav/livechat.png",
  unionBezel: "/assets/penalty-kick/nav/union-bezel.svg",
};

export const PHASES = {
  LOADING: "LOADING",
  LAUNCH: "LAUNCH",
  READY: "READY",
  KICKING: "KICKING",
};

export const DIALOGS = {
  GOAL: "GOAL",
  FAIL: "FAIL",
  INFO: "INFO",
  TERMS: "TERMS",
  HISTORY: "HISTORY",
};
