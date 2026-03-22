'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/api';
import {
  ArrowLeft,
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '', rollNo: '', year: '', branch: '', course: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Populate profile from user context when modal opens
  const openProfileModal = () => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: (user as any).phone || '',
        rollNo: (user as any).rollNo || '',
        year: (user as any).year || '',
        branch: (user as any).branch || '',
        course: (user as any).course || '',
      });
    }
    setProfileMsg(null);
    setShowProfileModal(true);
  };

  const openPasswordModal = () => {
    setOtpStep('send');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg(null);
    setResendCooldown(0);
    setShowPasswordModal(true);
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setPasswordMsg(null);
    try {
      await auth.sendPasswordOtp();
      setOtpStep('verify');
      setPasswordMsg({ type: 'success', text: 'OTP sent to your email address' });
      setResendCooldown(30);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to send OTP' });
    } finally { setSendingOtp(false); }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setPasswordMsg(null);
    try {
      await auth.sendPasswordOtp();
      setPasswordMsg({ type: 'success', text: 'OTP resent to your email address' });
      setResendCooldown(30);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to resend OTP' });
    } finally { setResending(false); }
  };

  const handleProfileSave = async () => {
    if (!profile.name.trim()) { setProfileMsg({ type: 'error', text: 'Name is required' }); return; }
    if (profile.name.trim().length < 2) { setProfileMsg({ type: 'error', text: 'Name must be at least 2 characters' }); return; }
    if (profile.phone && !/^[\d\s\-+()]{7,20}$/.test(profile.phone)) { setProfileMsg({ type: 'error', text: 'Invalid phone number' }); return; }

    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await auth.updateProfile(profile);
      updateUser(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setShowProfileModal(false), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || 'Failed to update profile';
      setProfileMsg({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : msg });
    } finally { setProfileSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!otp || otp.length < 4) { setPasswordMsg({ type: 'error', text: 'Enter the OTP sent to your email' }); return; }
    if (!newPassword || newPassword.length < 8) { setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match' }); return; }

    setChangingPw(true);
    setPasswordMsg(null);
    try {
      await auth.changePasswordWithOtp(otp, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to change password' });
    } finally { setChangingPw(false); }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Account Info */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Name" value={user?.name} />
            <InfoField label="Email" value={user?.email} />
            <InfoField label="Phone" value={(user as any)?.phone} />
            <InfoField label="Role" value={user?.role} />
            {(user as any)?.rollNo && <InfoField label="Roll No" value={(user as any)?.rollNo} />}
            {(user as any)?.year && <InfoField label="Year" value={(user as any)?.year} />}
            {(user as any)?.branch && <InfoField label="Branch" value={(user as any)?.branch} />}
            {(user as any)?.course && <InfoField label="Course" value={(user as any)?.course} />}
          </div>
        </section>

        {/* Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Update your personal information</p>
            <Button onClick={openProfileModal}>Edit Profile</Button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Verify your email via OTP to change password</p>
            <Button onClick={openPasswordModal}>Change Password</Button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile" size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
            </div>
            {user?.role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <input type="text" value={profile.rollNo} onChange={e => setProfile({ ...profile, rollNo: e.target.value })}
                      placeholder="e.g. CS2025001"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select value={profile.year} onChange={e => setProfile({ ...profile, year: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input type="text" value={profile.branch} onChange={e => setProfile({ ...profile, branch: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <input type="text" value={profile.course} onChange={e => setProfile({ ...profile, course: e.target.value })}
                      placeholder="e.g. MCA, B.Tech"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </>
            )}

            {profileMsg && (
              <div className={`flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'} rounded-lg px-3 py-2`}>
                {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {profileMsg.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>Cancel</Button>
              <Button onClick={handleProfileSave} loading={profileSaving}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* Change Password Modal */}
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="md">
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Mail className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Email verification required</p>
                <p>We will send an OTP to <strong>{user?.email}</strong> to verify your identity.</p>
              </div>
            </div>

            {otpStep === 'send' ? (
              <div className="flex justify-center">
                <Button onClick={handleSendOtp} loading={sendingOtp}>
                  <Mail className="mr-2 h-4 w-4" /> Send OTP to Email
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP *</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code" maxLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-center tracking-widest text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleResendOtp}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} loading={changingPw} className="w-full">
                  <Lock className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </>
            )}

            {passwordMsg && (
              <div className={`flex items-center gap-2 text-sm ${passwordMsg.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'} rounded-lg px-3 py-2`}>
                {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {passwordMsg.text}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</p>
    </div>
  );
}
