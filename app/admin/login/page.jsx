'use client';

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

  const validateInput = (value) => {
    return value && value.trim().length > 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError(null);
    }
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
    <div className="min-h-screen bg-[#07190d] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white font-['Times_New_Roman'] mb-2">
              Admin Login
            </h1>
            <p className="text-white/60 text-sm font-['Times_New_Roman']">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="block text-white font-['Times_New_Roman'] text-sm font-medium"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41] focus:border-transparent transition-all font-['Times_New_Roman']"
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-white font-['Times_New_Roman'] text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41] focus:border-transparent transition-all font-['Times_New_Roman']"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-lg px-6 py-3 text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Times_New_Roman'] text-black"
              style={{
                backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
