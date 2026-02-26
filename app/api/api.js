export const BASE_URL = process.env.BASEURL || 'https://staging-api.kinggroup44.com';

export const ENDPOINTS = {
  MEMBER: {
    GENERATE_TOKEN: '/login/generate-token/',
    CHECK_IN: '/member/members/check-in/',
    WELCOME_GIFT: '/member/members/welcome/',
    MEMBER_INFO: (uuid) => `/member/members/${uuid}/`,
    ONE_SPIN: (uuid) => `/member/${uuid}/one-spin/`,
    TEN_SPIN: (uuid) => `/member/${uuid}/ten-spin/`,
    FIFTY_SPIN: (uuid) => `/member/${uuid}/fifty-spin/`,
    HUNDRED_SPIN: (uuid) => `/member/${uuid}/hundred-spin/`,
    PROFILE: (uuid) => `/member/profile/${uuid}/`,
    UPDATE_PROFILE: (uuid) => `/member/profile/${uuid}/update-profile/`,
    ALL_REDEMPTION_ITEMS: '/redemption/redemption-items/',
    AVAILABLE_REDEMPTION_ITEMS: '/redemption/redemption-items/available-items/',
    REDEEM_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/redeem/`
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
    REDEMPTION_ITEMS: '/redemption/redemption-items/',
    REDEMPTION_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/`,
    ARCHIVE_REDEMPTION_ITEM: (uuid) => `/redemption/redemption-items/${uuid}/archive/`
  }
};
