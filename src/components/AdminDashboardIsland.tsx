import React, { useState, useEffect } from 'react';
import { Sliders, Cpu, Save, LogOut } from 'lucide-react';
import { RateLimitConfig } from '@/types';

export default function AdminDashboardIsland() {
  const [config, setConfig] = useState<RateLimitConfig>({
    aiQueriesPerHourPerIp: 15,
    aiQueriesPerDayPerIp: 50,
    maxBatchGeneration: 5,
    aiTutorEnabled: true,
    rateLimitWindowMs: 3600000,
  });

  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.config) setConfig(d.config);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setStatus('✅ Settings updated successfully!');
        setTimeout(() => setStatus(null), 4000);
      }
    } catch {
      setStatus('❌ Failed to update settings.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'rtb_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/admin/login';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin Control</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Sliders className="w-8 h-8" />
            <span>AI Limits & System Controls</span>
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {status && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-sm font-semibold border border-emerald-200">
          {status}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-600" />
          <span>Anonymous IP Rate Limiting</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                AI Queries Per IP / Hour
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={config.aiQueriesPerHourPerIp}
                onChange={(e) => setConfig({ ...config, aiQueriesPerHourPerIp: parseInt(e.target.value, 10) || 1 })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                AI Queries Per IP / Day
              </label>
              <input
                type="number"
                min={1}
                max={2000}
                value={config.aiQueriesPerDayPerIp}
                onChange={(e) => setConfig({ ...config, aiQueriesPerDayPerIp: parseInt(e.target.value, 10) || 1 })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save AI Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
