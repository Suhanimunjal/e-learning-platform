'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!requiresOtp) {
        // First step: login with email/password
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
          // Teacher/Admin login - needs OTP
          setRequiresOtp(true);
          setSuccess('OTP sent to your email. Please enter it below.');
        } else {
          // Student login - successful
          await login(email, password);
          router.push('/dashboard');
        }
      } else {
        // Second step: verify OTP
        const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'OTP verification failed.');
        }

        // Store token and login
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      if (err.message?.includes('OTP') || err.message?.includes('Invalid')) {
        setRequiresOtp(false);
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRequiresOtp(false);
    setOtp('');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
            {requiresOtp ? 'Enter OTP' : 'Sign in to your account'}
          </h2>

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="you@example.com"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  ← Back to login
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : requiresOtp ? 'Verify OTP' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Contact administrator for access
          </p>

          <div className="mt-6 rounded-md bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Demo Credentials (password: Test@123):</p>
            <div className="space-y-1">
              <button 
                onClick={() => { setEmail('admin@lms.com'); setPassword('Test@123'); }}
                className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800"
              >
                Admin: admin@lms.com (requires OTP)
              </button>
              <button 
                onClick={() => { setEmail('teacher@example.com'); setPassword('Test@123'); }}
                className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800"
              >
                Teacher: teacher@example.com (requires OTP)
              </button>
              <button 
                onClick={() => { setEmail('student@lms.com'); setPassword('Test@123'); }}
                className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800"
              >
                Student: student@lms.com (no OTP)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
