'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, GraduationCap, Eye, EyeOff, Upload } from 'lucide-react';

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizationName: '',
    expertise: '',
    password: '',
    confirmPassword: '',
  });
  const [idProof, setIdProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.expertise.trim()) {
      newErrors.expertise = 'Area of expertise is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!idProof) {
      newErrors.idProof = 'ID proof is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(idProof.type)) {
        newErrors.idProof = 'Only JPG, PNG, or PDF files are allowed';
      }
      if (idProof.size > 5 * 1024 * 1024) {
        newErrors.idProof = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('organizationName', formData.organizationName);
      payload.append('expertise', formData.expertise);
      payload.append('password', formData.password);
      payload.append('idProof', idProof as File);

      const res = await fetch('/api/teacher-register', {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Teacher registration failed');
      }

      setSubmitSuccess('Teacher registration submitted! Wait for admin approval before login.');
      setTimeout(() => router.push('/teacher-login'), 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Teacher registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setIdProof(file);
    if (errors.idProof) {
      setErrors((prev) => ({ ...prev, idProof: '' }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900">
            ← Back to role selection
          </Link>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Registration</h2>
            <p className="mt-1 text-sm text-gray-500">Create your instructor account</p>
          </div>

          {submitSuccess && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{submitSuccess}</div>}
          {submitError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                  placeholder="Jane Smith" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address <span className="text-red-500">*</span></label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                  placeholder="teacher@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900">Phone Number <span className="text-red-500">*</span></label>
                <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                  placeholder="9876543210" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-900">Organization Name <span className="text-red-500">*</span></label>
                <input id="organizationName" name="organizationName" type="text" required value={formData.organizationName} onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.organizationName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                  placeholder="Acme Institute" />
                {errors.organizationName && <p className="mt-1 text-xs text-red-600">{errors.organizationName}</p>}
              </div>

              <div className="col-span-2">
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-900">Area of Expertise <span className="text-red-500">*</span></label>
                <textarea id="expertise" name="expertise" required value={formData.expertise} onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.expertise ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                  placeholder="Mathematics, Data Structures, Python"
                  rows={3} />
                {errors.expertise && <p className="mt-1 text-xs text-red-600">{errors.expertise}</p>}
              </div>

              <div className="col-span-2">
                <label htmlFor="idProof" className="block text-sm font-medium text-gray-900">ID Proof Upload <span className="text-red-500">*</span></label>
                <label className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-4 text-sm text-gray-600 hover:border-purple-400 hover:text-purple-700">
                  <Upload className="h-4 w-4" />
                  <span>{idProof ? idProof.name : 'Upload JPG, PNG, or PDF (max 5MB)'}</span>
                  <input id="idProof" name="idProof" type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
                {errors.idProof && <p className="mt-1 text-xs text-red-600">{errors.idProof}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white px-3 py-2 pr-10 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                    placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white px-3 py-2 pr-10 text-gray-900 shadow-sm focus:outline-none focus:ring-1 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                    placeholder="Confirm password" />
                  <button type="button" onClick={() => setShowConfirm((prev) => !prev)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Teacher Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/teacher-login" className="font-medium text-purple-600 hover:text-purple-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
