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

    console.log('[MemberRouteGuard] Checking auth for pathname:', pathname);
    lastPathnameRef.current = pathname;
    checkedRef.current = true;

    const authGuardEnabled = process.env.NEXT_PUBLIC_AUTHGUARD === 'true';
    console.log('[MemberRouteGuard] authGuardEnabled:', authGuardEnabled);

    if (pathname === '/auth') {
      console.log('[MemberRouteGuard] Auth page, allowing access');
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    if (!authGuardEnabled) {
      console.log('[MemberRouteGuard] Auth guard disabled, allowing access');
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const token = tokenStorage.getMemberAccessToken();
    console.log('[MemberRouteGuard] Token exists:', !!token);
    
    if (!token) {
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECTURL || '/';
      console.log('[MemberRouteGuard] No token, redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
      return;
    }

    console.log('[MemberRouteGuard] Token valid, allowing access');
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
    return null;
  }

  return children;
}
