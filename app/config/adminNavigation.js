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
    label: 'Lucky Spin',
    path: '/admin/lucky-spin',
    enabled: true,
    id: 'lucky-spin'
  },
  {
    label: 'Redemption',
    path: '/admin/redemption',
    enabled: true,
    id: 'redemption'
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
  }
];
