'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  Layers,
  Bot,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  HardDrive,
  Check,
  X,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { progressRepo } from '@/lib/storage/progress-repo';

export default function HomePage() {
  const [sampleQuestion, setSampleQuestion] = useState(INITIAL_QUESTIONS[0]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState({ totalAnswered: 0, accuracy: 0, streakDays: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await progressRepo.getStats();
        setStats(s);
      } catch {
        // ignore
      }
    };
    loadStats();
  }, []);

  const handleSelectOption = async (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === sampleQuestion.correctAnswer;
    await progressRepo.saveAttempt({
      questionId: sampleQuestion.id,
      subject: sampleQuestion.subject,
      topic: sampleQuestion.topic,
      selectedAnswer: idx,
      isCorrect,
      timeSpentSeconds: 5,
    });

    const updated = await progressRepo.getStats();
    setStats(updated);
  };

  const handleNextSample = () => {
    const nextIdx = (INITIAL_QUESTIONS.indexOf(sampleQuestion) + 1) % INITIAL_QUESTIONS.length;
    setSampleQuestion(INITIAL_QUESTIONS[nextIdx]);
    setSelectedOpt(null);
    setIsAnswered(false);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Top Open Access Notification Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>
          <strong>Phase 1 Live:</strong> 100% Free & Open Access. No account, no signup, no login needed.
        </span>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-800 dark:text-brand-300 text-xs sm:text-sm font-semibold">
              <Zap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Zero Registration Barrier • Immediate Study Flow</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Master Any Subject.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500">
                Zero Friction.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              Instant access to high-yield practice questions, full timed mock exams, Spaced Repetition (SRS) flashcards, and an AI Tutor.
              <strong> No account creation. No password. Just study.</strong>
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/practice"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Start Practicing Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/mock-exam"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Take Mock Exam</span>
              </Link>

              <Link
                href="/flashcards"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>SRS Flashcards</span>
              </Link>
            </div>

            {/* Quick Live Stats / Status */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-brand-500" />
                <span>Saved locally in browser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{stats.streakDays} Day Active Streak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{stats.totalAnswered} Questions Solved</span>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Live Interactive Question Widget */}
          <div className="lg:col-span-5">
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {sampleQuestion.subject}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{sampleQuestion.topic}</span>
                </div>
                <button
                  onClick={handleNextSample}
                  className="text-xs flex items-center gap-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 transition-colors"
                  title="Try another question"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Next</span>
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Instant Test Drive • No Login Needed
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {sampleQuestion.question}
                </h3>

                <div className="space-y-2.5 pt-2">
                  {sampleQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOpt === idx;
                    const isCorrect = idx === sampleQuestion.correctAnswer;
                    let btnStyle =
                      'border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40';

                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle =
                          'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        btnStyle =
                          'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200';
                      } else {
                        btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-grow">{opt}</span>
                        {isAnswered && isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 animate-fadeIn">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                      <span>Explanation:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{sampleQuestion.explanation}</p>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Saved to your local browser history
                      </span>
                      <button
                        onClick={handleNextSample}
                        className="text-xs px-2.5 py-1 rounded bg-brand-600 text-white font-semibold hover:bg-brand-700"
                      >
                        Try Another →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 6 Core Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Complete Study Suite — 100% Open Access
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Every feature is open and immediately usable without creating an account or paying a cent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Practice */}
          <Link
            href="/practice"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center justify-between">
                <span>Practice Questions</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Filter by Mathematics, Science, Logic, Computer Science, and Verbal Reasoning with instant answers.
              </p>
            </div>
            <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
              Instant scoring • Explanations included →
            </div>
          </Link>

          {/* Card 2: Mock Exams */}
          <Link
            href="/mock-exam"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>Timed Mock Exams</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Realistic exam simulations with a countdown timer, question palette navigator, and detailed score breakdown.
              </p>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              Full diagnostic report saved locally →
            </div>
          </Link>

          {/* Card 3: SRS Flashcards */}
          <Link
            href="/flashcards"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                <span>Spaced Repetition (SRS)</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Scientifically proven SuperMemo-2 algorithm schedules your flashcard reviews right when memory decays.
              </p>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Calculated & stored in browser IndexedDB →
            </div>
          </Link>

          {/* Card 4: AI Tutor */}
          <Link
            href="/ai-tutor"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>AI Study Tutor</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ask tough questions, request step-by-step mathematical proofs, or generate custom practice challenges.
              </p>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Zero login • Free daily IP allowance →
            </div>
          </Link>

          {/* Card 5: Study Guides */}
          <Link
            href="/study-guides"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Study Guides & Cheatsheets</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Fast-track formula reference sheets, key algorithmic paradigms, and high-yield concept summaries.
              </p>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Instant searchable reference →
            </div>
          </Link>

          {/* Card 6: Analytics & Backup */}
          <Link
            href="/analytics"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                <span>Local Analytics & Backup</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track your accuracy, streak, and weak topics. Export and import your full study record with 1 click.
              </p>
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              Export/Import JSON backup anytime →
            </div>
          </Link>
        </div>
      </section>

      {/* Privacy Guarantee Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Our Privacy & Open Access Pledge</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Your study data belongs to you. Not a server.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                We believe learning tools should be frictionless. We do not ask for your name, email, or credit card.
                All your progress, attempts, flashcard intervals, and bookmarks are stored securely inside your browser via IndexedDB.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> No Email Required
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> No Password
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> 1-Click JSON Backup
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> 100% Free Access
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col items-center justify-center gap-3">
              <Link
                href="/practice"
                className="w-full text-center px-6 py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base shadow-lg shadow-brand-500/30 transition-all"
              >
                Start Studying Now →
              </Link>
              <Link
                href="/analytics"
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                View Your Browser Storage Status
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
