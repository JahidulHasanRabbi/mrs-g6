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
import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/kgame99';

export const KGAME99_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    // Single ornate dialog frame (Figma 154:166) — used whole by KgameOrnateCard
    // and KgameDialog, not sliced.
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
    crest: `${BASE}/home/crest-kgame99.webp`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.webp`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.webp`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.webp`,
  },
  // Homepage game list badges (Figma 544:* — one nine-badge sheet per skin).
  modules: {
    luckySpin: `${BASE}/modules/lucky-spin.webp`,
    penaltyKick: `${BASE}/modules/penalty-kick.webp`,
    avatar: `${BASE}/modules/avatar.webp`,
    smashEgg: `${BASE}/modules/smash-egg.webp`,
    leaderboard: `${BASE}/modules/leaderboard.webp`,
    missions: `${BASE}/modules/missions.webp`,
    vip: `${BASE}/modules/vip.webp`,
    dailyCheckin: `${BASE}/modules/daily-checkin.webp`,
    mart: `${BASE}/modules/mart.webp`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.webp`,
    title: `${BASE}/spin/title-lucky-spin.webp`,
    // The wheel is a 3x3 prize grid. The ornate frame is the static border; the
    // eight gem plaques are placed as live slots filled with the API prize items
    // (like the default theme), and the centre SPIN NOW medallion rotates while
    // spinning.
    wheelFrame: `${BASE}/spin/wheel-frame.webp`,
    // Key/file names keep the shared gold/green map shape; the art is the blue
    // crystal "?" tiles (Figma 293:4409 corner variant / 293:4410 edge variant).
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
    jackpotRibbon: `${BASE}/egg/jackpot-ribbon.webp`,
    jackpotCoins: `${BASE}/egg/jackpot-coins.webp`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.webp`,
    bgCrowd: `${BASE}/pk/bg-crowd.webp`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/pk/icon-token-hud.svg`,
    iconShotHud: `${BASE}/pk/icon-shot-hud.svg`,
    prizePanel: `${BASE}/pk/prize-panel.webp`,
  },
  profile: {
    title: `${BASE}/profile/title-profile.webp`,
    badgeNum: `${BASE}/profile/badge-num.webp`,
    iconChevron: `${BASE}/profile/icon-chevron.webp`,
    iconStar: `${BASE}/profile/icon-star.webp`,
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
  // Daily Check-in page (Figma 463:875). Board geometry, day positions and the
  // reward glyphs are shared across all six skins via
  // app/components/themes/shared/checkinMartSkin.js — only the art differs here.
  // Avatar mini-game nav crests (Figma a83SqWgqIGNF6dJD1aP13w). Every other RPG
  // surface is dressed with art already listed above.
  rpg: {
    iconBase: `${BASE}/rpg/icon-base.webp`,
    iconHeroItem: `${BASE}/rpg/icon-hero-item.webp`,
    iconChallenge: `${BASE}/rpg/icon-challenge.webp`,
    iconMission: `${BASE}/rpg/icon-mission.webp`,
    // Downscaled from checkin/board-frame.webp — the chip renders at ~73px,
    // so the full board bitmap was ~200KB of waste per themed session.
    tileFrame: `${BASE}/rpg/tile-frame.webp`,
    iconPortalHome: `${BASE}/rpg/icon-portal-home.webp`,
  },
  checkin: {
    title: `${BASE}/checkin/title-checkin.webp`,
    boardFrame: `${BASE}/checkin/board-frame.webp`,
    dayCard: `${BASE}/checkin/day-card.webp`,
    chest: `${BASE}/checkin/chest-day7.webp`,
  },
  // Mart page (Figma 469:2994). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.webp`,
    itemFrame: `${BASE}/mart/item-frame.webp`,
    btnRedeem: `${BASE}/mart/btn-redeem.webp`,
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
  navyBlue: '#0a4e9e',
  navyPanel: '#0f2a4a',
  navyDeep: '#061527',
  lightBlue: '#dbecff',
  progressTrack: '#51340c',
};
