'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateMemberToken } from '../api/memberApi';
import { tokenStorage } from '../api/tokenStorage';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('authenticating');
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const id = searchParams.get('id');
        const o = searchParams.get('o');

        if (!id || !o) {
          setStatus('error');
          setError('Missing authentication parameters');
          return;
        }

        tokenStorage.clearMemberTokens();

        await generateMemberToken(id, o);

        setStatus('success');
        router.push('/');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Authentication failed');

        const authGuard = process.env.AUTHGUARD === 'true';
        const redirectUrl = authGuard 
          ? process.env.REDIRECTURL 
          : '/';

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    };

    authenticate();
  }, [searchParams, router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      {status === 'authenticating' && (
        <>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <p>Authenticating...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'white',
            fontSize: '30px'
          }}>
            ✓
          </div>
          <p>Authentication successful! Redirecting...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#f44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'white',
            fontSize: '30px'
          }}>
            ✕
          </div>
          <p style={{ color: '#f44336', marginBottom: '10px' }}>
            {error}
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Redirecting...
          </p>
        </>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <p>Loading...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
