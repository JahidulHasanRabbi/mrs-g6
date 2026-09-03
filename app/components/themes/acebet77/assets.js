/**
 * Acebet77 theme asset map (exported from the "MRS Theme Engine" Figma file).
 * All files live under public/assets/themes/acebet77/.
 */
import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/acebet77';

export const ACEBET_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    dialogFrame: `${BASE}/ui/dialog-frame.webp`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.webp`,
    // 3-slice of the ornate frame: fixed crown top + vertically-stretchable
    // rail middle + fixed flourish bottom, so the frame grows with content
    // without the heading riding into the crown.
    frameTop: `${BASE}/ui/frame-top.webp`,
    frameMid: `${BASE}/ui/frame-mid.webp`,
    frameBottom: `${BASE}/ui/frame-bottom.webp`,
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
    crest: `${BASE}/home/crest-acebet77.webp`,
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
    // Updated Figma (15:195): the wheel is a 3x3 prize grid. The ornate frame
    // is the static border; the eight gem plaques are placed as live slots and
    // filled with the API prize items (like the default theme), and the centre
    // SPIN NOW medallion rotates while spinning (Figma 30:118).
    wheelFrame: `${BASE}/spin/wheel-frame.webp`,
    // Key/file names keep the shared gold/green map shape; the art is the black
    // onyx "?" tiles (Figma 283:142 corner variant / 283:143 edge variant).
    slotGold: `${BASE}/spin/slot-gold.webp`,
    slotGreen: `${BASE}/spin/slot-green.webp`,
    spinNow: `${BASE}/spin/spin-now.webp`,
    btnPlay: `${BASE}/spin/btn-play.webp`,
    panel: `${BASE}/spin/panel-ornate.webp`,
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
    // be rendered as live text between them (the source art had "RM 8,888"
    // baked in — Figma node 63:2082).
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
  // Profile / Terms / VIP page assets (Figma nodes 285:*, 282:*, 289:2399).
  // Title plaques carry their labels baked in; frames are theme-neutral so any
  // page's body sits inside the same ornate art.
  profile: {
    title: `${BASE}/profile/title-profile.webp`,      // "My Profile" plaque
    badgeNum: `${BASE}/profile/badge-num.webp`,       // circular numbered bullet (1..6)
    iconChevron: `${BASE}/profile/icon-chevron.webp`, // ">" chevron in each row
    iconStar: `${BASE}/profile/icon-star.svg`,       // gold star next to level name
    iconArrow: `${BASE}/profile/icon-arrow.svg`,     // pagination arrow (token history)
  },
  vip: {
    // Assets swapped for VIP: the title banner AND the tier card frame that
    // <PrivilegesCard> renders behind its content. The gem chain and card
    // logic itself (VipLevelChain / PrivilegesCarousel) are unchanged.
    title: `${BASE}/vip/title-vip.webp`,
    // Figma 285:285 — crown-topped ornate card with lion crest area, used as
    // the shared background for every tier when acebet77 is active (replaces
    // the default green/tier-coloured backgrounds).
    cardFrame: `${BASE}/vip/card-frame.webp`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.webp`,      // "Terms & Condition" plaque
  },
  // Daily Check-in page (Figma 460:23). The board frame is the ornate scroll
  // holding the 7 day slots; day-1..6 share one card frame and day 7 is the
  // wide treasure chest. The reward glyphs (bolt for days 1/2/4/6, coin for 3,
  // cards for 5) are identical in every theme's comp, so they come from
  // /assets/themes/shared/checkin/ via buildCheckinSkin.
  checkin: {
    title: `${BASE}/checkin/title-checkin.webp`,
    boardFrame: `${BASE}/checkin/board-frame.webp`,
    dayCard: `${BASE}/checkin/day-card.webp`,
    chest: `${BASE}/checkin/chest-day7.webp`,
  },
  // Avatar mini-game nav crests (Figma a83SqWgqIGNF6dJD1aP13w 2421:4296+). The
  // raised centre HOME reuses nav.home; every other RPG surface is dressed with
  // art already listed above.
  rpg: {
    iconBase: `${BASE}/rpg/icon-base.webp`,
    iconHeroItem: `${BASE}/rpg/icon-hero-item.webp`,
    iconChallenge: `${BASE}/rpg/icon-challenge.webp`,
    iconMission: `${BASE}/rpg/icon-mission.webp`,
    // Downscaled from checkin/board-frame.webp — the chip renders at ~73px,
    // so the full board bitmap was ~200KB of waste per themed session.
    tileFrame: `${BASE}/rpg/tile-frame.webp`,
  },
  // Mart page (Figma 468:1790). itemFrame is the ornate card the product sits
  // in; btnRedeem is the dark plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.webp`,
    itemFrame: `${BASE}/mart/item-frame.webp`,
    btnRedeem: `${BASE}/mart/btn-redeem.webp`,
  },
  // Two ornate frames reused across profile/terms/vip/token-history:
  // - frameCrown: rectangular frame topped with a crown + jewel dividers on
  //   the sides. Used for the terms body, the profile VIP-card, and the VIP
  //   benefits list.
  // - frameScroll: scroll-shaped frame with rolled tops/bottoms. Used for the
  //   Edit Profiles list and the KR Coin History overlay.
  frames: {
    crown: `${BASE}/ui/frame-crown.webp`,
    scroll: `${BASE}/ui/frame-scroll.webp`,
  },
};

// Shared palette (from Figma inspection)
export const ACEBET_COLORS = {
  gold: '#e9af41',
  goldBright: '#f2ba33',
  // Dark end of the mart product plinth's gold gradient (Figma 468:2000).
  goldDeep: '#8c6c1e',
  cream: '#fff6df',
  creamMuted: '#eae2cf',
  sand: '#d0c6ab',
  tokenYellow: '#ffe16d',
  dark: '#050505',
};
