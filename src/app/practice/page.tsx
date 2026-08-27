'use client';

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
  Layers,
} from 'lucide-react';
import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { Question, SubjectCategory, Difficulty } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

const SUBJECTS: (SubjectCategory | 'All')[] = [
  'All',
  'Mathematics',
  'Science',
  'Reasoning',
  'Verbal',
  'Computer Science',
];

const DIFFICULTIES: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [searchTopic, setSearchTopic] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // AI Tutor Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  // Filtered questions
  const filteredQuestions: Question[] = INITIAL_QUESTIONS.filter((q) => {
    if (selectedSubject !== 'All' && q.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchTopic && !q.topic.toLowerCase().includes(searchTopic.toLowerCase())) return false;
    return true;
  });

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (isAnswered) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswered, currentIndex]);

  // Check bookmark status when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimerSeconds(0);

    if (currentQuestion) {
      progressRepo.isBookmarked(currentQuestion.id).then(setIsBookmarked);
    }
  }, [currentIndex, selectedSubject, selectedDifficulty, currentQuestion?.id]);

  const handleSelectAnswer = async (idx: number) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctAnswer;

    // Save to browser IndexedDB
    await progressRepo.saveAttempt({
      questionId: currentQuestion.id,
      subject: currentQuestion.subject,
      topic: currentQuestion.topic,
      selectedAnswer: idx,
      isCorrect,
      timeSpentSeconds: timerSeconds,
    });
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    const nextState = await progressRepo.toggleBookmark(currentQuestion.id);
    setIsBookmarked(nextState);
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
        setAiExplanation(data.message || 'AI request limit reached. Please try again later.');
      }
    } catch {
      setAiExplanation('Network error contacting AI tutor.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetFilters = () => {
    setSelectedSubject('All');
    setSelectedDifficulty('All');
    setSearchTopic('');
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>Practice Questions</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Solve questions with instant scoring, hints, and local-first progress tracking.
          </p>
        </div>

        {/* Question Counter / Navigation Pill */}
        {filteredQuestions.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next Question"
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By Subject & Difficulty</span>
          </div>
          {(selectedSubject !== 'All' || selectedDifficulty !== 'All' || searchTopic) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === sub
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Difficulty & Search */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-medium text-slate-500">Difficulty:</span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}

          <input
            type="text"
            placeholder="Search topic / keyword..."
            value={searchTopic}
            onChange={(e) => {
              setSearchTopic(e.target.value);
              setCurrentIndex(0);
            }}
            className="ml-auto px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Main Question Card Area */}
      {currentQuestion ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
          {/* Question Header Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {currentQuestion.subject}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • {currentQuestion.topic}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : currentQuestion.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{timerSeconds}s</span>
              </div>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${
                  isBookmarked
                    ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
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

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </h2>

            {currentQuestion.codeSnippet && (
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                {currentQuestion.codeSnippet}
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;

              let optionStyle =
                'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-brand-500 hover:bg-brand-50/20 text-slate-800 dark:text-slate-200';

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle =
                    'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100 font-semibold shadow-sm ring-1 ring-emerald-500';
                } else if (isSelected) {
                  optionStyle =
                    'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/60 dark:text-rose-100 ring-1 ring-rose-500';
                } else {
                  optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${optionStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base flex-grow pt-0.5 leading-snug">{option}</span>
                  {isAnswered && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint Section */}
          {currentQuestion.hint && !isAnswered && (
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  💡 <strong>Hint:</strong> {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* Post-Answer Explanation & AI Tutor Trigger */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div
                className={`p-4 rounded-xl border ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="font-bold text-sm flex items-center gap-1.5">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Correct Answer!
                      </span>
                    ) : (
                      <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <X className="w-4 h-4" /> Incorrect (Correct: Option{' '}
                        {String.fromCharCode(65 + currentQuestion.correctAnswer)})
                      </span>
                    )}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Saved to local IndexedDB
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleAskAI}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Breakdown / Ask AI Tutor</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === filteredQuestions.length - 1}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <p className="text-slate-600 dark:text-slate-400">No questions found matching your filter criteria.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* AI Explanation Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-500 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Tutor In-Depth Analysis</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Generating step-by-step mathematical reasoning...</p>
                </div>
              ) : (
                aiExplanation
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Zero login • Free anonymous AI tutor usage</span>
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
