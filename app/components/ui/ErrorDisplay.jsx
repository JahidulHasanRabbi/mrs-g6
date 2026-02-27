"use client";

export default function ErrorDisplay({ error }) {
  if (!error) return null;

  const getErrorMessage = (error) => {
    // Network error (no status code)
    if (!error.status || error.status === 0) {
      return 'Network error. Please check your connection.';
    }

    // Map status codes to user-friendly messages
    switch (error.status) {
      case 400:
        // Extract error details from API response if available
        return error.data?.detail || 'Invalid request. Please check your input.';
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
      <p className="text-sm font-medium">{getErrorMessage(error)}</p>
    </div>
  );
}
