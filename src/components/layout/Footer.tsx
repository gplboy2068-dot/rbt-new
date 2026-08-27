import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, HardDrive, Lock, Heart, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-20">
      {/* Open Access & Privacy Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-brand-50/50 dark:bg-brand-950/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  100% Open Access & Privacy Guaranteed
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  No sign up • No login • Zero personal data collected. All your study progress stays in your browser.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/analytics"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <HardDrive className="w-3.5 h-3.5 text-brand-500" />
                <span>Backup / Export Progress</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                RTB Platform
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              The high-yield, friction-free learning platform. Built for students who want to jump straight into practice without registration friction or paywalls.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500 pt-2">
              Persistence Engine: IndexedDB v1.0 • Client-side SRS SuperMemo-2
            </div>
          </div>

          {/* Quick Study Access */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Study Modules
            </h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/practice" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Practice Questions
                </Link>
              </li>
              <li>
                <Link href="/mock-exam" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Timed Mock Exams
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Spaced Repetition Flashcards
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  AI Study Tutor
                </Link>
              </li>
              <li>
                <Link href="/study-guides" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Formula & Concept Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Admin */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform & Tools
            </h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/analytics" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Local Analytics & Backup
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-xs"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>© 2026 RTB (Ready To Boost). Free & Open Access Education.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for unrestricted learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
