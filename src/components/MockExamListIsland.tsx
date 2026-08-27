import React, { useState, useEffect } from 'react';
import { FileCheck2, Clock, Award, ChevronRight, BarChart, Sparkles } from 'lucide-react';
import { INITIAL_MOCK_EXAMS } from '@/data/mock-data';
import { MockExamAttempt } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

export default function MockExamListIsland() {
  const [pastAttempts, setPastAttempts] = useState<MockExamAttempt[]>([]);

  useEffect(() => {
    progressRepo.getMockAttempts().then(setPastAttempts);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span>BACB RBT Exam Simulation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileCheck2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>Timed Mock Exams</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl">
          Complete timed diagnostic exams matching official BACB Task List specifications. All scores and review records are securely stored locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_MOCK_EXAMS.map((exam) => {
          const attempts = pastAttempts.filter((a) => a.examId === exam.id);
          const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {exam.domain}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes} Mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{exam.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{exam.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <span>{exam.totalQuestions} Questions</span>
                  <span>•</span>
                  <span>Pass: {exam.passingScorePercent}%</span>
                  {bestScore !== null && (
                    <span className="text-emerald-600 font-bold">• Best: {bestScore}%</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {attempts.length > 0 ? `${attempts.length} attempts logged` : 'Not attempted'}
                </span>
                <a
                  href={`/mock-exam/${exam.id}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md flex items-center gap-1.5"
                >
                  <span>{attempts.length > 0 ? 'Retake Exam' : 'Start Exam'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {pastAttempts.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-brand-600" />
            <span>Local Browser Attempt History</span>
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Exam Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastAttempts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{a.examTitle}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{new Date(a.completedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{a.score}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${a.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {a.score >= 80 ? 'Passed' : 'Needs Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
