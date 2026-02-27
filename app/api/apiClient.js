import { BASE_URL } from './api';
import { tokenStorage } from './tokenStorage';

export const REQUEST_TIMEOUT = 30000;

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

export async function apiRequest(endpoint, options = {}, requiresAuth = false, tokenType = 'member') {
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
      
      throw {
        message: `HTTP error: ${response.status}`,
        status: response.status,
        data: errorData
      };
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
