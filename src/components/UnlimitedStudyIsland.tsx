import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import {
  Sparkles,
  Flame,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Layers,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart2,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { INITIAL_QUESTIONS } from '@/data/mock-data';
import {
  StudyEngine,
  UnlimitedStudyConfig,
  UnlimitedStudySession,
} from '@/lib/study/study-engine';
import { Question, DifficultyLevel } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';
import { AnalyticsService } from '@/lib/services/analytics';

import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';

// ==========================================
// ERROR BOUNDARY
// ==========================================
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class UnlimitedStudyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown render error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Study Mode runtime caught:', error, errorInfo);
  }

  handleRetry = () => {
    StudyEngine.clearStoredSession();
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Something went wrong loading Study Mode.
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We encountered a display issue. Click below to reset your study session and reload.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-rose-500 bg-rose-50 dark:bg-rose-950/80 p-2 rounded-xl border border-rose-200 dark:border-rose-900 max-w-md mx-auto">
                {this.state.errorMessage}
              </p>
            )}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset & Retry Study</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// MAIN ISLAND
// ==========================================
const DEFAULT_CONFIG: UnlimitedStudyConfig = {
  certification: 'RBT',
  certificationVersion: 'All',
  domain: 'All',
  topic: 'All',
  difficulty: 'All',
  order: 'random',
  excludePreviouslyAnswered: false,
  prioritizeWeakTopics: false,
  allowRepeats: false,
};

function UnlimitedStudyContent() {
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => {
    try {
      const local = QuestionLifecycleRepository.getActiveQuestions();
      return local.length > 0 ? local : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });
  const allQuestionsRef = useRef<Question[]>(INITIAL_QUESTIONS);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Synchronous State Initialization
  const [session, setSession] = useState<UnlimitedStudySession | null>(null);
  const [config, setConfig] = useState<UnlimitedStudyConfig>(DEFAULT_CONFIG);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [isExhausted, setIsExhausted] = useState(false);
  const [totalInPool, setTotalInPool] = useState(0);

  // Active Question Answering State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    isCorrect: boolean;
    correctAnswerIndex: number;
    explanation: string;
    clinicalExplanation?: string;
  } | null>(null);

  // Pause State
  const [isPaused, setIsPaused] = useState(false);
  const [flashcardToast, setFlashcardToast] = useState<string | null>(null);

  // 1. Initialize client-side state safely after mount
  useEffect(() => {
    setMounted(true);

    const localActive = QuestionLifecycleRepository.getActiveQuestions();
    
    fetch('/api/v1/questions?status=active&limit=20000')
      .then((r) => r.json())
      .then((d) => {
        const serverItems: Question[] = (d && d.success && Array.isArray(d.data?.items)) ? d.data.items : [];
        const questionMap = new Map<string, Question>();
        
        INITIAL_QUESTIONS.forEach((q) => questionMap.set(q.id, q));
        serverItems.forEach((q) => questionMap.set(q.id, q));
        localActive.forEach((q) => questionMap.set(q.id, q));

        const liveItems = Array.from(questionMap.values()).filter(
          (q) => q.status !== 'deleted' && q.status !== 'archived' && !QuestionLifecycleRepository.isDeleted(q.id)
        );

        setAllQuestions(liveItems);
        allQuestionsRef.current = liveItems;

        // Safely rehydrate saved session with live dataset
        const saved = StudyEngine.loadSessionFromStorage();
        if (saved && saved.questionsAttempted > 0) {
          setSession(saved);
          setConfig(saved.config || DEFAULT_CONFIG);

          if (saved.currentQuestionId) {
            const found = liveItems.find((q) => q?.id === saved.currentQuestionId || q?.code === saved.currentQuestionId);
            if (found) {
              setCurrentQuestion(found);
            } else {
              const nextRes = StudyEngine.getNextQuestion(saved, liveItems, []);
              if (nextRes.question) {
                setCurrentQuestion(nextRes.question);
                saved.currentQuestionId = nextRes.question.id;
                setSession({ ...saved });
                StudyEngine.saveSessionToStorage(saved);
              }
            }
          }
        }
      })
      .catch(() => {
        const liveItems = localActive.length > 0 ? localActive : INITIAL_QUESTIONS;
        setAllQuestions(liveItems);
        allQuestionsRef.current = liveItems;
      });

    try {
      progressRepo.getAllAttempts().then((attempts) => {
        if (Array.isArray(attempts) && attempts.length > 0) {
          const summary = AnalyticsService.analyzeStudentPerformance(attempts);
          if (summary?.weakTopics && Array.isArray(summary.weakTopics) && summary.weakTopics.length > 0) {
            setWeakTopics(summary.weakTopics.map((t) => t.topic));
          }
        }
      }).catch(() => {});
    } catch {}
  }, []);

  // Advance to next question helper
  const advanceNextQuestion = (activeSess: UnlimitedStudySession) => {
    setSelectedOption(null);
    setIsAnswered(false);
    setAnswerFeedback(null);

    const questionsPool = allQuestionsRef.current.length > 0 ? allQuestionsRef.current : allQuestions;
    const result = StudyEngine.getNextQuestion(activeSess, questionsPool, weakTopics);
    setTotalInPool(result.totalInPool || 0);

    if (result.isExhausted || !result.question) {
      const fallbackResult = StudyEngine.getNextQuestion(activeSess, questionsPool, []);
      if (fallbackResult.question) {
        setIsExhausted(false);
        setCurrentQuestion(fallbackResult.question);
        activeSess.currentQuestionId = fallbackResult.question.id;
      } else {
        setIsExhausted(true);
        setCurrentQuestion(null);
      }
    } else {
      setIsExhausted(false);
      setCurrentQuestion(result.question);
      activeSess.currentQuestionId = result.question.id;
    }

    setSession({ ...activeSess });
    StudyEngine.saveSessionToStorage(activeSess);
  };

  // Start a fresh unlimited study session
  const handleStartStudy = () => {
    const newSess = StudyEngine.createSession(config);
    const questionsPool = allQuestionsRef.current.length > 0 ? allQuestionsRef.current : allQuestions;
    const result = StudyEngine.getNextQuestion(newSess, questionsPool, weakTopics);

    let initialQ: Question | null = result.question;
    if (!initialQ) {
      const fallback = StudyEngine.getNextQuestion(newSess, questionsPool, []);
      initialQ = fallback.question || questionsPool[0] || INITIAL_QUESTIONS[0];
    }

    newSess.currentQuestionId = initialQ ? initialQ.id : null;

    setSession(newSess);
    setCurrentQuestion(initialQ);
    setIsExhausted(false);
    setIsPaused(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setAnswerFeedback(null);
    setTotalInPool(result.totalInPool || questionsPool.length);

    StudyEngine.saveSessionToStorage(newSess);
  };

  // Handle Option Click
  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion || !session) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const feedback = StudyEngine.recordAnswer(session, currentQuestion, index);
    setAnswerFeedback(feedback);
    setSession({ ...session });
    StudyEngine.saveSessionToStorage(session);

    try {
      progressRepo.saveAttempt({
        questionId: currentQuestion.id,
        isCorrect: index === currentQuestion.correctAnswer,
        userAnswer: index,
        timeSpent: 5,
        subject: (currentQuestion.domainName as any) || 'A_Measurement',
      }).catch(() => {});
    } catch {}
  };

  // Allow Repeats / Start New Cycle
  const handleAllowRepeats = () => {
    if (!session) return;
    const updated = StudyEngine.restartCycle(session);
    setSession(updated);
    setIsExhausted(false);
    advanceNextQuestion(updated);
  };

  // Exit / End Study
  const handleExitStudy = () => {
    StudyEngine.clearStoredSession();
    setSession(null);
    setCurrentQuestion(null);
    setIsExhausted(false);
    setIsPaused(false);
  };

  // Review as Flashcard
  const handleReviewAsFlashcard = (q: Question) => {
    if (!q || !Array.isArray(q.options)) return;
    const correctText = q.options[q.correctAnswer] || '';
    setFlashcardToast(`💡 Flashcard Concept: "${correctText}" — ${q.explanation || ''}`);
    setTimeout(() => setFlashcardToast(null), 5000);
  };

  // Accuracy calculation
  const accuracy = session && (session.questionsAttempted || 0) > 0
    ? Math.round(((session.correctCount || 0) / session.questionsAttempted) * 100)
    : 0;

  // Render safe loading skeleton during first frame
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-pulse">
        <div className="text-center space-y-3">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto"></div>
        </div>
        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"></div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: START CONFIGURATION SCREEN
  // ==========================================
  if (!session) {
    const candidatePreviewCount = StudyEngine.filterCandidateQuestions(
      allQuestions.length > 0 ? allQuestions : INITIAL_QUESTIONS,
      config || DEFAULT_CONFIG,
      weakTopics
    ).length;

    const currentCert = config?.certification || 'RBT';
    const currentVersion = config?.certificationVersion || '6th Edition';
    const currentDomain = config?.domain || 'All';
    const currentDifficulty = config?.difficulty || 'All';
    const currentOrder = config?.order || 'random';
    const currentAllowRepeats = Boolean(config?.allowRepeats);
    const currentPrioritizeWeak = Boolean(config?.prioritizeWeakTopics);
    const currentExcludeAnswered = Boolean(config?.excludePreviouslyAnswered);

    // Dynamic Domains for Selected Track
    const isBACBTrack = currentCert === 'BACB';
    const isRBTTrack = currentCert === 'RBT';

    const trackDomains = Array.from(
      new Set([
        ...(isBACBTrack
          ? [
              'Domain A: Philosophical Underpinnings / Measurement',
              'Domain B: Assessment & Preference Testing',
              'Domain C: Skill Acquisition',
              'Domain D: Behavior Reduction',
              'Domain E: Selecting & Implementing Interventions',
              'Domain F: Supervision, Management & Ethics',
            ]
          : [
              'Domain A: Measurement',
              'Domain B: Assessment',
              'Domain C: Skill Acquisition',
              'Domain D: Behavior Reduction',
              'Domain E: Documentation & Reporting',
              'Domain F: Professional Conduct & Scope of Practice',
            ]),
        ...allQuestions
          .filter((q) => {
            const qCert = (q.certification || 'RBT').toUpperCase();
            if (isBACBTrack) return qCert.includes('BACB') || qCert.includes('BCBA');
            if (isRBTTrack) return !qCert.includes('BACB') && !qCert.includes('BCBA');
            return true;
          })
          .map((q) => q.domainName?.trim())
          .filter((d): d is string => Boolean(d && d.length > 0)),
      ])
    );

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-black uppercase tracking-wider">
            <Zap className="w-4 h-4 text-brand-600" />
            <span>100% Free & Open — No Limits</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Unlimited Study Mode
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Continuous, personalized question drills with zero caps. Practice until you choose to pause or finish.
          </p>
        </div>

        {/* Configuration Matrix Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Filter className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Configure Your Study Session
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Certification Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Certification Track
              </label>
              <select
                value={currentCert}
                onChange={(e) =>
                  setConfig({
                    ...(config || DEFAULT_CONFIG),
                    certification: e.target.value as any,
                    domain: 'All', // Reset domain filter when track changes
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="RBT">RBT (Registered Behavior Technician)</option>
                <option value="BACB">BACB Practice Track</option>
                <option value="All">All Certifications (Mixed)</option>
              </select>
            </div>

            {/* Certification Version */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Blueprint / Version
              </label>
              <select
                value={currentVersion}
                onChange={(e) => setConfig({ ...(config || DEFAULT_CONFIG), certificationVersion: e.target.value as any })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Versions (Comprehensive)</option>
                <option value="6th Edition">6th Edition (Current Standard)</option>
                <option value="Standard">Standard Scope</option>
              </select>
            </div>

            {/* Domain Focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Domain Focus</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase">
                  {currentCert} Track
                </span>
              </label>
              <select
                value={currentDomain}
                onChange={(e) => setConfig({ ...(config || DEFAULT_CONFIG), domain: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Domains (Comprehensive Study)</option>
                {trackDomains.map((dom, idx) => (
                  <option key={idx} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Difficulty Level
              </label>
              <select
                value={currentDifficulty}
                onChange={(e) => setConfig({ ...(config || DEFAULT_CONFIG), difficulty: e.target.value as any })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Difficulties (Adaptive Mix)</option>
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Standard Exam)</option>
                <option value="Hard">Hard (Complex Scenarios)</option>
              </select>
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Question Delivery Order
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), order: 'random' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    currentOrder === 'random'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🎲 Randomized
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), order: 'sequential' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    currentOrder === 'sequential'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📋 Sequential
                </button>
              </div>
            </div>

            {/* Repeat Strategy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                When Pool Is Completed
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), allowRepeats: true })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    currentAllowRepeats
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🔁 Auto-Restart Cycle
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), allowRepeats: false })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    !currentAllowRepeats
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🛑 Notify on Complete
                </button>
              </div>
            </div>
          </div>

          {/* Adaptive Toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={currentPrioritizeWeak}
                onChange={(e) => setConfig({ ...(config || DEFAULT_CONFIG), prioritizeWeakTopics: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Prioritize Weak Topics (Adaptive AI Learning)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Surfaces questions from topics where your accuracy is below passing threshold.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={currentExcludeAnswered}
                onChange={(e) => setConfig({ ...(config || DEFAULT_CONFIG), excludePreviouslyAnswered: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Exclude Previously Answered Questions
                </div>
                <div className="text-[11px] text-slate-500">
                  Only show questions you have not answered yet across all prior sessions.
                </div>
              </div>
            </label>
          </div>

          {/* Zero Candidate Helper Banner */}
          {candidatePreviewCount === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2.5 animate-fadeIn">
              <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>No questions found matching this exact filter combination</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                You selected: <strong>{currentCert}</strong> + <strong>{currentDomain}</strong> + <strong>{currentDifficulty}</strong>. If your added questions belong to a different domain or difficulty level, broaden your filters to view all available questions.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), domain: 'All', difficulty: 'All', certificationVersion: 'All' })}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Set Domain & Difficulty to "All" (Show All {currentCert} Questions)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...(config || DEFAULT_CONFIG), certification: 'All', domain: 'All', difficulty: 'All', certificationVersion: 'All' })}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] shadow-sm transition-all"
                >
                  Show All Platform Questions ({allQuestions.length})
                </button>
              </div>
            </div>
          )}

          {/* Start CTA with Live Pool Counter */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Available Question Pool:{' '}
              <strong className={`text-sm ${candidatePreviewCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-rose-500 font-bold'}`}>
                {candidatePreviewCount} Active Question{candidatePreviewCount !== 1 ? 's' : ''}
              </strong>
            </div>

            <button
              onClick={handleStartStudy}
              disabled={candidatePreviewCount === 0}
              className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-black shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Unlimited Study</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: POOL EXHAUSTED COMPLETION SCREEN
  // ==========================================
  if (isExhausted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-3xl shadow-sm">
          🏆
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            All Available Questions Completed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You've completed all {totalInPool} active questions matching your study filters in Cycle #{session?.currentCycle ?? 1}.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Attempted</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{session?.questionsAttempted ?? 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Accuracy</div>
            <div className="text-xl font-black text-brand-600 dark:text-brand-400 mt-1">{accuracy}%</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Best Streak</div>
            <div className="text-xl font-black text-amber-500 mt-1">🔥 {session?.bestStreak ?? 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Cycle</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">#{session?.currentCycle ?? 1}</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center flex-wrap gap-3">
          <button
            onClick={handleAllowRepeats}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Study Again (New Randomized Cycle)</span>
          </button>
          <button
            onClick={handleExitStudy}
            className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
          >
            Adjust Filters / Exit
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE UNLIMITED STUDY RUNNER
  // ==========================================
  const optionsList = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Session Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-[11px] font-black uppercase tracking-wider">
            {config?.certification || 'RBT'} • {config?.certificationVersion || '6th Edition'}
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {currentQuestion?.domainName || 'Study Session'}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{session?.currentStreak ?? 0} Streak</span>
          </div>

          {/* Accuracy Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Target className="w-3.5 h-3.5 text-brand-600" />
            <span>{accuracy}% ({session?.correctCount ?? 0}/{session?.questionsAttempted ?? 0})</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsPaused(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Pause Study"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {flashcardToast && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 text-indigo-900 dark:text-indigo-200 text-xs font-bold animate-fadeIn">
          {flashcardToast}
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion && optionsList.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                {currentQuestion.code}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-semibold">{currentQuestion.topicName}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
            {currentQuestion.content}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {optionsList.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = currentQuestion.correctAnswer === optIdx;

              let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-200 font-bold';
                } else {
                  btnClass = 'border-slate-100 dark:border-slate-800 opacity-60 text-slate-500';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswered}
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

          {/* Explanation & Action Footer */}
          {isAnswered && answerFeedback && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fadeIn">
              <div
                className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2.5 ${
                  answerFeedback.isCorrect
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="font-extrabold flex items-center gap-1.5 text-sm">
                  {answerFeedback.isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Incorrect — Correct is Option {String.fromCharCode(65 + (answerFeedback.correctAnswerIndex ?? 0))}</span>
                    </>
                  )}
                </div>

                <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                  {answerFeedback.explanation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleReviewAsFlashcard(currentQuestion)}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Review as Flashcard</span>
                </button>

                <button
                  onClick={() => advanceNextQuestion(session)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-500/20 flex items-center gap-1.5 hover:scale-[1.02] transition-all ml-auto"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-sm animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 flex items-center justify-center mx-auto text-xl">
            📖
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Ready for your next question</h3>
          <button
            onClick={() => advanceNextQuestion(session)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
          >
            Start First Question
          </button>
        </div>
      )}

      {/* PAUSE MODAL OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scaleIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl">
                ⏸️
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Study Session Paused
              </h3>
              <p className="text-xs text-slate-500">
                Your progress is safely saved. You can resume anytime.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">Solved</div>
                <div className="text-base font-black text-slate-900 dark:text-white">{session?.questionsAttempted ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">Accuracy</div>
                <div className="text-base font-black text-brand-600 dark:text-brand-400">{accuracy}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">Streak</div>
                <div className="text-base font-black text-amber-500">🔥 {session?.currentStreak ?? 0}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Resume Study</span>
              </button>
              <button
                onClick={handleExitStudy}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-xs font-bold"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnlimitedStudyIsland() {
  return (
    <UnlimitedStudyErrorBoundary>
      <UnlimitedStudyContent />
    </UnlimitedStudyErrorBoundary>
  );
}
