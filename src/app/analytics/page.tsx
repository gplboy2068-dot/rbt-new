'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  HardDrive,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Flame,
  Bookmark,
  Layers,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { progressRepo } from '@/lib/storage/progress-repo';
import { QuestionAttempt, Bookmark as BookmarkType, MockExamAttempt } from '@/types';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<{
    totalAnswered: number;
    correctCount: number;
    accuracy: number;
    streakDays: number;
    subjectBreakdown: Record<string, { total: number; correct: number }>;
  }>({
    totalAnswered: 0,
    correctCount: 0,
    accuracy: 0,
    streakDays: 0,
    subjectBreakdown: {},
  });

  const [recentAttempts, setRecentAttempts] = useState<QuestionAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [mockAttempts, setMockAttempts] = useState<MockExamAttempt[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const s = await progressRepo.getStats();
      setStats(s);

      const attempts = await progressRepo.getAllAttempts();
      setRecentAttempts(attempts.slice(-15).reverse());

      const bms = await progressRepo.getAllBookmarks();
      setBookmarks(bms);

      const mocks = await progressRepo.getMockAttempts();
      setMockAttempts(mocks);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleExportData = async () => {
    const jsonStr = await progressRepo.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rtb_study_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      const res = await progressRepo.importData(content);
      if (res.success) {
        setImportStatus('✅ Backup imported successfully! All your progress is restored.');
        loadAll();
      } else {
        setImportStatus(`❌ Import failed: ${res.message}`);
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all your browser-stored study progress? (You may want to Export Backup first)'
      )
    ) {
      await progressRepo.clearAllProgress();
      loadAll();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <HardDrive className="w-4 h-4" />
            <span>Local-First Browser Persistence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span>Study Analytics & Backup</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Zero sign-up required. Your statistics, review intervals, and test records are securely stored right in your browser.
          </p>
        </div>

        {/* Export / Import Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
            title="Download JSON copy of all answers, SRS states, bookmarks"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
            <Upload className="w-4 h-4 text-purple-500" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-900 dark:text-purple-200 animate-fadeIn">
          {importStatus}
        </div>
      )}

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Questions Solved</span>
            <CheckCircle className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalAnswered}
          </div>
          <div className="text-xs text-slate-400">
            {stats.correctCount} correct answers
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Overall Accuracy</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.accuracy}%
          </div>
          <div className="text-xs text-slate-400">Across all attempted subjects</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">
            {stats.streakDays} Days
          </div>
          <div className="text-xs text-slate-400">Calculated from local timestamps</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Bookmarks Saved</span>
            <Bookmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {bookmarks.length}
          </div>
          <div className="text-xs text-slate-400">Available for fast review</div>
        </div>
      </div>

      {/* Subject Accuracy Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Subject Accuracy Breakdown
        </h3>

        {Object.keys(stats.subjectBreakdown).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(stats.subjectBreakdown).map(([subject, data]) => {
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
              return (
                <div key={subject} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subject}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {pct}% ({data.correct}/{data.total})
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">
            No questions solved yet. Start practicing to generate topic breakdowns!
          </div>
        )}
      </div>

      {/* Recent Practice Log & Privacy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Practice Log */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Activity Log</span>
          </h3>

          {recentAttempts.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentAttempts.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        att.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {att.subject}
                    </span>
                    <span className="text-slate-400">• {att.topic}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>{att.timeSpentSeconds}s</span>
                    <span>{new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No attempts logged yet.</p>
          )}
        </div>

        {/* Privacy & Reset Box */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Data Sovereignty</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your study records exist exclusively inside your device’s IndexedDB sandbox. Clearing your browser cookies/storage will reset your statistics unless you keep an exported JSON backup.
          </p>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleClearData}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Local Study Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
