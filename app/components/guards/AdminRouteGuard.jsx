'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';
import { verifyToken, refreshToken } from '../../api/adminApi';
import { canAccessAdminRoute, getStoredAdminPermissions } from '../../config/adminPermissions';

const AdminGuardContext = createContext(false);

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

function AdminGuardLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07190d]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f2cb7a]/30 border-t-[#f2cb7a]" />
        <p className="text-[13px] font-medium text-[#fbeed2]/70">Loading admin panel...</p>
      </div>
    </div>
  );
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
  const alreadyGuarded = useContext(AdminGuardContext);
  const router = useRouter();
  const pathname = usePathname();
  const verifiedRef = useRef(false);
  const [tokenState, setTokenState] = useState(null); // null | 'present' | 'absent'

  useEffect(() => {
    if (alreadyGuarded) return;
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
  }, [alreadyGuarded, router]);

  useEffect(() => {
    if (alreadyGuarded) return;
    if (tokenState !== 'present') return;

    const permissions = getStoredAdminPermissions();
    if (!canAccessAdminRoute(pathname, permissions)) {
      router.replace('/admin');
    }
  }, [alreadyGuarded, pathname, router, tokenState]);

  if (alreadyGuarded) return children;
  if (tokenState === null) return <AdminGuardLoading />;
  if (tokenState === 'absent') return <AdminGuardLoading />;
  if (tokenState === 'present' && !canAccessAdminRoute(pathname, getStoredAdminPermissions())) {
    return <AdminGuardLoading />;
  }

  return (
    <AdminGuardContext.Provider value>
      {children}
    </AdminGuardContext.Provider>
  );
}
