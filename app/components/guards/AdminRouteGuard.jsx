'use client';

import { useEffect, useState } from 'react';
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

export function AdminRouteGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.getAdminAccessToken();

      if (!token) {
        // Access token missing or expired — try refresh before giving up
        const refreshed = await attemptRefresh();
        if (refreshed) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
        setIsLoading(false);
        return;
      }

      try {
        await verifyToken(token);
        setIsAuthenticated(true);
      } catch {
        // Server rejected the token — try refresh once
        const refreshed = await attemptRefresh();
        if (refreshed) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#1a1a1a'
      }}>
        <div style={{ 
          border: '4px solid rgba(233, 175, 65, 0.2)', 
          borderTop: '4px solid #e9af41', 
          borderRadius: '50%', 
          width: '50px', 
          height: '50px', 
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

  // Don't render anything if not authenticated (redirecting to login)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
