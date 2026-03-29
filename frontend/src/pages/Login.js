import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ModeToggle } from '../components/ModeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="max-w-md w-full space-y-10 p-8 sm:p-10 bg-card border border-border rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-brand-500/20">
            MS
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">
            Sales Machine
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-bold uppercase tracking-widest">
            Material Solutions Portal
          </p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-4" aria-live="polite">
              <div className="text-xs text-red-800 dark:text-red-400 font-black uppercase tracking-tight">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">
                Security ID (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full h-14 px-5 border-2 border-muted bg-muted/30 text-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold placeholder:text-gray-400"
                placeholder="bill@materialsolutionsnj.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">
                Access Token (Password)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full h-14 px-5 border-2 border-muted bg-muted/30 text-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold placeholder:text-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center h-14 items-center px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all active:scale-[0.97] shadow-xl shadow-brand-500/30"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-label="Loading">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {loading ? 'Verifying...' : 'Authenticate Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
