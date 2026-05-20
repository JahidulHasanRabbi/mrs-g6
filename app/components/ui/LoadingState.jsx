"use client";

// Loading spinner component (kept for legacy callers that haven't migrated to skeletons yet)
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

/**
 * Wrapper that shows a loading state while data is fetching.
 *
 * Pass `skeleton={<Skeleton.TablePage .../>}` (or any page-shaped skeleton)
 * to render a structural preview instead of the legacy spinner — much better
 * perceived performance and signals what's about to load.
 *
 * If `skeleton` is omitted, falls back to the spinner so existing callers keep working.
 */
export function LoadingState({ isLoading, children, skeleton, message }) {
  if (isLoading) {
    if (skeleton) return skeleton;
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3">
        <LoadingSpinner size="large" />
        {message && <span className="text-white/60 text-sm">{message}</span>}
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
