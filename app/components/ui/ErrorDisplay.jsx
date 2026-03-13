"use client";

export default function ErrorDisplay({ error }) {
  if (!error) return null;

  const getErrorMessage = (error) => {
    // Network error (no status code)
    if (!error.status || error.status === 0) {
      return 'Network error. Please check your connection.';
    }

    // Try to extract detailed error messages from API response
    if (error.data) {
      // Check for various error formats
      if (typeof error.data === 'string') {
        return error.data;
      }
      
      // Check for detail field
      if (error.data.detail) {
        return error.data.detail;
      }
      
      // Check for details field
      if (error.data.details) {
        return error.data.details;
      }
      
      // Check for error field
      if (error.data.error) {
        return error.data.error;
      }
      
      // Check for message field
      if (error.data.message) {
        return error.data.message;
      }
      
      // Check for field-specific errors (validation errors)
      if (typeof error.data === 'object') {
        const fieldErrors = [];
        for (const [field, messages] of Object.entries(error.data)) {
          if (Array.isArray(messages)) {
            fieldErrors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            fieldErrors.push(`${field}: ${messages}`);
          }
        }
        if (fieldErrors.length > 0) {
          return fieldErrors.join('\n');
        }
      }
    }

    // Map status codes to user-friendly messages
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgba(220, 38, 38, 0.3)',
        color: 'rgba(220, 38, 38, 1)'
      }}
    >
      <p className="text-sm font-medium whitespace-pre-line">{getErrorMessage(error)}</p>
    </div>
  );
}
