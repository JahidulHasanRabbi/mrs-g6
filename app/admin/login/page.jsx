'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../api/adminApi';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

        {/* Footer Text */}
        <p className="mt-6 text-center text-white/40 text-sm font-['Times_New_Roman']">
          © 2024 Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}
