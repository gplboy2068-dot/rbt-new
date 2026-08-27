import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { INITIAL_MOCK_EXAMS } from '@/data/mock-data';
import { MockExam, Question, MockExamAttempt } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';
import { getActiveQuestionBank } from '@/lib/storage/question-bank-sync';

interface Props {
  examId: string;
}

export default function MockExamRunnerIsland({ examId }: Props) {
  const [activeBank, setActiveBank] = useState<Question[]>(() => getActiveQuestionBank());

  useEffect(() => {
    fetch('/api/v1/questions?status=active&limit=20000')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data?.items)) {
          setActiveBank(d.data.items);
        } else {
          setActiveBank(getActiveQuestionBank());
        }
      })
      .catch(() => setActiveBank(getActiveQuestionBank()));
  }, []);

  const exam: MockExam | undefined = INITIAL_MOCK_EXAMS.find((e) => e.id === examId) || {
    id: examId,
    code: 'PRACTICE-DRILL',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'RBT Practice Test Drill',
    description: 'Targeted RBT 6th Edition practice drill with real-time scoring.',
    domain: 'General',
    durationMinutes: 15,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: [],
  };

  // Dynamically resolve questions for this exam / domain drill
  let examQuestions: Question[] = [];
  if (exam) {
    const domainKeywordsMap: Record<string, string[]> = {
      test_measurement_drill: ['measurement', 'continuous', 'discontinuous', 'graphing', 'data collection'],
      test_assessment_drill: ['assessment', 'preference', 'abc', 'data collection'],
      test_skill_acq_drill: ['skill', 'acquisition', 'dtt', 'prompting', 'shaping', 'chaining'],
      test_behavior_reduc_drill: ['reduction', 'behavior', 'reinforcement', 'dra', 'dri', 'dro', 'extinction'],
      test_ethics_drill: ['ethics', 'conduct', 'professional', 'scope'],
    };

    const keywords = domainKeywordsMap[exam.id];
    if (keywords && keywords.length > 0) {
      const domainMatches = activeBank.filter((q) => {
        const d = (q.domainName || '').toLowerCase();
        const t = (q.topicName || '').toLowerCase();
        return keywords.some((kw) => d.includes(kw) || t.includes(kw));
      });
      if (domainMatches.length > 0) {
        examQuestions = domainMatches.slice(0, exam.totalQuestions || 10);
      }
    }

    if (examQuestions.length === 0 && exam.questionIds && exam.questionIds.length > 0) {
      examQuestions = activeBank.filter((q) => exam.questionIds.includes(q.id));
    }

    if (examQuestions.length === 0 && activeBank.length > 0) {
      examQuestions = activeBank.slice(0, Math.min(exam.totalQuestions || 10, activeBank.length));
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>((exam?.durationMinutes || 90) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<MockExamAttempt | null>(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isSubmitted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((p) => {
        if (p <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeftSeconds]);

  if (!exam) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Not Found</h2>
        <a href="/mock-exams" className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold">
          Return to Mock Exams
        </a>
      </div>
    );
  }

  if (examQuestions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
          📚
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Questions in Exam Pool</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          All questions for this examination have been deleted or cleared from the active Question Bank.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href="/admin/questions"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Manage Question Bank
          </a>
          <a
            href="/mock-exams"
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Back to Mock Exams
          </a>
        </div>
      </div>
    );
  }

  const currentQuestion = examQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((p) => ({ ...p, [currentIndex]: idx }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((p) => ({ ...p, [currentIndex]: !p[currentIndex] }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correct = 0;
    const breakdown = examQuestions.map((q, idx) => {
      const isCor = selectedAnswers[idx] === q.correctAnswer;
      if (isCor) correct++;
      return {
        questionId: q.id,
        selectedAnswer: selectedAnswers[idx] ?? -1,
        isCorrect: isCor,
        timeSpent: Math.round(timeSpent / examQuestions.length),
      };
    });

    const score = Math.round((correct / examQuestions.length) * 100);
    const saved = await progressRepo.saveMockAttempt({
      examId: exam.id,
      examTitle: exam.title,
      startedAt: startTimeRef.current,
      completedAt: Date.now(),
      timeSpentSeconds: timeSpent,
      totalQuestions: examQuestions.length,
      score,
      accuracy: score,
      answers: breakdown,
    });

    setAttemptResult(saved);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <span>{exam.domain}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {exam.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmitExam}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setShowReviewMode(!showReviewMode)}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
            >
              {showReviewMode ? 'Hide Review' : 'Review Answers'}
            </button>
          )}
        </div>
      </div>

      {/* Main Examination Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-400">
                Question {currentIndex + 1} of {examQuestions.length}
              </span>
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[currentIndex] ? 'Flagged' : 'Mark for Review'}</span>
              </button>
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
              {currentQuestion?.content}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion?.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const isCorrect = currentQuestion.correctAnswer === optIdx;
                const showCorrectness = isSubmitted && showReviewMode;

                let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200';
                if (isSelected && !showCorrectness) {
                  btnClass = 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 font-bold';
                }
                if (showCorrectness) {
                  if (isCorrect) {
                    btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 font-bold';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-xs sm:text-sm ${btnClass}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-slate-600 dark:text-slate-300">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation in Review Mode */}
            {isSubmitted && showReviewMode && currentQuestion?.explanation && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 mt-4">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Rational & Explanation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex((p) => Math.min(examQuestions.length - 1, p + 1))}
                disabled={currentIndex === examQuestions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Question Grid Navigator (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs">Question Navigator</span>
              <span className="text-[11px] text-slate-400">{answeredCount} of {examQuestions.length} Answered</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[350px] overflow-y-auto p-1">
              {examQuestions.map((_, idx) => {
                const isCurrent = currentIndex === idx;
                const isAns = selectedAnswers[idx] !== undefined;
                const isFlg = flaggedQuestions[idx];

                let navBg = 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent';
                if (isAns) navBg = 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold border-brand-200';
                if (isFlg) navBg = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border-amber-300';
                if (isCurrent) navBg += ' ring-2 ring-brand-500 dark:ring-brand-400 font-black';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${navBg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
