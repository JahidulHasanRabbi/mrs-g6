export const AUTH_CHANGED_EVENT = 'mrs_auth_changed';

/**
 * Dispatches a custom event globally to notify that the authentication state has changed.
 */
export function dispatchAuthChanged() {
  if (typeof window !== 'undefined') {
    const event = new Event(AUTH_CHANGED_EVENT);
    window.dispatchEvent(event);
  }
}

/**
 * Subscribes to the authentication state change event.
 * @param {Function} callback - The function to call when the auth state changes.
 * @returns {Function} A cleanup function to remove the event listener.
 */
export function onAuthChanged(callback) {
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_CHANGED_EVENT, callback);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, callback);
    };
  }
  return () => {};
}
