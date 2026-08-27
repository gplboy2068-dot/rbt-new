'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  BarChart,
  HardDrive,
  Users,
  Cpu,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { RateLimitConfig } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [config, setConfig] = useState<RateLimitConfig>({
    aiQueriesPerHourPerIp: 15,
    aiQueriesPerDayPerIp: 50,
    maxBatchGeneration: 5,
    aiTutorEnabled: true,
    rateLimitWindowMs: 3600000,
  });

  const [metrics, setMetrics] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resConfig, resMetrics] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/metrics'),
      ]);

      if (resConfig.status === 401 || resMetrics.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (resConfig.ok) {
        const d = await resConfig.json();
        setConfig(d.config);
      }
      if (resMetrics.ok) {
        const m = await resMetrics.json();
        setMetrics(m.metrics);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const d = await res.json();
      if (res.ok) {
        setSaveStatus('✅ AI Rate limits and controls successfully updated!');
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus(`❌ Error: ${d.error || 'Could not update config.'}`);
      }
    } catch {
      setSaveStatus('❌ Error saving configuration.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'rtb_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Sliders className="w-8 h-8 text-slate-900 dark:text-white" />
            <span>AI Rate Limits & Platform Operations</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Configure anonymous rate limits, protect against AI API abuse, and monitor telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-900 dark:text-emerald-200 animate-fadeIn">
          {saveStatus}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Tracked IPs Today</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.anonymousIpsTracked}
            </div>
            <div className="text-[11px] text-slate-400">Unique client addresses</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Available Questions</div>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {metrics.totalQuestionsAvailable}
            </div>
            <div className="text-[11px] text-slate-400">Across 5 subjects</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Mock Exams / Decks</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {metrics.totalMockExams} / {metrics.totalFlashcards}
            </div>
            <div className="text-[11px] text-slate-400">Full diagnostic simulations</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Student Auth Mode</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
              Zero Signup / Open Access
            </div>
            <div className="text-[11px] text-slate-400">Client-side IndexedDB Engine</div>
          </div>
        </div>
      )}

      {/* AI Rate Limit Configuration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-600" />
            <span>Anonymous User Rate Limit & AI Cost Safeguards</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Set real-time limits applied to anonymous IP addresses to prevent API abuse, excessive token billing, and spam.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                AI Queries Per IP / Hour
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={config.aiQueriesPerHourPerIp}
                onChange={(e) =>
                  setConfig({ ...config, aiQueriesPerHourPerIp: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-400">Maximum queries permitted per hourly sliding window.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                AI Queries Per IP / Day
              </label>
              <input
                type="number"
                min={1}
                max={2000}
                value={config.aiQueriesPerDayPerIp}
                onChange={(e) =>
                  setConfig({ ...config, aiQueriesPerDayPerIp: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-400">Daily quota cap before 24-hour reset.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Max Question Generation Batch
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.maxBatchGeneration}
                onChange={(e) =>
                  setConfig({ ...config, maxBatchGeneration: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-[11px] text-slate-400">Max challenges generated in a single request.</p>
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                AI Study Assistant Master Switch
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aiTutorEnabled}
                  onChange={(e) => setConfig({ ...config, aiTutorEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {config.aiTutorEnabled ? 'AI Tutor Enabled (Active)' : 'AI Tutor Paused (Emergency Stop)'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save AI Rate Limits</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
