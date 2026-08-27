'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  Award,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart,
  Layers,
  Sparkles,
} from 'lucide-react';
import { INITIAL_MOCK_EXAMS } from '@/data/mock-data';
import { MockExamAttempt } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

export default function MockExamListPage() {
  const [pastAttempts, setPastAttempts] = useState<MockExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const history = await progressRepo.getMockAttempts();
        setPastAttempts(history);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Timed Simulation</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileCheck2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>Mock Exam Simulations</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl">
          Test your readiness with full-length timed diagnostic exams. Instant results, accuracy breakdown, and progress tracking are stored securely in your browser.
        </p>
      </div>

      {/* Available Exams Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Diagnostic Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_MOCK_EXAMS.map((exam) => {
            const examAttempts = pastAttempts.filter((a) => a.examId === exam.id);
            const bestScore =
              examAttempts.length > 0
                ? Math.max(...examAttempts.map((a) => a.score))
                : null;

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {exam.subject}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                    <span>{exam.totalQuestions} Questions</span>
                    <span>•</span>
                    <span>Pass: {exam.passingScore}%</span>
                    {bestScore !== null && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Best: {bestScore}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {examAttempts.length > 0 ? `${examAttempts.length} Attempts recorded` : 'Not attempted yet'}
                  </span>

                  <Link
                    href={`/mock-exam/${exam.id}`}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>{examAttempts.length > 0 ? 'Retake Exam' : 'Start Exam'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Mock Attempts History */}
      {pastAttempts.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Your Browser Mock History</span>
            </h2>
            <span className="text-xs text-slate-500">Stored in IndexedDB</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Exam Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time Spent</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pastAttempts.map((attempt) => {
                    const isPassed = attempt.score >= 70;
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {attempt.examTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                          {new Date(attempt.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {attempt.score}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {isPassed ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
