'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, verifyToken } from '../../api/adminApi';
import { tokenStorage } from '../../api/tokenStorage';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = tokenStorage.getAdminAccessToken();
      
      if (token) {
        try {
          // Verify the token is still valid
          await verifyToken(token);
          // If valid, redirect to admin dashboard
          router.push('/admin');
        } catch (err) {
          // Token is invalid or expired, clear it and show login form
          tokenStorage.clearAdminTokens();
          setIsCheckingAuth(false);
        }
      } else {
        // No token, show login form
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  const validateInput = (value) => value && value.trim().length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInput(formData.username)) {
      setError({ message: 'Username is required and cannot be empty or whitespace only' });
      return;
    }

    if (!validateInput(formData.password)) {
      setError({ message: 'Password is required and cannot be empty or whitespace only' });
      return;
    }

    setIsLoading(true);

    try {
      await adminLogin(formData.username, formData.password);
      router.push('/admin');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking if user is already authenticated
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07190d] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#e9af41] border-t-transparent mb-4"></div>
          <p className="text-white/60 font-['Times_New_Roman'] text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-[360px]">
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(180deg, #0d2a18 0%, #07190d 100%)',
            border: '1px solid rgba(233, 175, 65, 0.55)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)'
          }}
        >
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/assets/login/KingGroup44.png"
              alt="King Group 44"
              width={130}
              height={48}
              className="h-auto w-[130px]"
              priority
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <p className="text-white/85 text-[11px] tracking-[0.22em] uppercase mb-1">
              System
            </p>
            <h1 className="text-[40px] leading-none font-bold text-[#e9af41]">
              Login
            </h1>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay error={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-white text-sm font-semibold"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white rounded-md px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e9af41]"
                placeholder="Sarah Jenkins"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-white text-sm font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white rounded-md px-3 py-2.5 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e9af41]"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Image
                    src="/assets/login/Eye.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>

            {/* Keep Logged In */}
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <span className="relative inline-flex items-center justify-center w-4 h-4">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="peer appearance-none w-4 h-4 rounded-[3px] border border-[#e9af41] bg-transparent checked:bg-[#e9af41] cursor-pointer transition-colors"
                />
                {keepLoggedIn && (
                  <svg
                    className="absolute w-3 h-3 pointer-events-none text-black"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-white text-xs">Keep Logged In</span>
            </label>

            {/* Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-[120px] rounded-md px-6 py-2.5 text-base font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{
                  backgroundImage:
                    'linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)'
                }}
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
