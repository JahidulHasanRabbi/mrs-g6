// Figma 1IVoZBmY746AYkNiR05Y3Z; icons are pre-cropped to hide their baked caption.

const BASE = '/assets/themes/kingrewards';

export const KR_ASSETS = {
  ui: {
    bg: `${BASE}/ui/bg.webp`,
    hamburger: `${BASE}/ui/icon-hamburger.webp`,
    info: `${BASE}/ui/icon-info.webp`,
    btnGold: `${BASE}/ui/btn-gold.webp`,
    iconCoins: `${BASE}/ui/coin-kr.webp`,
    iconBp: `${BASE}/ui/coin-bp.webp`,
    iconWarning: `${BASE}/ui/icon-warning.svg`,
    iconArrowLeft: `${BASE}/ui/icon-arrow-left.svg`,
    iconArrowCircle: `${BASE}/ui/icon-arrow-circle.svg`,
    iconRankMedal: `${BASE}/ui/icon-rank-medal.svg`,
    iconFlame: `${BASE}/ui/icon-flame.svg`,
  },
  nav: {
    leaderboard: `${BASE}/nav/icon-leaderboard.webp`,
    hot: `${BASE}/nav/icon-hot.webp`,
    home: `${BASE}/nav/icon-home.webp`,
    profile: `${BASE}/nav/icon-profile.webp`,
    livechat: `${BASE}/nav/icon-livechat.webp`,
    livechatMenu: `${BASE}/nav/icon-livechat-menu.webp`,
  },
  home: {
    bg: `${BASE}/ui/bg.webp`,
    logo: `${BASE}/home/logo.webp`,
  },
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
    feedback: `${BASE}/modules/feedback.webp`,
    terms: `${BASE}/modules/terms.webp`,
    backToStation: `${BASE}/modules/back-to-station.webp`,
  },
  spin: {
    bg: `${BASE}/ui/bg.webp`,
    spinNow: `${BASE}/spin/spin-now.webp`,
    btnPlay: `${BASE}/ui/btn-gold.webp`,
  },
  egg: {
    bg: `${BASE}/ui/bg.webp`,
    eggIntact: `${BASE}/egg/egg-intact.webp`,
    btnWide: `${BASE}/ui/btn-gold.webp`,
  },
  pk: {
    bgCrowd: `${BASE}/ui/bg.webp`,
    iconBall: `${BASE}/pk/icon-ball.svg`,
    iconTokenHud: `${BASE}/ui/coin-kr.webp`,
    infoSwipe: `${BASE}/pk/info-swipe.svg`,
  },
  profile: {
    avatarRing: `${BASE}/profile/avatar-ring.webp`,
    iconEdit: `${BASE}/profile/icon-edit.svg`,
    iconFrame: `${BASE}/profile/icon-frame.svg`,
    iconTheme: `${BASE}/profile/icon-theme.svg`,
    iconCalendar: `${BASE}/profile/icon-calendar.svg`,
    iconCaretDown: `${BASE}/profile/icon-caret-down.svg`,
  },
  vip: {
    iconLifetimeDeposit: `${BASE}/vip/icon-lifetime-deposit.webp`,
    iconMonthlyDeposit: `${BASE}/vip/icon-monthly-deposit.webp`,
    iconCheckinToken: `${BASE}/vip/icon-checkin-token.webp`,
    iconUpgradeGift: `${BASE}/vip/icon-upgrade-gift.webp`,
    // Bronze → Amethyst, in the order the tier rail shows them.
    tiers: Array.from({ length: 9 }, (_, i) => `${BASE}/vip/tier-${i + 1}.webp`),
  },
  mart: {
    iconLock: `${BASE}/mart/icon-lock.svg`,
    iconLockOpen: `${BASE}/mart/icon-lock-open.svg`,
  },
  leaderboard: {
    iconStar: `${BASE}/leaderboard/icon-star.svg`,
  },
};

export const KR_COLORS = {
  gold: '#f2b229',
  goldBright: '#fff066',
  goldText: '#f9d063',
  goldDeep: '#d97706',
  amber: '#f59e0b',
  cream: '#fff6df',
  creamMuted: '#dbdbdb',
  sand: 'rgba(165,196,255,0.7)',
  tokenYellow: '#f9d063',
  navy: '#003d89',
  navyDeep: '#091f46',
  onGold: '#001e4a',
  dark: '#021a3f',
  progressTrack: 'rgba(45,45,45,0.75)',
};

export const KR_GRADIENTS = {
  gold: 'linear-gradient(to bottom, #fff066 0%, #f59e0b 50%, #d97706 100%)',
  red: 'linear-gradient(to bottom, #ff668a 0%, #f50b69 50%, #d90614 100%)',
  goldBar: 'linear-gradient(90deg, #fef064 0%, #f59e0a 50%, #d97706 100%)',
};

// Figma's three recurring surfaces (spec tokens "glass translucent", "glass
// solid" and the "KR Default" inner-card effect).
export const KR_SURFACES = {
  glass: {
    background: 'rgba(0,71,162,0.65)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    boxShadow: 'inset 0 4px 16px rgba(255,255,255,0.15)',
  },
  solid: {
    background: '#003d89',
    boxShadow: 'inset 0 4px 16px rgba(255,255,255,0.15)',
  },
  inner: {
    background: 'rgba(255,255,255,0.15)',
    boxShadow: 'inset -2px 8px 8px rgba(165,196,255,0.25)',
  },
};

export const KR_FONT = 'var(--font-barlow), "Barlow", sans-serif';
