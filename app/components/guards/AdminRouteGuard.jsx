'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';
import { verifyToken, refreshToken } from '../../api/adminApi';

async function attemptRefresh() {
  const storedRefresh = tokenStorage.getAdminRefreshToken();
  if (!storedRefresh) return false;

  try {
    await refreshToken(storedRefresh);
    return true;
  } catch {
    tokenStorage.clearAdminTokens();
    return false;
  }
}

/**
 * Admin route guard.
 *
 * Behavior: optimistic render. If a token exists in localStorage, render the
 * children immediately so static chrome appears in the first frame. The token
 * is verified in the background; if verification fails the guard tries one
 * refresh before redirecting to /admin/login.
 *
 * The `skeleton` prop is accepted for backwards compatibility but is no
 * longer rendered. Pages should render their own loading states inside their
 * data sections instead.
 */
export function AdminRouteGuard({ children /* , skeleton (deprecated) */ }) {
  const router = useRouter();
  const verifiedRef = useRef(false);
  const [tokenState, setTokenState] = useState(null); // null | 'present' | 'absent'

  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = tokenStorage.getAdminAccessToken();

    if (!token) {
      attemptRefresh().then((refreshed) => {
        if (refreshed) {
          setTokenState('present');
        } else {
          setTokenState('absent');
          router.push('/admin/login');
        }
      });
      return;
    }

    setTokenState('present');

    // Background verify - non-blocking.
    verifyToken(token).catch((error) => {
      console.log('[AdminRouteGuard] background token verify failed:', error?.message);

      attemptRefresh().then((refreshed) => {
        if (refreshed) {
          setTokenState('present');
        } else {
          tokenStorage.clearAdminTokens();
          setTokenState('absent');
          router.push('/admin/login');
        }
      });
    });
  }, [router]);

  if (tokenState === 'absent') return null;

  return children;
}
