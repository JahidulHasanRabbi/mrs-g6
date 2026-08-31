/**
 * EP369 theme asset map (exported from the "MRS Theme Engine" Figma file,
 * node group 101:*). Enchanted emerald-forest skin.
 * All files live under public/assets/themes/ep369/.
 */
import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/ep369';

export const EP369_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    // Ornate green-gold dialog frame, stretched via backgroundSize:100% 100%
    // with percentage padding (same technique as the ubetclub frame).
    frame: `${BASE}/ui/frame-full.webp`,
    btnGreen: `${BASE}/ui/btn-green.webp`, // green plaque, gold text
    btnGold: `${BASE}/ui/btn-gold.webp`,   // gold plaque, dark text
    iconParty: `${BASE}/ui/icon-party.svg`,
    // Phase 4: the token art is shared across every station.
    iconCoin: PHASE4_ASSETS.token,
  },
  nav: {
    bar: `${BASE}/nav/nav-bar.svg`,
    // Medallions carry their labels baked in (Figma hides the text nodes).
    leaderboard: `${BASE}/nav/icon-leaderboard.webp`,
    hot: `${BASE}/nav/icon-hot.webp`,
    home: `${BASE}/nav/icon-home.webp`,
    profile: `${BASE}/nav/icon-profile.webp`,
    livechat: `${BASE}/nav/icon-livechat.webp`,
  },
  home: {
    bg: `${BASE}/home/bg-menu.webp`,
    fae: `${BASE}/home/fae.webp`,
    crest: `${BASE}/home/crest.webp`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.webp`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.webp`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.webp`,
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
    panel: `${BASE}/spin/panel.webp`,
    btnPlay: `${BASE}/spin/btn-play.webp`,
    // Decomposed pieces (cropped from wheel.png) fed to the shared
    // <LuckySpinGrid> so the themed wheel runs the exact same spin/selection
    // engine as the default portal. Keys mirror SPIN_ASSETS.
    grid: {
      background: `${BASE}/spin/grid-frame.webp`,
      // Theme-owned emerald "?" tiles (Figma 290:2893 corner variant /
      // 290:2894 edge variant). Key/file names keep the shared gold/green
      // map shape.
      itemEmptyGold: `${BASE}/spin/slot-gold.webp`,
      itemEmptyGreen: `${BASE}/spin/slot-green.webp`,
      centerButton: `${BASE}/spin/center.webp`,
      centerButtonStop: `${BASE}/spin/center.webp`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.webp`,
    rays: `${BASE}/egg/rays.webp`,
    eggIntact: `${BASE}/egg/egg-intact.webp`,
    eggCracked: `${BASE}/egg/egg-cracked.webp`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.webp`,
    bgCrowd: `${BASE}/pk/bg-stadium.webp`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
  },
  profile: {
    title: `${BASE}/profile/title-profile.webp`,
    badgeNum: `${BASE}/profile/badge-num.webp`,
    iconChevron: `${BASE}/profile/icon-chevron.webp`,
    iconStar: `${BASE}/profile/icon-star.svg`,
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
  // Daily Check-in page (Figma 463:625). Board geometry, day positions and the
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
  // Mart page (Figma 468:2543). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.webp`,
    itemFrame: `${BASE}/mart/item-frame.webp`,
    btnRedeem: `${BASE}/mart/btn-redeem.webp`,
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
