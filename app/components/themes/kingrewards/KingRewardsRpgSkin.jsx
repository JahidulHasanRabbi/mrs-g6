"use client";

// King Rewards dresses /avatar (Figma 718:15129) and /boss-war (891:8933) in
// CSS glass rather than frame art, so most of this skin is surface styles.

import { buildRpgSkin, RpgSkinProvider } from "../../rpg/rpgSkin";
import { THEME_IDS } from "../../../config/themes";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";
import { WAR_FRAMES } from "./warFrames.generated";

const RPG = "/assets/themes/kingrewards/rpg";
const WAR = "/assets/themes/kingrewards/war";

const EDGE = "#fff066";
const NAVY = "#003d89";
// Figma "KR Default" inner shadow, then the two glass insets.
const INSET_A = "inset -2px 8px 8px 0 rgba(165,196,255,0.25)";
const INSET_B = "inset 0 4px 16px 0 rgba(255,255,255,0.15)";
const INSET_C = "inset 0 4px 16px 4px rgba(255,255,255,0.15)";
const BLUR = { backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" };
const BAR_FILL = "linear-gradient(155deg, #ffc94d 0%, #ff8a50 100%)";

// Boss War recipes from the comp (spec "PANEL" / "CARD" / "TICKER" / "TAB").
const PANEL = { background: NAVY, ...BLUR, borderRadius: 16, overflow: "hidden", boxShadow: `${INSET_C}, ${INSET_B}` };
const CARD = { background: "rgba(255,255,255,0.10)", border: `1px solid ${EDGE}`, borderRadius: 12, boxShadow: INSET_A };
const TICKER = { background: NAVY, borderRadius: 16, boxShadow: INSET_A };
const tab = (background) => ({ background, border: `1px solid ${EDGE}`, borderRadius: 8, padding: "8px 4px", boxShadow: `${INSET_A}, ${INSET_B}` });
const TAB_LABEL = { fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: "#f9d063" };

const ASSETS = {
  egg: { bg: `${RPG}/bg.webp`, btnWide: KR_ASSETS.ui.btnGold },
  spin: { panel: null },
  ui: { hamburger: KR_ASSETS.ui.hamburger, info: KR_ASSETS.ui.info },
  nav: { bar: null, home: null },
  rpg: {
    iconBase: `${RPG}/icon-base.webp`,
    iconHeroItem: `${RPG}/icon-hero-item.webp`,
    iconChallenge: `${RPG}/icon-challenge.webp`,
    iconMission: `${RPG}/icon-mission.webp`,
    tileFrame: null,
  },
  // No war.bg: the shell dims a backgroundImage, and the comp's hall is undimmed.
  war: { attackBtn: KR_ASSETS.ui.btnGold, pill: KR_ASSETS.ui.btnGold },
};

const COLORS = {
  gold: "#f2b229",
  goldBright: "#f9d063",
  cream: "#efeaff",
  dark: "#021a3f",
  sand: "#b9aee8",
  creamMuted: "#b9aee8",
  progressTrack: "rgba(255,255,255,0.1)",
};

const SKIN = buildRpgSkin(THEME_IDS.KINGREWARDS, ASSETS, COLORS, {
  overlay: "none",
  fonts: { display: KR_FONT, number: KR_FONT },
  chrome: { bar: "transparent", barBorder: "transparent", barShadow: "none", showTitle: false, iconSize: 40 },
  nav: {
    style: "glass",
    labelFont: KR_FONT,
    label: "#f9d063",
    labelActive: EDGE,
    glass: {
      bar: { background: "rgba(0,71,162,0.65)", ...BLUR, boxShadow: INSET_B },
      active: { background: "rgba(255,255,255,0.2)", boxShadow: INSET_A },
      labelGradient: KR_GRADIENTS.gold,
    },
  },
  hud: {
    border: "rgba(255,240,102,0.25)",
    badgeBg: "rgba(0,77,201,0.3)",
    badgeBorder: EDGE,
    badgeLabel: "#f9d063",
    expLabel: "#b9aee8",
    expGradient: "linear-gradient(153deg, #ffc94d 0%, #ff8a50 100%)",
    ringBg: NAVY,
    ringShadow: INSET_A,
  },
  // Dark face, gold rim and pips — the inverse of the station dice.
  dice: {
    face: "#1b1240",
    faceShadow: "inset 0 0 0 1.8px #f2b229",
    pip: "#f2b229",
    pipShadow: "none",
    panel: { background: "rgba(0,61,137,0.5)", ...BLUR, border: `1px solid ${EDGE}`, borderRadius: 16, boxShadow: INSET_B, padding: "20px 16px 4px", marginBottom: 4 },
  },
  panel: { fill: NAVY, border: EDGE, fillDark: NAVY, borderDark: EDGE, css: { boxShadow: INSET_A, ...BLUR } },
  tile: {
    css: { background: "rgba(0,77,201,0.3)", borderColor: EDGE, borderStyle: "solid", borderRadius: 8, boxShadow: "none" },
    pill: {
      empty: { background: "rgba(246,228,92,0.2)", color: "#c4b882" },
      equipped: { background: "rgba(255,189,78,0.2)", color: "#ffa000" },
    },
    labelEquipped: "#ffbd4e",
    cell: { background: "rgba(255,255,255,0.3)", borderColor: EDGE, borderStyle: "solid", borderRadius: 8 },
  },
  cta: { font: KR_FONT, color: "#001e4a", height: [52, 46], size: [16, 15], weight: 600 },
  bar: { track: "rgba(255,255,255,0.1)", fill: BAR_FILL },
  modal: { bg: `${NAVY}f7`, border: EDGE, shadow: `${INSET_A}, 0 16px 50px rgba(0,0,0,0.5)` },
  c: {
    text: "#efeaff",
    textDim: "#b9aee8",
    title: "#efeaff",
    titleShadow: "none",
    titleGradient: KR_GRADIENTS.gold,
    value: "#ffc94d",
    slotLabel: "#a89f5f",
    slotEmpty: "#c4b882",
    accent: "#f9d063",
    accentSoft: "#f2b229",
    edge: "#f2b229",
    edgeSoft: "rgba(255,240,102,0.5)",
    rule: "rgba(255,240,102,0.25)",
    inset: NAVY,
    rowIdle: NAVY,
    rowActive: "#0b4a9c",
    rowLocked: NAVY,
    muted: "rgba(255,255,255,0.3)",
    caption: "#b9aee8",
    sectionLabel: "#f9d063",
    footnote: "#f9d063",
    labelMuted: "rgba(249,208,99,0.5)",
  },
  war: {
    ...WAR_FRAMES,
    font: KR_FONT,
    titleGradient: KR_GRADIENTS.gold,
    titleBare: true,
    panel: { ...PANEL, padding: 8 },
    card: { frame: null, pad: "12px", css: CARD },
    statCard: { frame: null, pad: "8px", css: { ...PANEL, gap: 8 } },
    statCell: { ...CARD, padding: 8 },
    table: { frame: null, pad: "8px 0", css: CARD },
    row: { frame: null, pad: "8px 16px", css: CARD },
    plaque: { frame: null, pad: "16px 8px", css: TICKER },
    tab: { css: { on: tab("rgba(255,255,255,0.30)"), off: tab("rgba(255,255,255,0.08)"), label: TAB_LABEL } },
    chip: {
      css: { ...tab("rgba(0,61,137,0.5)"), width: "min(158px, 42%)" },
      label: TAB_LABEL,
      typeIcon: `${WAR}/icon-crown.svg`,
      timerIcon: `${WAR}/icon-clock.svg`,
    },
    attackLabelBias: 0,
    buttonInk: "#001e4a",
    namePlate: { art: `${WAR}/name-plate.webp`, fill: "rgba(0,61,137,0.5)" },
    rewardPlates: {
      common: `${WAR}/reward-badge-red.webp`,
      rare: `${WAR}/reward-badge-red.webp`,
      premium: `${WAR}/reward-badge-green.webp`,
      epic: `${WAR}/reward-badge-crimson.webp`,
      legendary: `${WAR}/reward-badge-pink.webp`,
    },
    rankCoin: { width: 24, height: 24, background: KR_GRADIENTS.gold, border: "1px solid #f2b229", boxShadow: "0 0 20px rgba(255,140,0,0.5)", color: "#001e4a" },
    meRow: "rgba(242,178,41,0.30)",
    defeatedStamp: { icon: `${WAR}/icon-skull.svg` },
    icons: {
      ap: `${WAR}/icon-damage.webp`,
      plus: `${WAR}/icon-plus.webp`,
      participants: `${WAR}/icon-participants.webp`,
      damage: `${WAR}/icon-damage.webp`,
      total: `${WAR}/icon-total.webp`,
      crown: null,
    },
    earnIcons: {
      deposit: `${WAR}/earn-deposit.webp`,
      missions: `${WAR}/earn-missions.webp`,
      minigames: `${WAR}/earn-mini-games.webp`,
      checkin: `${WAR}/earn-check-in.webp`,
    },
    earnTile: { frame: null, css: { ...CARD, padding: 8 } },
    hp: { track: "rgba(0,0,0,0.75)", border: EDGE, fill: KR_GRADIENTS.goldBar },
    ink: { text: "#fff2d4", meta: "#bfbfbf", value: "#f2b229", dmg: "#ffae00", crit: "#59d827" },
  },
});

export default function KingRewardsRpgSkin({ children }) {
  return <RpgSkinProvider skin={SKIN}>{children}</RpgSkinProvider>;
}
