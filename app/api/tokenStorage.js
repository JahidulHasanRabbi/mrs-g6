import { dispatchAuthChanged } from './authEvents';

function decodeJwtExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const STORAGE_KEYS = {
  MEMBER_ACCESS_TOKEN: 'mrs_member_access_token',
  MEMBER_UUID: 'mrs_member_uuid',
  MEMBER_TOKEN_EXPIRY: 'mrs_member_token_expiry',
  ADMIN_ACCESS_TOKEN: 'mrs_admin_access_token',
  ADMIN_REFRESH_TOKEN: 'mrs_admin_refresh_token',
  ADMIN_TOKEN_EXPIRY: 'mrs_admin_token_expiry',
  REDIRECT_O: 'mrs_redirect_o',
  STATION_URL: 'mrs_station_url'
};

export const tokenStorage = {
  // Member token methods
  getMemberAccessToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.MEMBER_ACCESS_TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.MEMBER_TOKEN_EXPIRY);

      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() >= expiryTime) {
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

  setMemberTokens: (access, memberUuid, expiresIn = 7200) => {
    if (typeof window !== 'undefined') {
      // 2-hour default, subtract 5 minutes as buffer
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

      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (!isNaN(expiryTime) && Date.now() >= expiryTime) {
          // Expired — return null without clearing so the guard can attempt refresh
          return null;
        }
      }

      return token;
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
      // Use the JWT's own exp claim as the expiry; fall back to 1 hour
      const jwtExpiry = decodeJwtExpiry(access);
      const expiryTime = jwtExpiry || (Date.now() + 3600 * 1000);

      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY, expiryTime.toString());

      if (refresh) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, refresh);
      }
    }
  },

  clearAdminTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
    }
  },

  isAdminTokenExpired: () => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
      if (!expiry) return true;
      const expiryTime = parseInt(expiry, 10);
      return isNaN(expiryTime) || Date.now() >= expiryTime;
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
  },

  // Station URL methods (for chatroom and other station-specific features)
  setStationUrl: (stationUrl) => {
    if (typeof window !== 'undefined' && stationUrl) {
      localStorage.setItem(STORAGE_KEYS.STATION_URL, stationUrl);
    }
  },

  getStationUrl: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.STATION_URL);
    }
    return null;
  },

  clearStationUrl: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.STATION_URL);
    }
  }
};
