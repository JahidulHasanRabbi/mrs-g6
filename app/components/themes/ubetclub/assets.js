/**
 * Ubetclub theme asset map (exported from the "MRS Theme Engine" Figma file,
 * node group 77:*). Red Chinese-New-Year / God-of-Wealth skin.
 * All files live under public/assets/themes/ubetclub/.
 */
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
    iconCoin: `${BASE}/ui/icon-coin.svg`,
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
    wheel: `${BASE}/spin/wheel.png`,       // full 3x3 grid + center SPIN NOW
    panel: `${BASE}/spin/panel.png`,       // ornate rewards panel
    btnPlay: `${BASE}/spin/btn-play.png`,  // red plaque for Play x10 / x50
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
