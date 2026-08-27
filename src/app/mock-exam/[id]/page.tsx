'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { INITIAL_MOCK_EXAMS, INITIAL_QUESTIONS } from '@/data/mock-data';
import { MockExam, Question, MockExamAttempt } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

export default function MockExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const exam: MockExam | undefined = INITIAL_MOCK_EXAMS.find((e) => e.id === examId);

  // Questions for this exam
  const examQuestions: Question[] = exam
    ? INITIAL_QUESTIONS.filter((q) => exam.questionIds.includes(q.id))
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>((exam?.durationMinutes || 15) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<MockExamAttempt | null>(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeftSeconds]);

  if (!exam) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400">The requested mock exam is unavailable.</p>
        <Link
          href="/mock-exam"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold"
        >
          Return to Mock Exams
        </Link>
      </div>
    );
  }

  const currentQuestion = examQuestions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    let correctCount = 0;
    const answerBreakdown = examQuestions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount += 1;
      return {
        questionId: q.id,
        selectedAnswer: selected !== undefined ? selected : -1,
        isCorrect,
        timeSpent: Math.round(timeSpentSeconds / examQuestions.length),
      };
    });

    const score = Math.round((correctCount / examQuestions.length) * 100);
    const accuracy = score;

    const attemptData: Omit<MockExamAttempt, 'id'> = {
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      startedAt: startTimeRef.current,
      completedAt: Date.now(),
      timeSpentSeconds,
      totalQuestions: examQuestions.length,
      score,
      accuracy,
      answers: answerBreakdown,
    };

    // Save to browser IndexedDB
    const savedAttempt = await progressRepo.saveMockAttempt(attemptData);
    setAttemptResult(savedAttempt);
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Results Screen
  if (isSubmitted && attemptResult && !showReviewMode) {
    const isPassed = attemptResult.score >= exam.passingScore;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
        {/* Banner */}
        <div
          className={`p-8 rounded-3xl text-center space-y-4 border ${
            isPassed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white ${
              isPassed ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {isPassed ? 'Exam Passed! Congratulations 🎉' : 'Assessment Completed — Keep Practicing! 🎯'}
          </h1>
          <p className="text-sm max-w-md mx-auto text-slate-600 dark:text-slate-300">
            {isPassed
              ? `You exceeded the passing threshold of ${exam.passingScore}%. Your result is saved to your browser.`
              : `You scored ${attemptResult.score}%. Minimum required to pass was ${exam.passingScore}%.`}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">Final Score</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{attemptResult.score}%</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">Correct Answers</div>
              <div className="text-2xl font-black text-emerald-600">
                {attemptResult.answers.filter((a) => a.isCorrect).length} / {examQuestions.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">Time Taken</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {Math.floor(attemptResult.timeSpentSeconds / 60)}m {attemptResult.timeSpentSeconds % 60}s
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">Local Record</div>
              <div className="text-xs font-bold text-brand-600 pt-1">Saved IndexedDB</div>
            </div>
          </div>
        </div>

        {/* Post Exam Options */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setShowReviewMode(true)}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
          >
            <span>Review All Answers & Explanations</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/mock-exam"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm"
          >
            Return to Exam Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Session Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            {exam.subject}
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{exam.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {!isSubmitted && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-base font-bold border ${
                timeLeftSeconds < 180
                  ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setShowReviewMode(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Back to Scorecard
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Interface */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Question {currentIndex + 1} of {examQuestions.length}
            </span>

            {!isSubmitted && (
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[currentIndex] ? 'Flagged for Review' : 'Mark for Review'}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion?.question}
            </h3>

            {currentQuestion?.codeSnippet && (
              <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                {currentQuestion.codeSnippet}
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion?.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;

              let style =
                'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-500 text-slate-800 dark:text-slate-200';

              if (!isSubmitted && isSelected) {
                style =
                  'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100 ring-1 ring-brand-500 font-semibold';
              }

              if (isSubmitted) {
                if (isCorrect) {
                  style =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-bold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  style =
                    'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500';
                } else {
                  style = 'opacity-50 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-4 ${style}`}
                >
                  <span className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-grow pt-0.5 leading-snug">{opt}</span>
                  {isSubmitted && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation in Review Mode */}
          {isSubmitted && currentQuestion && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-fadeIn">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Detailed Explanation:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Bottom Prev/Next */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentIndex((p) => Math.min(examQuestions.length - 1, p + 1))}
              disabled={currentIndex === examQuestions.length - 1}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white disabled:opacity-30 hover:bg-brand-700 text-xs font-semibold flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Palette / Navigator */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Question Navigator</h4>
            <p className="text-xs text-slate-500 mt-0.5">Jump directly to any item</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {examQuestions.map((_, idx) => {
              const isCurrent = currentIndex === idx;
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isFlagged = flaggedQuestions[idx];

              let paletteStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
              if (isAnswered) {
                paletteStyle = 'bg-brand-600 text-white font-bold';
              }
              if (isFlagged) {
                paletteStyle = 'bg-amber-500 text-white font-bold ring-2 ring-amber-300';
              }
              if (isCurrent) {
                paletteStyle += ' ring-2 ring-brand-500 ring-offset-2';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${paletteStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-brand-600" />
              <span>Answered ({Object.keys(selectedAnswers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
              <span>Unanswered ({examQuestions.length - Object.keys(selectedAnswers).length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
