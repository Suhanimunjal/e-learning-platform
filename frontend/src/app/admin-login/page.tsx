'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!requiresOtp) {
        const res = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Login failed. Please try again.');
        }

        if (data.requiresOtp) {
          setRequiresOtp(true);
          setSuccess('OTP sent to your email. Please enter it below.');
          setResendCooldown(30);
        } else {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        }
      } else {
        const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'OTP verification failed.');
        }

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      if (err.message?.includes('OTP') || err.message?.includes('Invalid') || err.message?.includes('session')) {
        setRequiresOtp(false);
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP.');
      }

      setSuccess('OTP resent to your email.');
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    setRequiresOtp(false);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {requiresOtp ? 'Enter OTP' : 'Admin Login'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {requiresOtp ? 'Verify your identity' : 'Welcome back!'}
            </p>
          </div>

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requiresOtp ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-blue-50 p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    An OTP has been sent to <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || resending}
                    className={`text-sm ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    {resending ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Please wait...' : requiresOtp ? 'Verify OTP' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="mt-2 text-sm text-gray-500">
              <Link href="/login" className="font-medium text-gray-500 hover:text-gray-700">
                ← Back to role selection
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
