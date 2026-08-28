// Admin navigation configuration
// Centralized management of admin panel navigation items with availability status

export const ADMIN_NAVIGATION = [
  {
    label: 'Dashboard',
    path: '/admin',
    enabled: true,
    id: 'home'
  },
  {
    label: 'VIP Tiers',
    path: '/admin/vip-tiers',
    enabled: true,
    id: 'vip-tiers'
  },
  {
    label: 'Frame Setting',
    path: '/admin/frame-setting',
    enabled: true,
    id: 'frame-setting'
  },
  {
    label: 'Wallet Side VIP',
    path: '/admin/wallet-site-vip',
    enabled: true,
    id: 'wallet-site-vip'
  },
  {
    label: 'MRS VIP Level',
    path: '/admin/mrs-vip',
    enabled: true,
    id: 'mrs-vip-level'
  },
  {
    label: 'Lucky Spin',
    path: '/admin/lucky-spin',
    enabled: true,
    id: 'lucky-spin'
  },
  {
    label: 'Smash Egg',
    path: '/admin/smash-egg',
    enabled: true,
    id: 'smash-egg'
  },
  {
    label: 'Penalty Kick',
    path: '/admin/penalty-kick',
    enabled: true,
    id: 'penalty-kick'
  },
  {
    label: 'Redeem Links',
    path: '/admin/redeem-links',
    enabled: true,
    id: 'redeem-links'
  },
  {
    label: 'Avatar',
    path: '/admin/avatar',
    enabled: true,
    id: 'avatar'
  },
  {
    label: 'Points Redemption Mall',
    path: '/admin/redemption-mall',
    enabled: true,
    id: 'redemption-mall'
  },
  {
    label: 'Members',
    path: '/admin/members',
    enabled: true,
    id: 'members'
  },
  {
    label: 'Check-In Settings',
    path: '/admin/checkin-settings',
    enabled: true,
    id: 'checkin-settings'
  },
  {
    label: 'Reports',
    path: '/admin/reports',
    enabled: false, // Not yet implemented
    id: 'reports'
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    enabled: false, // Not yet implemented
    id: 'settings'
  },
  {
    label: 'Deposit Leaderboard',
    path: '/admin/leaderboards/deposit',
    enabled: true,
    id: 'lb-deposit'
  },
  {
    label: 'Referrer Leaderboard',
    path: '/admin/leaderboards/referrer',
    enabled: true,
    id: 'lb-referrer'
  },
  {
    label: 'Withdrawal Leaderboard',
    path: '/admin/leaderboards/withdrawal',
    enabled: true,
    id: 'lb-withdrawal'
  },
  {
    label: 'Turnover Leaderboard',
    path: '/admin/leaderboards/turnover',
    enabled: true,
    id: 'lb-turnover'
  }
];
