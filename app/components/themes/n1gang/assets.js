// Art comes from the "N1gang" section of the MRS Theme Engine Figma file
// (1IVoZBmY746AYkNiR05Y3Z, section 235:2051). Every entry below is the node's
// RAW image fill — the original uploaded PNG with its alpha intact. Do NOT
// re-export these as node renders: a Figma node export flattens the art onto
// the canvas matte, which bakes a grey background into every cutout.

import { PHASE4_ASSETS } from '../../../config/phase4';

const BASE = '/assets/themes/n1gang';

export const N1GANG_ASSETS = {
  ui: {
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    dialogFrame: `${BASE}/ui/dialog-frame.webp`,
    dialogFrameTall: `${BASE}/ui/dialog-frame-tall.webp`,
    frameTop: `${BASE}/ui/frame-top.webp`,
    frameMid: `${BASE}/ui/frame-mid.webp`,
    frameBottom: `${BASE}/ui/frame-bottom.webp`,
    btnGold: `${BASE}/ui/btn-gold.webp`,
    iconGift: `${BASE}/ui/icon-gift.svg`,
    // Phase 4: the token art is shared across every station.
    iconCoins: PHASE4_ASSETS.token,
    iconParty: `${BASE}/ui/icon-party.svg`,
    jackpotPanel: `${BASE}/ui/jackpot-panel.webp`,
    // Empty gold ribbon — the banner behind a jackpot / prize amount.
    ribbonBanner: `${BASE}/ui/ribbon-banner.webp`,
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
    crest: `${BASE}/home/crest-n1gang.webp`,
    tileLuckySpin: `${BASE}/home/tile-lucky-spin.webp`,
    tileSmashEgg: `${BASE}/home/tile-smash-egg.webp`,
    tilePenaltyKick: `${BASE}/home/tile-penalty-kick.webp`,
  },
  spin: {
    bg: `${BASE}/spin/bg-spin.webp`,
    title: `${BASE}/spin/title-lucky-spin.webp`,
    // Wider lock-up of the same title, for a full-bleed header.
    titleWide: `${BASE}/spin/title-lucky-spin-wide.webp`,
    wheelFrame: `${BASE}/spin/wheel-frame.webp`,
    slotGold: `${BASE}/spin/slot-gold.webp`,
    // No green slot exists in the set. slot-question is pixel-identical to
    // slot-gold, so pointing here made both wheel tiles the same — slot-mystery
    // is the genuinely different second tile.
    slotGreen: `${BASE}/spin/slot-mystery.webp`,
    // The reward-slot tiles that came with the Figma set.
    slotMystery: `${BASE}/spin/slot-mystery.webp`,
    slotOrb: `${BASE}/spin/slot-orb.webp`,
    slotQuestion: `${BASE}/spin/slot-question.webp`,
    spinNow: `${BASE}/spin/spin-now.webp`,
    // Alternate SPIN NOW treatments (spiked ring / compact).
    spinNowSpiky: `${BASE}/spin/spin-now-spiky.webp`,
    spinNowSmall: `${BASE}/spin/spin-now-small.webp`,
    btnPlay: `${BASE}/spin/btn-play.webp`,
    // Container for the winning-record / terms sections (buildFramedSkin reads
    // this). Must be the header-less plate: panel-ornate.png has the N1gang
    // crest baked in, which showed through behind the first rows and forced the
    // insets down so far that the last row got clipped.
    panel: `${BASE}/vip/card-frame.webp`,
    // The spin page reads these, NOT the flat keys above — keep both in sync.
    grid: {
      // Derived from ui/dialog-frame-tall.png: that file pillarboxes the
      // thunder-arena plate inside a 1:1 canvas, so more than a fifth of its
      // width is empty alpha and the plate rendered at roughly half the scale
      // of every other theme's wheel. grid-frame.png is the same art trimmed to
      // its side margins and padded at the bottom so the dark interior sits
      // dead-centre; LuckySpinGrid renders it at its true 638x856 ratio (see
      // N1GANG_GEOMETRY.aspect) and it fills the full content column.
      background: `${BASE}/spin/grid-frame.webp`,
      itemEmptyGold: `${BASE}/spin/slot-gold.webp`,
      itemEmptyGreen: `${BASE}/spin/slot-mystery.webp`,
      centerButton: `${BASE}/spin/spin-now.webp`,
      centerButtonStop: `${BASE}/spin/spin-now.webp`,
    },
  },
  egg: {
    bg: `${BASE}/egg/bg-hall.webp`,
    bgLoading: `${BASE}/egg/bg-loading.webp`,
    rays: `${BASE}/egg/rays.webp`,
    eggIntact: `${BASE}/egg/egg-intact.webp`,
    // Supplied separately — the Figma set has no cracked variant. The file that
    // used to sit here was the hamburger MENU icon at 1024², so smashing turned
    // the egg into three gold bars. Shipped at the same 465x620 as egg-intact so
    // the swap has no size jump.
    eggCracked: `${BASE}/egg/egg-cracked.webp`,
    eggCrown: `${BASE}/egg/egg-crown.webp`,
    btnWide: `${BASE}/egg/btn-wide.webp`,
    iconToken: `${BASE}/egg/icon-token.svg`,
    logo: `${BASE}/home/tile-smash-egg.webp`,
    jackpotRibbon: `${BASE}/ui/ribbon-banner.webp`,
    jackpotCoins: `${BASE}/egg/jackpot-coins.webp`,
  },
  pk: {
    bgStadium: `${BASE}/pk/bg-stadium.webp`,
    // The wide (loading/launch) variant reuses the stadium art — same as
    // ubetclub/ep369. bg-crowd.png is leftover 410x884 art that isn't the
    // N1gang arena, and PitchBackground renders bgCrowd full-bleed for the
    // wide variant, so pointing at it showed the wrong backdrop entirely.
    bgCrowd: `${BASE}/pk/bg-stadium.webp`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/pk/icon-token-hud.svg`,
    iconShotHud: `${BASE}/pk/icon-shot-hud.svg`,
    prizePanel: `${BASE}/pk/prize-panel.webp`,
  },
  profile: {
    title: `${BASE}/profile/title-profile.webp`,
    badgeNum: `${BASE}/profile/badge-num.webp`,
    iconChevron: `${BASE}/profile/icon-chevron.webp`,
    badgeCheck: `${BASE}/profile/badge-check.webp`,
    iconStar: `${BASE}/profile/icon-star.svg`,
    iconArrow: `${BASE}/profile/icon-arrow.svg`,
  },
  vip: {
    title: `${BASE}/vip/title-vip.webp`,
    cardFrame: `${BASE}/vip/card-frame.webp`,
  },
  terms: {
    title: `${BASE}/ui/title-terms.webp`,
  },
  frames: {
    // Card/panel frames — these are stretched to fit content and hold TEXT, so
    // they must have a dark readable interior. The crowned gate art is a solid
    // ornament with no interior plate; using it here left the profile and terms
    // copy sitting on bare gold artwork.
    crown: `${BASE}/ui/dialog-frame.webp`,
    scroll: `${BASE}/ui/frame-scroll.webp`,
    stone: `${BASE}/ui/frame-stone.webp`,
    // Plain bordered plate with no crest/header baked in — the right container
    // when the screen already has its own title art above the panel, since a
    // baked header would collide with the first row of content.
    panel: `${BASE}/vip/card-frame.webp`,
    // Decorative only — never use as a text container.
    ornamentThrone: `${BASE}/ui/ornament-throne.webp`,
  },
  // Daily Check-in page (Figma 463:1384). Board geometry, day positions and the
  // reward glyphs are shared across all six skins via
  // app/components/themes/shared/checkinMartSkin.js — only the art differs here.
  // Avatar mini-game nav crests (Figma a83SqWgqIGNF6dJD1aP13w). Every other RPG
  // surface is dressed with art already listed above.
  // No portal-home crest of its own — the comp crops the shared sheet, so the
  // raised centre reuses nav.home.
  rpg: {
    iconBase: `${BASE}/rpg/icon-base.webp`,
    iconHeroItem: `${BASE}/rpg/icon-hero-item.webp`,
    iconChallenge: `${BASE}/rpg/icon-challenge.webp`,
    iconMission: `${BASE}/rpg/icon-mission.webp`,
    // Downscaled from checkin/board-frame.webp — the chip renders at ~73px,
    // so the full board bitmap was ~200KB of waste per themed session.
    tileFrame: `${BASE}/rpg/tile-frame.webp`,
  },
  checkin: {
    title: `${BASE}/checkin/title-checkin.webp`,
    boardFrame: `${BASE}/checkin/board-frame.webp`,
    dayCard: `${BASE}/checkin/day-card.webp`,
    chest: `${BASE}/checkin/chest-day7.webp`,
  },
  // Mart page (Figma 468:2680). itemFrame is the ornate card each product sits
  // in; btnRedeem is the plaque at its foot.
  mart: {
    title: `${BASE}/mart/title-mart.webp`,
    itemFrame: `${BASE}/mart/item-frame.webp`,
    btnRedeem: `${BASE}/mart/btn-redeem.webp`,
  },
};

export const N1GANG_COLORS = {
  gold: '#d4a830',
  goldBright: '#f2cb7a',
  cream: '#fff6df',
  creamMuted: '#eae2cf',
  sand: '#d0c6ab',
  tokenYellow: '#ffe16d',
  dark: '#0a0a0a',
};
