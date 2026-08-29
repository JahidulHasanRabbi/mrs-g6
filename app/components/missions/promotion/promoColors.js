// Palette for the Mission Pop Out promotion modals (Figma 2472:3935 + client
// slide 4). Deliberately module-scoped: this violet scheme is the client's for
// these three dialogs only and must not leak into globals.css or the six
// station skins, which stay dark-green + gold.
export const PROMO = {
  shellBg: "#0b0521",
  shellBorder: "#8427ff",
  cardBg: "#130833",
  cardBorder: "#2e1c59",

  text: "#ffffff",
  muted: "#a399cc",

  // 3D headline: front face over an offset shadow face.
  titleFront: "#ffeaa5",
  titleShadow: "#5c2500",
  titleAccentFront: "#ffa000",
  titleAccentShadow: "#421300",

  amount: "#ffd043",

  goldFrom: "#ffd043",
  goldTo: "#ff8a00",
  goldBorder: "#ffeaa5",
  goldText: "#4e2100",

  // Scenario 2's primary reads blue in the client design — it routes to the
  // wallet, not to a reward.
  blueFrom: "#2f9bff",
  blueTo: "#1565c0",
  blueBorder: "#8fc8ff",

  neutralFrom: "#5b5b6b",
  neutralTo: "#3c3c48",
  neutralBorder: "#7a7a8c",
  neutralText: "#f2f2f7",

  gloss: "rgba(255,255,255,0.38)",
  warning: "#ffb300",

  badgeFrom: "#ffd043",
  badgeTo: "#e27b00",
  checkFill: "#00c853",
  checkBorder: "#00802b",
};

export const PROMO_ASSETS = {
  sunburst: "/assets/missions/promo/sunburst-glow.svg",
  check: "/assets/missions/promo/check.svg",
  chest: "/assets/missions/promo/treasure-chest.webp",
};
