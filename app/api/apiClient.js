import { BASE_URL } from './api';
import { tokenStorage } from './tokenStorage';

export const REQUEST_TIMEOUT = 30000;

export async function apiRequest(endpoint, options = {}, requiresAuth = false, tokenType = 'member') {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
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
