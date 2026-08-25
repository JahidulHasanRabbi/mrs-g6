/**
 * Lv918 theme asset map (exported from the "MRS Theme Engine (Copy)" Figma
 * file, node group 154:*). Celestial blue "crystal kingdom" skin — sky-blue and
 * cloud backdrops, white-marble + gold ornaments, sapphire-blue gems.
 * Brand: KingGroup44 (in-screen plaques read "Lv918").
 * All files live under public/assets/themes/lv918/.
 *
 * Key shape mirrors acebet77's map exactly so the mirrored components resolve
 * the same keys — only the art + palette differ.
 */
import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/lv918';

export const LV918_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.png`,
    info: `${BASE}/ui/icon-info.png`,
    // Single ornate dialog frame (Figma 154:166) — used whole by Lv918OrnateCard
    // and Lv918Dialog, not sliced.
    dialogFrame: `${BASE}/ui/dialog-frame.png`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.png`,
    btnGold: `${BASE}/ui/btn-gold.png`,
    iconGift: `${BASE}/ui/icon-gift.svg`,
    // Phase 4: the token art is shared across every station.
    iconCoins: PHASE4_ASSETS.token,
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
    crest: `${BASE}/home/crest-lv918.png`,
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
    // Key/file names keep the shared gold/green map shape; the art is the pink
    // crystal "?" tiles (Figma 295:5246 corner variant / 295:5258 edge variant).
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
  profile: {
    title: `${BASE}/profile/title-profile.png`,
    badgeNum: `${BASE}/profile/badge-num.png`,
    iconChevron: `${BASE}/profile/icon-chevron.png`,
    iconStar: `${BASE}/profile/icon-star.png`,
  },
  vip: {
    title: `${BASE}/vip/title-vip.png`,
    crest: `${BASE}/vip/crest-lion.png`,
    iconCheck: `${BASE}/vip/icon-check.png`,
    cardFrame: `${BASE}/ui/frame-crown.png`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.png`,
  },
  frames: {
    crown: `${BASE}/ui/frame-crown.png`,
    scroll: `${BASE}/ui/frame-scroll.png`,
  },
  // Daily Check-in page (Figma 463:1130). Board geometry, day positions and the
  // reward glyphs are shared across all six skins via
  // app/components/themes/shared/checkinMartSkin.js — only the art differs here.
  checkin: {
    title: `${BASE}/checkin/title-checkin.png`,
    boardFrame: `${BASE}/checkin/board-frame.png`,
    dayCard: `${BASE}/checkin/day-card.png`,
    chest: `${BASE}/checkin/chest-day7.png`,
  },
  // Mart page (Figma 468:2857). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.png`,
    itemFrame: `${BASE}/mart/item-frame.png`,
    btnRedeem: `${BASE}/mart/btn-redeem.png`,
  },
};

// Shared palette (from Figma inspection of the 154:* frames). Blue-tinted mirror
// of the acebet77 palette — same semantic roles, celestial colours.
export const LV918_COLORS = {
  gold: '#e8b53a',
  goldBright: '#f7c752',
  cream: '#fff0f7',
  creamMuted: '#f3d3e4',
  sand: '#e0b4cc',
  tokenYellow: '#ffe16d',
  dark: '#2a0a1f',
  // "Ink" tones for text on light-pink panel interiors. Near-black so they
  // stay clearly legible against the bright pink background.
  inkStrong: '#1a0008', // primary row text (names, prizes, terms)
  ink: '#220010',       // emphasis (winner / record name)
  inkMuted: '#3d0a20',  // dates and secondary meta
  inkSoft: '#30081a',   // empty-state placeholders
  inkGold: '#5a3a02',   // gold accent that still needs to read on pink
  // Deep-rose heading tones — the "royal pink" counterpart to the other
  // themes' gold headings, dark enough to clear contrast on the pink interiors
  // where a gold/cream heading disappears.
  inkTitle: '#6b0a32',  // panel/modal headings (matches the profile card rose)
  inkLabel: '#8d2a55',  // column headers, pagination, secondary labels
  pinkHot: '#f34f89',
  purple: '#984291',
  progressTrack: '#51340c',
};
