/**
 * Ubetclub theme asset map (exported from the "MRS Theme Engine" Figma file,
 * node group 77:*). Red Chinese-New-Year / God-of-Wealth skin.
 * All files live under public/assets/themes/ubetclub/.
 */
import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/ubetclub';

export const UBET_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    // Ornate red-gold dialog frame. Rendered via backgroundSize:100% 100% with
    // percentage padding so content always sits inside the red interior and the
    // crown/jewel ornaments scale with height (the Figma dialogs stretch it too).
    frame: `${BASE}/ui/frame-full.png`,
    btnRed: `${BASE}/ui/btn-red.png`,   // red plaque, gold text
    btnGold: `${BASE}/ui/btn-gold.png`, // gold plaque, dark text
    iconParty: `${BASE}/ui/icon-party.svg`,
    // Phase 4: the token art is shared across every station.
    iconCoin: PHASE4_ASSETS.token,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar.svg`,
    leaderboard: `${BASE}/nav/icon-leaderboard.png`,
    hot: `${BASE}/nav/icon-hot.png`,
    home: `${BASE}/nav/icon-home.png`,
    profile: `${BASE}/nav/icon-profile.png`,
    livechat: `${BASE}/nav/icon-livechat.png`,
  },
  home: {
    bg: `${BASE}/home/bg-menu.png`,
    godWealth: `${BASE}/home/god-wealth.png`,
    crest: `${BASE}/home/crest.png`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.png`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.png`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.png`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.png`,
    title: `${BASE}/spin/title-lucky-spin.png`,
    panel: `${BASE}/spin/panel.png`,       // ornate rewards panel
    btnPlay: `${BASE}/spin/btn-play.png`,  // red plaque for Play x10 / x50
    // Decomposed pieces (cropped from wheel.png) fed to the shared
    // <LuckySpinGrid> so the themed wheel runs the exact same spin/selection
    // engine as the default portal. Keys mirror SPIN_ASSETS.
    grid: {
      background: `${BASE}/spin/grid-frame.png`,
      // Theme-owned red crystal "?" tiles (Figma 288:2253 corner variant /
      // 288:2254 edge variant). Key/file names keep the shared gold/green
      // map shape.
      itemEmptyGold: `${BASE}/spin/slot-gold.png`,
      itemEmptyGreen: `${BASE}/spin/slot-green.png`,
      centerButton: `${BASE}/spin/center.png`,
      centerButtonStop: `${BASE}/spin/center.png`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.png`,
    rays: `${BASE}/egg/rays.png`,     // rayed glow behind the egg
    eggIntact: `${BASE}/egg/egg-intact.png`,
    eggCracked: `${BASE}/egg/egg-cracked.png`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.png`,
    bgCrowd: `${BASE}/pk/bg-stadium.png`, // wide (loading/launch) reuses the stadium art
    iconBall: `${BASE}/pk/icon-ball.svg`,
  },
  // Profile / Terms / VIP page assets (Figma nodes 77:2702, 288:1619, 288:2060,
  // 289:2298). Title plaques carry their labels baked in; the two frames
  // (crown + scroll) are theme-neutral and reused across pages exactly like
  // the acebet77 counterparts.
  profile: {
    title: `${BASE}/profile/title-profile.png`,      // "My Profile" plaque
    badgeNum: `${BASE}/profile/badge-num.png`,       // circular numbered bullet
    iconStar: `${BASE}/profile/icon-star.svg`,       // gold star next to level name
    iconArrow: `${BASE}/profile/icon-arrow.svg`,     // pagination arrow (token history)
  },
  vip: {
    title: `${BASE}/vip/title-vip.png`,       // "VIP Details" plaque
    crest: `${BASE}/vip/crest-lion.png`,      // lion crown crest above benefit list
    iconCheck: `${BASE}/vip/icon-check.png`,  // gold tick beside each benefit row
    // The VIP card frame the shared PrivilegesCard renders as the tier
    // background when the theme is active. Same file as frames.crown — kept
    // as a dedicated key so the intent reads clearly from PrivilegesCard.
    cardFrame: `${BASE}/ui/frame-crown.png`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.png`,      // "Terms & Condition" plaque
  },
  // Two ornate frames reused across the acebet77-equivalent surfaces:
  // - frameCrown: red crown-topped ornate frame. Used for terms body, VIP
  //   progress card on the profile, and the VIP details benefit card.
  // - frameScroll: red scroll frame with rolled tops/bottoms. Used for the
  //   Edit Profiles list and the Token History modal.
  frames: {
    crown: `${BASE}/ui/frame-crown.png`,
    scroll: `${BASE}/ui/frame-scroll.png`,
  },
  // Daily Check-in page (Figma 462:403). Board geometry, day positions and the
  // reward glyphs are shared across all six skins via
  // app/components/themes/shared/checkinMartSkin.js — only the art differs here.
  checkin: {
    title: `${BASE}/checkin/title-checkin.png`,
    boardFrame: `${BASE}/checkin/board-frame.png`,
    dayCard: `${BASE}/checkin/day-card.png`,
    chest: `${BASE}/checkin/chest-day7.png`,
  },
  // Mart page (Figma 468:2192). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.png`,
    itemFrame: `${BASE}/mart/item-frame.png`,
    btnRedeem: `${BASE}/mart/btn-redeem.png`,
  },
};

// Shared palette (from Figma inspection of the 77:* frames).
export const UBET_COLORS = {
  gold: '#e9af41',       // nav labels, headings
  goldBright: '#f2c36b', // highlight edge of gold gradient
  goldDeep: '#dd8f1f',   // deep edge of gold gradient
  cream: '#fff6df',      // light text on red
  creamMuted: '#f0e2c4',
  sand: '#d8c9a0',       // muted body text
  redBright: '#c11e1e',
  redDeep: '#480e0f',    // bar / panel base
  redDark: '#18080a',    // near-black red
  tokenYellow: '#ffe16d', // "you won" amount / token counts
  dark: '#1a0505',
};
