export const BASE_URL = process.env.NEXT_PUBLIC_BASEURL || 'https://staging-api.kinggroup44.com';

export const ENDPOINTS = {
  MEMBER: {
    GENERATE_TOKEN: '/login/generate-token/',
    CHECK_IN: '/member/members/check-in/',
    WELCOME_GIFT: '/member/members/welcome/',
    MEMBER_INFO: (uuid) => `/member/members/${uuid}/`,
    MEMBER_TOKENS: (uuid) => `/member/${uuid}/member-tokens/`,
    MEMBER_REWARDS: (uuid) => `/member/${uuid}/member-rewards/`,
    ONE_SPIN: (uuid) => `/member/${uuid}/one-spin/`,
    TEN_SPIN: (uuid) => `/member/${uuid}/ten-spin/`,
    FIFTY_SPIN: (uuid) => `/member/${uuid}/fifty-spin/`,
    HUNDRED_SPIN: (uuid) => `/member/${uuid}/hundred-spin/`,
    PROFILE: (uuid) => `/member/profile/${uuid}/`,
    UPDATE_PROFILE: (uuid) => `/member/profile/${uuid}/update-profile/`,
    ALL_LUCKY_SPIN_ITEMS: '/lucky-spin/lucky-spin-items/',
    ALL_REDEMPTION_ITEMS: '/redemption/redemption-items/',
    AVAILABLE_REDEMPTION_ITEMS: '/redemption/redemption-items/available-items/',
    REDEEM_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/redeem/`
  },
  FRONT_VIEW: {
    WINNING_LIST: '/front-view/winning-list/',
    TOTAL_USERS: '/front-view/total-users/',
    ACTIVE_USERS: '/front-view/active-users/',
    DAILY_CHECK_IN: '/front-view/daily-check-in/'
  },
  SETTINGS: {
    PUBLIC_BANNERS: '/settings/banners/public/'
  },
  ADMIN: {
    LOGIN: '/login/admin-access-token/',
    LOGOUT: '/login/logout/',
    REFRESH_TOKEN: '/login/refresh-token/',
    VERIFY_TOKEN: '/login/verify-token/',
    VIP_TIERS: '/member/vip-tier/',
    VIP_TIER: (uuid) => `/member/vip-tier/${uuid}/`,
    ARCHIVE_VIP_TIER: (uuid) => `/member/vip-tier/${uuid}/archive/`,
    LUCKY_SPIN_ITEMS: '/lucky-spin/lucky-spin-items/',
    LUCKY_SPIN_ITEM: (uuid) => `/lucky-spin/lucky-spin-items/${uuid}/`,
    ARCHIVE_LUCKY_SPIN_ITEM: (uuid) => `/lucky-spin/lucky-spin-items/${uuid}/archive/`,
    LUCKY_SPIN_SEQUENCES: '/lucky-spin/lucky-spin-sequences/',
    LUCKY_SPIN_SEQUENCE: (uuid) => `/lucky-spin/lucky-spin-sequences/${uuid}/`,
    CHANGE_SPIN_SEQUENCES: '/lucky-spin/lucky-spin-sequences/change-spin-sequences/',
    MEMBERS: '/member/members/',
    TOKEN_REPORT: '/member/token-report/',
    REWARD_REPORT: '/member/reward-report/',
    MEMBER_LIST: '/member/member-list/',
    MEMBER_LIST_SINGLE: (uuid) => `/member/member-list/${uuid}/`,
    MEMBER_DEPOSIT: (uuid) => `/member/${uuid}/member-deposit/`,
    REDEMPTION_ITEMS: '/redemption/redemption-items/',
    REDEMPTION_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/`,
    ARCHIVE_REDEMPTION_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/archive/`,
    CHECKIN_SETTINGS: '/settings/checkin-settings/',
    BANNERS: '/settings/banners/',
    BANNER: (uuid) => `/settings/banners/${uuid}/`,
    ARCHIVE_BANNER: (uuid) => `/settings/banners/${uuid}/archive/`,
    MEMBER_REPORT_DAILY: '/member/member-report/daily/',
    MEMBER_REPORT_MONTHLY: '/member/member-report/monthly/',
    MEMBER_REPORT_YEARLY: '/member/member-report/yearly/',
    STATION_LIST: '/front-view/station-list/',
    REDEMPTION_TIERS: '/redemption/redemption-tier/',
    REDEMPTION_TIER_SINGLE: (uuid) => `/redemption/redemption-tier/${uuid}/`,
    ARCHIVE_REDEMPTION_TIER: (uuid) => `/redemption/redemption-tier/${uuid}/archive/`,
    CHECKIN_TIER: '/settings/check-in-tier/',
    WALLET_VIP: '/third-party/wallet-vip/',
    WALLET_VIP_SINGLE: (uuid) => `/third-party/wallet-vip/${uuid}/`,
    WALLET_VIP_ARCHIVE: (uuid) => `/third-party/wallet-vip/${uuid}/archive/`,
    FLOATING_MENU: '/third-party/floating-menu/',
    FLOATING_MENU_SINGLE: (uuid) => `/third-party/floating-menu/${uuid}/`,
    FLOATING_MENU_ARCHIVE: (uuid) => `/third-party/floating-menu/${uuid}/archive/`,
    FLOATING_MENU_ROOT_ICON: '/third-party/floating-menu-root-icon/',
    FRAMES: '/third-party/frame/',
    FRAME_SINGLE: (uuid) => `/third-party/frame/${uuid}/`,
    FRAME_ARCHIVE: (uuid) => `/third-party/frame/${uuid}/archive/`
  },
  EXTERNAL: {
    SPECIAL_CODE: '/third-party/special-codes/',
    WALLET_VIP_TIERS: (specialCode) => `/third-party/station-wallet-vip/${specialCode}/`,
    FLOATING_MENUS: (specialCode) => `/third-party/station-floating-menu/${specialCode}/`
  },
  CRM: {
    // Member Profile
    MEMBERS: '/crm-members/members/',
    MEMBER_SINGLE: (uuid) => `/crm-members/members/${uuid}/`,
    // Retention Alert System
    PRIORITY_SUMMARY: '/crm-members/priority-summary/',
    REFRESH_MEMBERS: '/crm-members/refresh-members/',
    // Retention Profile
    RETENTION_SUMMARY: (adminUuid) => `/crm-members/retention-summary/${adminUuid}/`,
    RETENTION_MEMBERS: '/crm-members/retention-members/',
    // Dashboard
    DASHBOARD_SUMMARY: '/crm-admins/dashboard-summary/',
    DASHBOARD_DETAILS: '/crm-admins/dashboard-details/',
    // Member Assignment
    ASSIGNMENTS: '/crm-admins/assignments/',
    ASSIGNMENT_SINGLE: (uuid) => `/crm-admins/assignments/${uuid}/`,
    ASSIGNMENT_SET_TARGET: '/crm-admins/assignments/set-target/'
  }
};
