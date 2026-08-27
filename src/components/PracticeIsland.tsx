import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Filter,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Bot,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { INITIAL_QUESTIONS, INITIAL_DOMAINS } from '@/data/mock-data';
import { Question, DifficultyLevel } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';
import { getActiveQuestionBank } from '@/lib/storage/question-bank-sync';

export default function PracticeIsland() {
  const [activeBank, setActiveBank] = useState<Question[]>(() => getActiveQuestionBank());
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

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

  const filteredQuestions: Question[] = activeBank.filter((q) => {
    if (selectedDomain !== 'All' && !q.domainName.includes(selectedDomain)) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !q.content.toLowerCase().includes(searchQuery.toLowerCase()) && !q.topicName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  useEffect(() => {
    if (isAnswered) return;
    const interval = setInterval(() => setTimerSeconds((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isAnswered, currentIndex]);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimerSeconds(0);

    if (currentQuestion) {
      progressRepo.isBookmarked(currentQuestion.id).then(setIsBookmarked);
    }
  }, [currentIndex, selectedDomain, selectedDifficulty, currentQuestion?.id]);

  const handleSelectAnswer = async (idx: number) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctAnswer;
    await progressRepo.saveAttempt({
      questionId: currentQuestion.id,
      domain: currentQuestion.domainName,
      topic: currentQuestion.topicName,
      selectedAnswer: idx,
      isCorrect,
      timeSpentSeconds: timerSeconds,
    });
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    const next = await progressRepo.toggleBookmark(currentQuestion.id);
    setIsBookmarked(next);
  };

  const handleAskAI = async () => {
    if (!currentQuestion) return;
    setAiModalOpen(true);
    setAiLoading(true);
    setAiExplanation('');

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_question',
          questionContext: currentQuestion,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiExplanation(data.reply);
      } else {
        setAiExplanation(data.message || 'AI request limit reached.');
      }
    } catch {
      setAiExplanation('Error connecting to AI Tutor.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>RBT Practice Questions</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Solve authentic BACB Task List questions with instant explanations and browser persistence.
          </p>
        </div>

        {filteredQuestions.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((p) => Math.min(filteredQuestions.length - 1, p + 1))}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>BACB Task List Domain Filter</span>
          </div>
          {(selectedDomain !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDomain('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
                setCurrentIndex(0);
              }}
              className="text-xs text-brand-600 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'A', 'B', 'C', 'D', 'E', 'F'].map((code) => {
            const label = code === 'All' ? 'All Domains' : `Domain ${code}`;
            return (
              <button
                key={code}
                onClick={() => {
                  setSelectedDomain(code === 'All' ? 'All' : code);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDomain === (code === 'All' ? 'All' : code)
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {currentQuestion.domainName}
              </span>
              <span className="text-xs font-medium text-slate-500">• {currentQuestion.topicName}</span>
              <span className="text-xs font-mono text-slate-400">[{currentQuestion.code}]</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{timerSeconds}s</span>
              </div>
              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isBookmarked
                    ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.content}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              let style =
                'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-brand-500 text-slate-800 dark:text-slate-200';

              if (isAnswered) {
                if (isCorrect) {
                  style =
                    'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  style =
                    'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/60 dark:text-rose-100 ring-1 ring-rose-500';
                } else {
                  style = 'opacity-50 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-4 ${style}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-grow pt-0.5 leading-snug">{opt}</span>
                  {isAnswered && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {currentQuestion.hint && !isAnswered && (
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-600 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  💡 {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* Post-Answer Card */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div
                className={`p-4 rounded-xl border ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Correct Answer
                    </span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <X className="w-4 h-4" /> Incorrect (Correct: Option{' '}
                      {String.fromCharCode(65 + currentQuestion.correctAnswer)})
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong>Rationale:</strong> {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleAskAI}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Breakdown / Tutor Rationale</span>
                </button>

                <button
                  onClick={() => setCurrentIndex((p) => Math.min(filteredQuestions.length - 1, p + 1))}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 disabled:opacity-40"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600">No questions found matching criteria.</p>
        </div>
      )}

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>RBT AI Clinical Breakdown</span>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aiLoading ? 'Analyzing applied behavioral scenario...' : aiExplanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
