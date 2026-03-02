import { tokenStorage } from './tokenStorage';

/**
 * Centralized error handler for all API errors
 * Handles 401, 408, network errors, and 4xx/5xx errors
 * 
 * @param {Object} error - Error object from API request
 * @param {string} context - Context where error occurred (for logging)
 * @returns {Object} Formatted error object with type, message, and retry info
 */
export function handleApiError(error, context = 'api-call') {
  const { status, data, message } = error;
  
  // 401: Authentication failure
  if (status === 401) {
    if (typeof window !== 'undefined') {
      tokenStorage.clearMemberTokens();
      tokenStorage.clearAdminTokens();
      
      const authGuard = process.env.NEXT_PUBLIC_AUTHGUARD === 'true';
      const redirectUrl = authGuard 
        ? process.env.NEXT_PUBLIC_REDIRECTURL 
        : '/';
      
      window.location.href = redirectUrl;
    }
    
    return {
      type: 'auth',
      message: 'Authentication failed. Redirecting to login...',
      retryable: false,
      status: 401
    };
  }
  
  // 408: Timeout
  if (status === 408) {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      retryable: true,
      status: 408
    };
  }
  
  // 0: Network error
  if (status === 0) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
      retryable: true,
      status: 0
    };
  }
  
  // 4xx/5xx: Client/Server errors
  const errorMessage = data?.details || data?.detail || data?.message || data?.error || message || 'An error occurred';
  
  return {
    type: 'api',
    message: errorMessage,
    details: data,
    retryable: false,
    status: status
  };
}

/**
 * Retry wrapper for API calls that handles retryable errors
 * 
 * @param {Function} apiFunction - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} Result of the API call
 */
export async function retryableApiCall(apiFunction, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;
      
      // Only retry on timeout or network errors
      if (error.status !== 408 && error.status !== 0) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
  
  throw lastError;
}

/**
 * Format error for display in UI components
 * 
 * @param {Object} errorInfo - Error info from handleApiError
 * @returns {string} User-friendly error message
 */
export function formatErrorMessage(errorInfo) {
  if (!errorInfo) {
    return 'An unexpected error occurred';
  }
  
  switch (errorInfo.type) {
    case 'auth':
      return 'Your session has expired. Please log in again.';
    case 'timeout':
      return 'The request took too long. Please try again.';
    case 'network':
      return 'Unable to connect. Please check your internet connection.';
    case 'api':
      return errorInfo.message;
    default:
      return 'An unexpected error occurred';
  }
}

/**
 * Check if an error is retryable
 * 
 * @param {Object} error - Error object
 * @returns {boolean} True if error can be retried
 */
export function isRetryableError(error) {
  return error?.status === 408 || error?.status === 0;
}
