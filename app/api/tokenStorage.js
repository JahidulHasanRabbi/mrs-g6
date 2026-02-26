export const STORAGE_KEYS = {
  MEMBER_ACCESS_TOKEN: 'mrs_member_access_token',
  MEMBER_REFRESH_TOKEN: 'mrs_member_refresh_token',
  MEMBER_UUID: 'mrs_member_uuid',
  ADMIN_ACCESS_TOKEN: 'mrs_admin_access_token',
  ADMIN_REFRESH_TOKEN: 'mrs_admin_refresh_token'
};

export const tokenStorage = {
  // Member token methods
  getMemberAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
    }
    return null;
  },

  getMemberRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.MEMBER_REFRESH_TOKEN);
    }
    return null;
  },

  getMemberUuid: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.MEMBER_UUID);
    }
    return null;
  },

  setMemberTokens: (access, refresh, memberUuid) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_UUID);
      
      localStorage.setItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.MEMBER_REFRESH_TOKEN, refresh);
      localStorage.setItem(STORAGE_KEYS.MEMBER_UUID, memberUuid);
    }
  },

  clearMemberTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_UUID);
    }
  },

  // Admin token methods
  getAdminAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
    }
    return null;
  },

  getAdminRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
    }
    return null;
  },

  setAdminTokens: (access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, refresh);
    }
  },

  clearAdminTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
    }
  }
};
