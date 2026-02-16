/**
 * Footer navigation configuration
 * Centralized data for footer navigation items
 */

export const FOOTER_CONFIG = {
  navItems: [
    {
      id: 'leaderboard',
      icon: '/assets/images/footer-leaderboard.png',
      label: 'LEADERBOARD',
      link: '/leaderboard',
      width: 40,
      height: 40,
    },
    {
      id: 'hot',
      icon: '/assets/images/footer-hot.png',
      label: 'HOT',
      link: '/hot',
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
      id: 'profile',
      icon: '/assets/images/footer-profile.png',
      label: 'PROFILE',
      link: '/profile',
      width: 40,
      height: 40,
    },
    {
      id: 'livechat',
      icon: '/assets/images/footer-livechat.png',
      label: 'LIVECHAT',
      link: '/live-chat',
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
