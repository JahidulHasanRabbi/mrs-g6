'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateMemberToken } from '../api/memberApi';
import { tokenStorage } from '../api/tokenStorage';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('authenticating');
  const [error, setError] = useState(null);
  // useSearchParams/router change identity across renders, so the effect can
  // re-fire and POST a second token — which also clears the first one mid-load.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const authenticate = async () => {
      try {
        const id = searchParams.get('id');
        const o = searchParams.get('o');
        const page = searchParams.get('page');

        if (!id || !o) {
          setStatus('error');
          setError('Missing authentication parameters');
          
          // Redirect to o if available, otherwise to /
          const redirectUrl = o 
            ? (o.startsWith('http') ? o : `https://${o}`)
            : '/';
          
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1000);
          return;
        }

        // Clear old tokens and old o
        tokenStorage.clearMemberTokens();
        tokenStorage.clearRedirectO();

        // Normalize o to full URL if needed
        const normalizedO = o.startsWith('http') ? o : `https://${o}`;

        // Save new o to localStorage
        tokenStorage.setRedirectO(normalizedO);

        // Call API
        await generateMemberToken(id, o);

        setStatus('success');

        // Navigate to page parameter or homepage
        const targetPage = page || '/';
        
        setTimeout(() => {
          router.push(targetPage);
        }, 100);
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Authentication failed');

        // On fail, redirect to saved o or fallback to /
        const savedO = tokenStorage.getRedirectO();
        let fallbackUrl = '/';
        if (savedO) {
          fallbackUrl = savedO.startsWith('http') ? savedO : `https://${savedO}`;
        }

        setTimeout(() => {
          window.location.href = fallbackUrl;
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
