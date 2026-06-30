'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';

export function MemberRouteGuard({ children }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkedRef = useRef(false);
  const lastPathnameRef = useRef(null);

  useEffect(() => {
    // Only run if pathname changed or first time
    if (checkedRef.current && lastPathnameRef.current === pathname) {
      return;
    }

    lastPathnameRef.current = pathname;
    checkedRef.current = true;

    const authGuardEnabled = process.env.NEXT_PUBLIC_AUTHGUARD === 'true';

    if (pathname === '/auth') {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    if (!authGuardEnabled) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const token = tokenStorage.getMemberAccessToken();

    if (!token) {
      // Prefer the saved `o` (set during /auth), then the env-configured
      // login URL. Both must be EXTERNAL destinations — never redirect to a
      // guarded member route like `/`, or this guard re-runs on the reload,
      // finds no token again, and loops forever (continuous refresh).
      const savedO = tokenStorage.getRedirectO();
      const envRedirect = process.env.NEXT_PUBLIC_REDIRECTURL;

      let redirectUrl = null;
      if (savedO) {
        redirectUrl = savedO.startsWith('http') ? savedO : `https://${savedO}`;
      } else if (envRedirect) {
        redirectUrl = envRedirect;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // No external destination configured: stop and fail visibly instead
        // of bouncing back into the same guarded page.
        setIsAuthenticated(false);
        setIsLoading(false);
      }
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite' 
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          Not authenticated
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          No active session was found. Please open the app from your login link.
        </p>
      </div>
    );
  }

  return children;
}
