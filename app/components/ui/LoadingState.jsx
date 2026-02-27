"use client";

// Loading spinner component
function LoadingSpinner({ size = "medium" }) {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4"
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-t-transparent rounded-full animate-spin`}
      style={{
        borderColor: 'rgba(233, 175, 65, 0.3)',
        borderTopColor: 'transparent'
      }}
    />
  );
}

// Wrapper component that shows spinner while loading
export function LoadingState({ isLoading, children }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  return children;
}

// Button component with loading state
export function LoadingButton({ isLoading, children, disabled, ...props }) {
  return (
    <button 
      {...props} 
      disabled={isLoading || disabled}
      className={`${props.className || ''} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="small" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingState;
