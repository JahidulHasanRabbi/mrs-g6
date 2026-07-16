/**
 * EP369 theme asset map (exported from the "MRS Theme Engine" Figma file,
 * node group 101:*). Enchanted emerald-forest skin.
 * All files live under public/assets/themes/ep369/.
 */
const BASE = '/assets/themes/ep369';

export const EP369_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    // Ornate green-gold dialog frame, stretched via backgroundSize:100% 100%
    // with percentage padding (same technique as the ubetclub frame).
    frame: `${BASE}/ui/frame-full.png`,
    btnGreen: `${BASE}/ui/btn-green.png`, // green plaque, gold text
    btnGold: `${BASE}/ui/btn-gold.png`,   // gold plaque, dark text
    iconParty: `${BASE}/ui/icon-party.svg`,
    iconCoin: `${BASE}/ui/icon-coin.svg`,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar.svg`,
    // Medallions carry their labels baked in (Figma hides the text nodes).
    leaderboard: `${BASE}/nav/icon-leaderboard.png`,
    hot: `${BASE}/nav/icon-hot.png`,
    home: `${BASE}/nav/icon-home.png`,
    profile: `${BASE}/nav/icon-profile.png`,
    livechat: `${BASE}/nav/icon-livechat.png`,
  },
  home: {
    bg: `${BASE}/home/bg-menu.png`,
    fae: `${BASE}/home/fae.png`,
    crest: `${BASE}/home/crest.png`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.png`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.png`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.png`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.png`,
    title: `${BASE}/spin/title-lucky-spin.png`,
    wheel: `${BASE}/spin/wheel.png`,
    panel: `${BASE}/spin/panel.png`,
    btnPlay: `${BASE}/spin/btn-play.png`,
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.png`,
    rays: `${BASE}/egg/rays.png`,
    eggIntact: `${BASE}/egg/egg-intact.png`,
    eggCracked: `${BASE}/egg/egg-cracked.png`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.png`,
    bgCrowd: `${BASE}/pk/bg-stadium.png`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
  },
};

// Shared palette (from Figma inspection of the 101:* frames).
export const EP369_COLORS = {
  gold: '#e9af41',
  goldBright: '#f2c36b',
  goldDeep: '#dd8f1f',
  cream: '#fff6df',
  creamMuted: '#eaf0dc',
  sand: '#bcd0a8',       // muted leaf-green body text
  greenPanel: '#0d3d1c',
  greenDeep: '#093017',  // frame / bar base
  greenDark: '#001002',  // near-black green
  tokenYellow: '#ffe16d',
  dark: '#04140a',
};
