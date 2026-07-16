/**
 * Footer navigation configuration
 * Centralized data for footer navigation items
 */

export const FOOTER_CONFIG = {
  navItems: [
    {
      id: 'lucky-spin',
      icon: '/assets/images/kasih-spin-icon.png',
      label: 'LUCKY SPIN',
      link: '/spin',
      width: 40,
      height: 40,
    },
    {
      id: 'smash-egg',
      icon: '/assets/images/coming-soon-icon.png',
      label: 'SMASH EGG',
      link: '/smash-egg',
      width: 40,
      height: 40,
    },
    {
      id: 'home',
      icon: '/assets/images/footer-home.png',
      label: 'HOME',
      link: '/',
      width: 60,
      height: 60,
      isCenter: true,
    },
    {
      id: 'leaderboard',
      icon: '/assets/images/footer-leaderboard.png',
      label: 'LEADERBOARD',
      link: '/leaderboard',
      // The source artwork is 3:2 and was previously rendered at 40px high
      // with an automatic 60px width. Keep that exact visual footprint.
      width: 60,
      height: 40,
    },
    {
      id: 'livechat',
      icon: '/assets/images/footer-livechat.png',
      label: 'LIVECHAT',
      action: 'livechat',
      width: 40,
      height: 40,
    },
  ],
};

export const FOOTER_THEME = {
  background: '#07190d',
  borderColor: '#e9af41',
  textColor: '#e9af41',
  textColorActive: '#ffffff',
};
