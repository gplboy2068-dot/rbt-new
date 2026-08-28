'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid administrative credentials.');
      }
    } catch {
      setError('Connection error logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Administrative access only. The public student interface requires zero login.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              placeholder="Enter admin username"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              placeholder="Enter admin password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
