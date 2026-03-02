'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';

export function MemberRouteGuard({ children }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/auth') {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const authGuardEnabled = process.env.AUTHGUARD === 'true';

    if (!authGuardEnabled) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const token = tokenStorage.getMemberAccessToken();
    
    if (!token) {
      const redirectUrl = process.env.REDIRECTURL || '/';
      window.location.href = redirectUrl;
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [pathname]);

  const authGuardEnabled = process.env.AUTHGUARD === 'true';
  
  if (!authGuardEnabled || pathname === '/auth') {
    return children;
  }

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
