import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  HardDrive,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Flame,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Layers,
  Sparkles,
} from 'lucide-react';
import { progressRepo } from '@/lib/storage/progress-repo';
import { AnalyticsService, StudentAnalyticsSummary } from '@/lib/services/analytics';
import { INITIAL_DOMAINS } from '@/data/mock-data';

export default function AnalyticsIsland() {
  const [analytics, setAnalytics] = useState<StudentAnalyticsSummary | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const attempts = await progressRepo.getAllAttempts();
      const analysis = AnalyticsService.analyzeStudentPerformance(attempts);
      setAnalytics(analysis);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleExport = async () => {
    const jsonStr = await progressRepo.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbt_prep_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const count = await progressRepo.importData(content);
        setImportStatus(`✅ Successfully restored ${count} study records!`);
        await loadAll();
        setTimeout(() => setImportStatus(null), 4000);
      } catch {
        setImportStatus('❌ Failed to restore backup file. Invalid format.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your local study history? This action cannot be undone.')) {
      await progressRepo.clearAll();
      await loadAll();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <BarChart3 className="w-4 h-4" />
            <span>Performance Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <span>Study Analytics & Mastery Tracking</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time accuracy and domain mastery tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/practice-questions"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Start Practice Drill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold animate-fadeIn">
          {importStatus}
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Questions Answered</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics ? analytics.totalAttempts : 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Practice drills completed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Diagnostic Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics ? `${analytics.accuracy}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {analytics && analytics.totalAttempts > 0
              ? `${analytics.correctAttempts} of ${analytics.totalAttempts} correct`
              : 'No attempts recorded yet'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Study Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics ? `${analytics.streakDays} Day` : '0 Day'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Daily practice consistency</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Identified Weak Areas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics ? analytics.weakTopics.length : 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Accuracy &lt; 75% threshold</div>
        </div>
      </div>

      {/* Main Grid: Adaptive Recommendations & Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommendations */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Adaptive Learning Next Steps</h2>
                <p className="text-xs text-slate-500">Recommended study actions generated from your progress.</p>
              </div>
            </div>

            <div className="space-y-4">
              {analytics && analytics.recommendations.length > 0 ? (
                analytics.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-100 dark:bg-brand-950/80 text-brand-800 dark:text-brand-300">
                        Priority {rec.priority}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                      💡 <strong>Why:</strong> {rec.reason}
                    </div>

                    <a
                      href={rec.actionUrl}
                      className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                  No recommendations yet. Start practicing questions to generate personalized guidance.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: BACB Domain Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">BACB Task List Performance</h2>
                <p className="text-xs text-slate-500">6 core domains required for the RBT certification examination.</p>
              </div>
            </div>

            <div className="space-y-4">
              {INITIAL_DOMAINS.map((domain) => {
                const recorded = analytics?.domainBreakdown.find(
                  (d) => d.name.toLowerCase().includes(domain.name.toLowerCase()) || d.key === domain.id
                );
                const accuracy = recorded ? recorded.accuracy : 0;
                const total = recorded ? recorded.totalAttempts : 0;
                const correct = recorded ? recorded.correctAttempts : 0;

                return (
                  <div key={domain.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Domain {domain.code}: {domain.name}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{domain.description}</p>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{accuracy}%</span>
                        <div className="text-[10px] text-slate-400">
                          {total > 0 ? `${correct}/${total} correct` : '0 attempts'}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          total === 0
                            ? 'bg-slate-300 dark:bg-slate-600'
                            : accuracy >= 80
                            ? 'bg-emerald-500'
                            : accuracy >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(total === 0 ? 0 : accuracy, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold">Data Management & Backup</span>
            <p className="text-xs text-slate-500 font-normal">
              Export your study progress to keep a personal backup or restore your history on another device.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center gap-1.5 sm:ml-auto transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
