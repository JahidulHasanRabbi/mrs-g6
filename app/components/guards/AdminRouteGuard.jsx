'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';
import { verifyToken } from '../../api/adminApi';

/**
 * Admin route guard.
 *
 * Behavior: optimistic render. If a token exists in localStorage, render the
 * children immediately so static chrome (titles, sidebar, table headers)
 * appears in the first frame. The token is verified in the background; if
 * verification fails the tokens are cleared and the user is redirected to
 * /admin/login. If there is no token at all on first paint, render nothing
 * and redirect synchronously.
 *
 * Why: skeleton-replacing the whole page during the ~200–500 ms token verify
 * makes the admin feel sluggish. The real chrome is static and safe to show
 * before verification — no private data is exposed until the API calls
 * resolve, and the centralised 401 handler in apiClient will still redirect
 * if the verify race loses to a user action.
 *
 * The `skeleton` prop is accepted for backwards compatibility but is no
 * longer rendered — pages should render their own loading states inside
 * their data sections instead.
 */
export function AdminRouteGuard({ children /* , skeleton (deprecated) */ }) {
  const router = useRouter();
  const verifiedRef = useRef(false);
  // Track whether we have any token at all. Server-side this is `null`
  // (unknown). Client effect resolves it.
  const [tokenState, setTokenState] = useState(null); // null | 'present' | 'absent'

  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = tokenStorage.getAdminAccessToken();
    if (!token) {
      setTokenState('absent');
      router.push('/admin/login');
      return;
    }
    setTokenState('present');

    // Background verify — non-blocking.
    verifyToken(token).catch((error) => {
      console.log('[AdminRouteGuard] background token verify failed:', error?.message);
      tokenStorage.clearAdminTokens();
      router.push('/admin/login');
    });
  }, [router]);

  // First server render and first client render: render children optimistically.
  // Only return null after we've confirmed there's no token (post-mount).
  if (tokenState === 'absent') return null;

  return children;
}
