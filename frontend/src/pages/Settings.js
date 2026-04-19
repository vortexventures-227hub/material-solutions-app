import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, CardHeader, CardTitle, CardContent } from '../components/Layout';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

function getPasswordStrength(password) {
  if (password.length === 0) return null;
  if (password.length < 8) return { label: 'Too short', color: 'bg-red-500', width: '20%' };
  if (password.length < 12) return { label: 'Weak', color: 'bg-orange-500', width: '40%' };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 2) return { label: 'Fair', color: 'bg-yellow-500', width: '60%' };
  if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '80%' };
  return { label: 'Strong', color: 'bg-neon-cyan', width: '100%' };
}

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
      // Give user time to read the success message, then logout
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader title="Account Settings" description="Manage your account security" />

      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock size={16} className="text-neon-cyan" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in">
                <CheckCircle size={40} className="text-neon-cyan" />
                <p className="font-semibold text-foreground">Password changed successfully</p>
                <p className="text-sm text-muted-foreground">
                  You'll be logged out — please sign in with the new password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 animate-in fade-in">
                    <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    New Password <span className="text-muted-foreground/60 normal-case font-normal">(min. 12 characters)</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="Enter new password"
                  />
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-11 px-4 bg-muted border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all placeholder:text-muted-foreground/50 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-500/50 focus:border-red-500/50'
                        : 'border-border focus:border-neon-cyan/50'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (confirmPassword !== '' && confirmPassword !== newPassword)}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-neon-cyan/20 hover:shadow-lg hover:shadow-neon-cyan/30"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
