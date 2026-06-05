import { BASE_URL, ENDPOINTS } from './api';
import { tokenStorage } from './tokenStorage';
import { handleApiError } from './errorHandler';

export const REQUEST_TIMEOUT = 30000;

async function tryAdminRefresh() {
  const storedRefresh = tokenStorage.getAdminRefreshToken();
  if (!storedRefresh) return false;
  try {
    const res = await fetch(`${BASE_URL}${ENDPOINTS.ADMIN.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: storedRefresh })
    });
    if (!res.ok) {
      tokenStorage.clearAdminTokens();
      return false;
    }
    const data = await res.json();
    if (data.access) {
      tokenStorage.setAdminTokens(data.access, data.refresh || null);
      return true;
    }
    tokenStorage.clearAdminTokens();
    return false;
  } catch {
    tokenStorage.clearAdminTokens();
    return false;
  }
}

function detectContentType(data) {
  if (!data || typeof data !== 'object') {
    return 'json';
  }
  
  for (const key in data) {
    const value = data[key];
    if (value instanceof File || value instanceof Blob) {
      return 'formdata';
    }
  }
  
  return 'json';
}

function convertToFormData(data) {
  const formData = new FormData();
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      if (value === null || value === undefined) {
        continue;
      }
      
      formData.append(key, value);
    }
  }
  
  return formData;
}

export async function apiRequest(endpoint, options = {}, requiresAuth = false, tokenType = 'member', _isRetry = false) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    ...options.headers
  };
  
  let body = options.body;
  
  // Detect content type and prepare body
  if (options.body) {
    // Parse body if it's a JSON string to detect content type
    let bodyData = options.body;
    if (typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch (e) {
        // If parsing fails, treat as already formatted
        bodyData = options.body;
      }
    }
    
    const contentType = detectContentType(bodyData);
    
    // Set Content-Type and prepare body based on detection
    if (contentType === 'formdata') {
      // Don't set Content-Type header - browser will set it with boundary
      body = convertToFormData(bodyData);
    } else {
      headers['Content-Type'] = 'application/json';
      body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);
    }
  }
  
  if (requiresAuth) {
    const accessToken = tokenType === 'admin'
      ? tokenStorage.getAdminAccessToken()
      : tokenStorage.getMemberAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (tokenType === 'member') {
      // No valid member token — skip the network roundtrip.
      // The server would return 401 anyway. Admin path proceeds without
      // the header so its 401 handler can attempt a token refresh.
      throw { message: 'Not authenticated', status: 401, data: null };
    }
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      body,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData = null;
      
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { detail: response.statusText };
      }
      
      const error = {
        message: `HTTP error: ${response.status}`,
        status: response.status,
        data: errorData
      };

      // For admin 401, try to refresh the access token and retry once
      if (response.status === 401 && tokenType === 'admin' && !_isRetry) {
        const refreshed = await tryAdminRefresh();
        if (refreshed) {
          return apiRequest(endpoint, options, requiresAuth, tokenType, true);
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      // Use centralized error handler
      handleApiError(error, endpoint, tokenType);

      throw error;
    }
    
    if (response.status === 204) {
      return { success: true };
    }

    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      throw {
        message: 'Invalid JSON response',
        status: response.status,
        data: null
      };
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timeout',
        status: 408,
        data: null
      };
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: `Network error: ${error.message}`,
        status: 0,
        data: null
      };
    }
    
    if (error.message && error.status !== undefined) {
      throw error;
    }
    
    throw {
      message: error.message || 'Unknown error occurred',
      status: 0,
      data: null
    };
  }
}
