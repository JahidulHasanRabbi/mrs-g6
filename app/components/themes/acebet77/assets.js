/**
 * Acebet77 theme asset map (exported from the "MRS Theme Engine" Figma file).
 * All files live under public/assets/themes/acebet77/.
 */
const BASE = '/assets/themes/acebet77';

export const ACEBET_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    dialogFrame: `${BASE}/ui/dialog-frame.png`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.png`,
    // 3-slice of the ornate frame: fixed crown top + vertically-stretchable
    // rail middle + fixed flourish bottom, so the frame grows with content
    // without the heading riding into the crown.
    frameTop: `${BASE}/ui/frame-top.png`,
    frameMid: `${BASE}/ui/frame-mid.png`,
    frameBottom: `${BASE}/ui/frame-bottom.png`,
    btnGold: `${BASE}/ui/btn-gold.png`,
    iconGift: `${BASE}/ui/icon-gift.svg`,
    iconCoins: `${BASE}/ui/icon-coins.svg`,
    iconParty: `${BASE}/ui/icon-party.svg`,
    jackpotPanel: `${BASE}/ui/jackpot-panel.png`,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar-union.svg`,
    leaderboard: `${BASE}/nav/icon-leaderboard.png`,
    hot: `${BASE}/nav/icon-hot.png`,
    home: `${BASE}/nav/icon-home.png`,
    profile: `${BASE}/nav/icon-profile.png`,
    livechat: `${BASE}/nav/icon-livechat.png`,
  },
  home: {
    bg: `${BASE}/home/bg-throne.png`,
    king: `${BASE}/home/king.png`,
    crest: `${BASE}/home/crest-acebet77.png`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.png`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.png`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.png`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.png`,
    title: `${BASE}/spin/title-lucky-spin.png`,
    // Updated Figma (15:195): the wheel is a 3x3 prize grid. The ornate frame
    // is the static border; the eight gem plaques are placed as live slots and
    // filled with the API prize items (like the default theme), and the centre
    // SPIN NOW medallion rotates while spinning (Figma 30:118).
    wheelFrame: `${BASE}/spin/wheel-frame.png`,
    slotGold: `${BASE}/spin/slot-gold.png`,
    slotGreen: `${BASE}/spin/slot-green.png`,
    spinNow: `${BASE}/spin/spin-now.png`,
    btnPlay: `${BASE}/spin/btn-play.png`,
    panel: `${BASE}/spin/panel-ornate.png`,
    // Asset map consumed by the shared <LuckySpinGrid> so the themed wheel runs
    // the exact same spin/selection engine as the default portal — only the art
    // changes. Keys mirror SPIN_ASSETS (background/itemEmptyGold/itemEmptyGreen/
    // centerButton/centerButtonStop). No dedicated stop art, so reuse spin-now.
    grid: {
      background: `${BASE}/spin/wheel-frame.png`,
      itemEmptyGold: `${BASE}/spin/slot-gold.png`,
      itemEmptyGreen: `${BASE}/spin/slot-green.png`,
      centerButton: `${BASE}/spin/spin-now.png`,
      centerButtonStop: `${BASE}/spin/spin-now.png`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.png`,
    bgLoading: `${BASE}/egg/bg-loading.png`,
    rays: `${BASE}/egg/rays.png`,
    eggIntact: `${BASE}/egg/egg-intact.png`,
    eggCracked: `${BASE}/egg/egg-cracked.png`,
    eggCrown: `${BASE}/egg/egg-crown.png`,
    btnWide: `${BASE}/egg/btn-wide.png`,
    iconToken: `${BASE}/egg/icon-token.svg`,
    logo: `${BASE}/home/tile-smash-egg.png`,
    // Jackpot panel cropped into text-free bands so the real won amount can
    // be rendered as live text between them (the source art had "RM 8,888"
    // baked in — Figma node 63:2082).
    jackpotRibbon: `${BASE}/egg/jackpot-ribbon.png`,
    jackpotCoins: `${BASE}/egg/jackpot-coins.png`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.png`,
    bgCrowd: `${BASE}/pk/bg-crowd.png`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/pk/icon-token-hud.svg`,
    iconShotHud: `${BASE}/pk/icon-shot-hud.svg`,
    prizePanel: `${BASE}/pk/prize-panel.png`,
  },
};

// Shared palette (from Figma inspection)
export const ACEBET_COLORS = {
  gold: '#e9af41',
  goldBright: '#f2ba33',
  cream: '#fff6df',
  creamMuted: '#eae2cf',
  sand: '#d0c6ab',
  tokenYellow: '#ffe16d',
  dark: '#050505',
};
