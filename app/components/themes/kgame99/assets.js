/**
 * Kgame99 theme asset map (exported from the "MRS Theme Engine (Copy)" Figma
 * file, node group 154:*). Celestial blue "crystal kingdom" skin — sky-blue and
 * cloud backdrops, white-marble + gold ornaments, sapphire-blue gems.
 * Brand: KingGroup44 (in-screen plaques read "Kgame99").
 * All files live under public/assets/themes/kgame99/.
 *
 * Key shape mirrors acebet77's map exactly so the mirrored components resolve
 * the same keys — only the art + palette differ.
 */
const BASE = '/assets/themes/kgame99';

export const KGAME99_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    // Single ornate dialog frame (Figma 154:166) — used whole by KgameOrnateCard
    // and KgameDialog, not sliced.
    dialogFrame: `${BASE}/ui/dialog-frame.png`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.png`,
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
    crest: `${BASE}/home/crest-kgame99.png`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.png`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.png`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.png`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.png`,
    title: `${BASE}/spin/title-lucky-spin.png`,
    // The wheel is a 3x3 prize grid. The ornate frame is the static border; the
    // eight gem plaques are placed as live slots filled with the API prize items
    // (like the default theme), and the centre SPIN NOW medallion rotates while
    // spinning.
    wheelFrame: `${BASE}/spin/wheel-frame.png`,
    slotGold: `${BASE}/spin/slot-gold.png`,
    slotGreen: `${BASE}/spin/slot-green.png`,
    spinNow: `${BASE}/spin/spin-now.png`,
    btnPlay: `${BASE}/spin/btn-play.png`,
    panel: `${BASE}/spin/panel-ornate.png`,
    // Wide ornate frame (Figma 154:692) used as the background behind the
    // Winning Record / Winning List / Terms sections.
    listPanel: `${BASE}/spin/list-panel.png`,
    // Ornate blue+gold "Loading…" frame from the boot screen (Figma 154:596,
    // node 170:1130) — a dedicated bar, not the reused egg CTA button.
    loadingBar: `${BASE}/spin/loading-bar.png`,
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
    // be rendered as live text between them.
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

// Shared palette (from Figma inspection of the 154:* frames). Blue-tinted mirror
// of the acebet77 palette — same semantic roles, celestial colours.
export const KGAME99_COLORS = {
  gold: '#e2b24a',
  goldBright: '#f5c451',
  cream: '#eaf3ff',
  creamMuted: '#cfe0f2',
  sand: '#a7c3e2',
  tokenYellow: '#ffe16d',
  dark: '#0a1a2f',
};
