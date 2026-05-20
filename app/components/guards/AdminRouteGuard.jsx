'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '../../api/tokenStorage';
import { verifyToken } from '../../api/adminApi';
import Skeleton from '../admin/ui/Skeleton';

export function AdminRouteGuard({ children, skeleton }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.getAdminAccessToken();
      
      if (!token) {
        // No token at all - redirect to login
        router.push('/admin/login');
        setIsLoading(false);
        return;
      }

      try {
        // Verify token is still valid
        await verifyToken(token);
        // Token is valid
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired - clear it and redirect
        console.log('Token verification failed:', error);
        tokenStorage.clearAdminTokens();
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // During token verification, render the page's own skeleton if supplied
  // (so the first paint already mirrors the destination page's layout).
  // Falls back to a neutral table-shaped skeleton.
  if (isLoading) {
    return skeleton ?? <Skeleton.TablePage rows={6} withFilters={false} withCta />;
  }

  // Don't render anything if not authenticated (redirecting to login)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
