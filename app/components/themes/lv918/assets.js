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
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    // Single ornate dialog frame (Figma 154:166) — used whole by Lv918OrnateCard
    // and Lv918Dialog, not sliced.
    dialogFrame: `${BASE}/ui/dialog-frame.webp`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.webp`,
    btnGold: `${BASE}/ui/btn-gold.webp`,
    iconGift: `${BASE}/ui/icon-gift.svg`,
    // Phase 4: the token art is shared across every station.
    iconCoins: PHASE4_ASSETS.token,
    iconParty: `${BASE}/ui/icon-party.svg`,
    jackpotPanel: `${BASE}/ui/jackpot-panel.webp`,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar-union.svg`,
    leaderboard: `${BASE}/nav/icon-leaderboard.webp`,
    hot: `${BASE}/nav/icon-hot.webp`,
    home: `${BASE}/nav/icon-home.webp`,
    profile: `${BASE}/nav/icon-profile.webp`,
    livechat: `${BASE}/nav/icon-livechat.webp`,
  },
  home: {
    bg: `${BASE}/home/bg-throne.webp`,
    king: `${BASE}/home/king.webp`,
    crest: `${BASE}/home/crest-lv918.webp`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.webp`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.webp`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.webp`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.webp`,
    title: `${BASE}/spin/title-lucky-spin.webp`,
    // The wheel is a 3x3 prize grid. The ornate frame is the static border; the
    // eight gem plaques are placed as live slots filled with the API prize items
    // (like the default theme), and the centre SPIN NOW medallion rotates while
    // spinning.
    wheelFrame: `${BASE}/spin/wheel-frame.webp`,
    // Key/file names keep the shared gold/green map shape; the art is the pink
    // crystal "?" tiles (Figma 295:5246 corner variant / 295:5258 edge variant).
    slotGold: `${BASE}/spin/slot-gold.webp`,
    slotGreen: `${BASE}/spin/slot-green.webp`,
    spinNow: `${BASE}/spin/spin-now.webp`,
    btnPlay: `${BASE}/spin/btn-play.webp`,
    panel: `${BASE}/spin/panel-ornate.webp`,
    // Wide ornate frame (Figma 154:692) used as the background behind the
    // Winning Record / Winning List / Terms sections.
    listPanel: `${BASE}/spin/list-panel.webp`,
    // Ornate blue+gold "Loading…" frame from the boot screen (Figma 154:596,
    // node 170:1130) — a dedicated bar, not the reused egg CTA button.
    loadingBar: `${BASE}/spin/loading-bar.webp`,
    // Asset map consumed by the shared <LuckySpinGrid> so the themed wheel runs
    // the exact same spin/selection engine as the default portal — only the art
    // changes. Keys mirror SPIN_ASSETS (background/itemEmptyGold/itemEmptyGreen/
    // centerButton/centerButtonStop). No dedicated stop art, so reuse spin-now.
    grid: {
      background: `${BASE}/spin/wheel-frame.webp`,
      itemEmptyGold: `${BASE}/spin/slot-gold.webp`,
      itemEmptyGreen: `${BASE}/spin/slot-green.webp`,
      centerButton: `${BASE}/spin/spin-now.webp`,
      centerButtonStop: `${BASE}/spin/spin-now.webp`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.webp`,
    bgLoading: `${BASE}/egg/bg-loading.webp`,
    rays: `${BASE}/egg/rays.webp`,
    eggIntact: `${BASE}/egg/egg-intact.webp`,
    eggCracked: `${BASE}/egg/egg-cracked.webp`,
    eggCrown: `${BASE}/egg/egg-crown.webp`,
    btnWide: `${BASE}/egg/btn-wide.webp`,
    iconToken: `${BASE}/egg/icon-token.svg`,
    logo: `${BASE}/home/tile-smash-egg.webp`,
    // Jackpot panel cropped into text-free bands so the real won amount can
    // be rendered as live text between them.
    jackpotRibbon: `${BASE}/egg/jackpot-ribbon.png`,
    jackpotCoins: `${BASE}/egg/jackpot-coins.png`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.webp`,
    bgCrowd: `${BASE}/pk/bg-crowd.webp`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/pk/icon-token-hud.svg`,
    iconShotHud: `${BASE}/pk/icon-shot-hud.svg`,
    prizePanel: `${BASE}/pk/prize-panel.png`,
  },
  profile: {
    title: `${BASE}/profile/title-profile.webp`,
    badgeNum: `${BASE}/profile/badge-num.webp`,
    iconChevron: `${BASE}/profile/icon-chevron.webp`,
    iconStar: `${BASE}/profile/icon-star.png`,
  },
  vip: {
    title: `${BASE}/vip/title-vip.webp`,
    crest: `${BASE}/vip/crest-lion.webp`,
    iconCheck: `${BASE}/vip/icon-check.webp`,
    cardFrame: `${BASE}/ui/frame-crown.webp`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.webp`,
  },
  frames: {
    crown: `${BASE}/ui/frame-crown.webp`,
    scroll: `${BASE}/ui/frame-scroll.webp`,
  },
  // Daily Check-in page (Figma 463:1130). Board geometry, day positions and the
  // reward glyphs are shared across all six skins via
  // app/components/themes/shared/checkinMartSkin.js — only the art differs here.
  checkin: {
    title: `${BASE}/checkin/title-checkin.webp`,
    boardFrame: `${BASE}/checkin/board-frame.webp`,
    dayCard: `${BASE}/checkin/day-card.webp`,
    chest: `${BASE}/checkin/chest-day7.webp`,
  },
  // Mart page (Figma 468:2857). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.webp`,
    itemFrame: `${BASE}/mart/item-frame.webp`,
    btnRedeem: `${BASE}/mart/btn-redeem.webp`,
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
