import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, CardHeader, CardTitle, CardContent } from '../components/Layout';
import { Loader2, Lock, CheckCircle, AlertCircle, Mail, Megaphone } from 'lucide-react';
import api from '../api';

const FALLBACK_PUBLISH_PLATFORMS = [
  {
    key: 'materialsolutionsnj',
    label: 'MaterialSolutionsNJ.com',
    status: 'available',
    available: true,
    mode: 'automatic',
    completion: 95,
    nextStep: 'Live storefront bridge publishes the listing page and payload.',
  },
  {
    key: 'craigslist',
    label: 'Craigslist',
    status: 'manual_ready',
    available: false,
    mode: 'guarded_local_draft',
    completion: 70,
    nextStep: 'Generate a guarded draft and paste manually after review.',
  },
  {
    key: 'facebook_marketplace',
    label: 'Facebook Marketplace',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 65,
    nextStep: 'Confirm Chris-approved account/page, category fit, and keep operator-reviewed drafts before any posting workflow.',
  },
  {
    key: 'machinerytrader',
    label: 'MachineryTrader',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 66,
    nextStep: 'Confirm MachineryTrader dealer/advertiser account, Sandhills portal/feed access, package, billing owner, and forklift category before posting.',
  },
  {
    key: 'equipfinder',
    label: 'EquipFinder',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm EquipFinder vendor/contact path, public site reachability, seller listing fit, and category acceptance before posting.',
  },
  {
    key: 'machineryats',
    label: 'MachineryATS',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm current MachineryATS domain/portal, vendor credentials, listing method, and forklift category fit before posting.',
  },
  {
    key: 'ebay',
    label: 'eBay Business',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm eBay Business seller account, OAuth scopes, category, item specifics, and business policies before API or browser posting.',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm LinkedIn Company Page admin, organization URN, Marketing Developer Platform access, and organization social posting scopes before API posting.',
  },
  {
    key: 'google_business_profile',
    label: 'Google Business Profile',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm owner/manager access, business.manage OAuth consent, accountId/locationId, and Local Post type before API posting.',
  },
  {
    key: 'forkliftaction_forum',
    label: 'Forkliftaction Forum',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm approved Forkliftaction member account, forum profile, conduct rules, category, and whether Machine Listing/Business Listing/advertising is the correct commercial path.',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    status: 'manual_required',
    available: false,
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm channel manager approval, OAuth upload scope, video asset, metadata, privacy, made-for-kids setting, and quota/audit status before upload.',
  },
];

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [platformError, setPlatformError] = useState('');

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/publish/platforms')
      .then((res) => {
        if (!cancelled) setPlatforms(res.data.platforms || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setPlatforms(FALLBACK_PUBLISH_PLATFORMS);
          setPlatformError(err.response?.data?.error || 'Live Publish Button platform status unavailable; showing current completion map.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError('New password must be at least 12 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      // Give user time to read the success message, then logout
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    const normalizedEmail = newEmail.trim().toLowerCase();
    const normalizedConfirm = confirmEmail.trim().toLowerCase();

    if (normalizedEmail !== normalizedConfirm) {
      setEmailError('Email addresses do not match');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      return;
    }

    if (normalizedEmail === user?.email?.toLowerCase()) {
      setEmailError('New email must be different from your current email');
      return;
    }

    setEmailLoading(true);
    try {
      await api.post('/api/auth/change-email', { currentPassword: emailPassword, newEmail: normalizedEmail });
      setEmailSuccess(true);
      // Tokens are invalidated server-side; re-login with the new email.
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setEmailError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader title="Account Settings" description="Manage your account security and Publish Button readiness" />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone size={16} className="text-neon-cyan" />
              Publish Button Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3.5 mb-3">
                <AlertCircle size={15} className="text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-600 font-medium">{platformError}</p>
              </div>
            )}
            {platforms.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <div key={platform.key} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{platform.label || platform.key.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.available ? 'Live channel' : 'Guarded/manual review'} · {platform.mode?.replace(/_/g, ' ') || platform.status?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 ${
                      platform.available
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {platform.status.replace('_', ' ')}
                    </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        <span>Completion</span>
                        <span>{platform.completion || 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${platform.available ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                          style={{ width: `${platform.completion || 0}%` }}
                        />
                      </div>
                      {platform.nextStep && (
                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{platform.nextStep}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 border border-border p-3.5">
                <Loader2 size={15} className="text-muted-foreground animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Checking Publish Button channels...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail size={16} className="text-neon-cyan" />
              Change Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in">
                <CheckCircle size={40} className="text-neon-cyan" />
                <p className="font-semibold text-foreground">Email changed successfully</p>
                <p className="text-sm text-muted-foreground">
                  You'll be logged out. Please sign in with the new email address.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {emailError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 animate-in fade-in">
                    <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{emailError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-11 px-4 bg-muted/60 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    New Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="Enter new login email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Confirm New Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={`w-full h-11 px-4 bg-muted border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all placeholder:text-muted-foreground/50 ${
                      confirmEmail && confirmEmail.trim().toLowerCase() !== newEmail.trim().toLowerCase()
                        ? 'border-red-500/50 focus:border-red-500/50'
                        : 'border-border focus:border-neon-cyan/50'
                    }`}
                    placeholder="Confirm new login email"
                  />
                  {confirmEmail && confirmEmail.trim().toLowerCase() !== newEmail.trim().toLowerCase() && (
                    <p className="text-xs text-red-400 mt-1">Email addresses do not match</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="Confirm current password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailLoading || (confirmEmail !== '' && confirmEmail.trim().toLowerCase() !== newEmail.trim().toLowerCase())}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-neon-cyan/20 hover:shadow-lg hover:shadow-neon-cyan/30"
                >
                  {emailLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      Update Email
                    </>
                  )}
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock size={16} className="text-neon-cyan" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passwordSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in">
                <CheckCircle size={40} className="text-neon-cyan" />
                <p className="font-semibold text-foreground">Password changed successfully</p>
                <p className="text-sm text-muted-foreground">
                  You'll be logged out — please sign in with the new password.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {passwordError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 animate-in fade-in">
                    <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{passwordError}</p>
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
                  disabled={passwordLoading || (confirmPassword !== '' && confirmPassword !== newPassword)}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-neon-cyan/20 hover:shadow-lg hover:shadow-neon-cyan/30"
                >
                  {passwordLoading ? (
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
