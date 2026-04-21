import { dispatchAuthChanged } from './authEvents';

export const STORAGE_KEYS = {
  MEMBER_ACCESS_TOKEN: 'mrs_member_access_token',
  MEMBER_UUID: 'mrs_member_uuid',
  MEMBER_TOKEN_EXPIRY: 'mrs_member_token_expiry',
  ADMIN_ACCESS_TOKEN: 'mrs_admin_access_token',
  ADMIN_TOKEN_EXPIRY: 'mrs_admin_token_expiry',
  REDIRECT_O: 'mrs_redirect_o'
};

export const tokenStorage = {
  // Member token methods
  getMemberAccessToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.MEMBER_TOKEN_EXPIRY);
      
      // Check if token is expired
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() >= expiryTime) {
          // Token expired, clear it
          tokenStorage.clearMemberTokens();
          return null;
        }
      }
      
      return token;
    }
    return null;
  },

  getMemberUuid: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.MEMBER_UUID);
    }
    return null;
  },

  setMemberTokens: (access, memberUuid, expiresIn = 3600) => {
    if (typeof window !== 'undefined') {
      // Calculate expiry time (default 1 hour, subtract 5 minutes as buffer)
      const expiryTime = Date.now() + ((expiresIn - 300) * 1000);
      
      localStorage.setItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.MEMBER_UUID, memberUuid);
      localStorage.setItem(STORAGE_KEYS.MEMBER_TOKEN_EXPIRY, expiryTime.toString());
      dispatchAuthChanged();
    }
  },

  clearMemberTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_UUID);
      localStorage.removeItem(STORAGE_KEYS.MEMBER_TOKEN_EXPIRY);
      dispatchAuthChanged();
    }
  },
  
  isMemberTokenExpired: () => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(STORAGE_KEYS.MEMBER_TOKEN_EXPIRY);
      if (!expiry) return true;
      
      return Date.now() >= parseInt(expiry, 10);
    }
    return true;
  },

  // Admin token methods
  getAdminAccessToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
      
      // Check if token is expired
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() >= expiryTime) {
          // Token expired, clear it
          tokenStorage.clearAdminTokens();
          return null;
        }
      }
      
      return token;
    }
    return null;
  },

  setAdminTokens: (access, expiresIn = 3600) => {
    if (typeof window !== 'undefined') {
      // Calculate expiry time (default 1 hour, subtract 5 minutes as buffer)
      const expiryTime = Date.now() + ((expiresIn - 300) * 1000);
      
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY, expiryTime.toString());
    }
  },

  clearAdminTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
    }
  },
  
  isAdminTokenExpired: () => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
      if (!expiry) return true;
      
      return Date.now() >= parseInt(expiry, 10);
    }
    return true;
  },

  // Redirect O methods (external domain for redirects)
  setRedirectO: (o) => {
    if (typeof window !== 'undefined' && o) {
      localStorage.setItem(STORAGE_KEYS.REDIRECT_O, o);
    }
  },

  getRedirectO: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.REDIRECT_O);
    }
    return null;
  },

  clearRedirectO: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.REDIRECT_O);
    }
  }
};
