/**
 * Unlimited Study Engine (Phase 9)
 * Provides continuous, unconstrained question-based learning with anonymous state persistence,
 * strict track isolation, adaptive weak topic prioritization, and pool cycle management.
 */

import { Question, DifficultyLevel } from '@/types';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';

export interface UnlimitedStudyConfig {
  certification: 'RBT' | 'BACB' | 'All';
  certificationVersion: '6th Edition' | 'Standard' | 'All';
  domain: string;
  topic: string;
  difficulty: DifficultyLevel | 'All';
  order: 'random' | 'sequential';
  excludePreviouslyAnswered: boolean;
  prioritizeWeakTopics: boolean;
  allowRepeats: boolean;
}

export interface UnlimitedStudySession {
  id: string;
  config: UnlimitedStudyConfig;
  startedAt: number;
  lastActiveAt: number;
  isPaused: boolean;
  currentCycle: number;
  answeredQuestionIds: string[];
  cycleAnsweredQuestionIds: string[];
  currentQuestionId: string | null;
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  currentStreak: number;
  bestStreak: number;
  domainStats: Record<string, { attempted: number; correct: number }>;
  topicStats: Record<string, { attempted: number; correct: number }>;
  difficultyStats: Record<string, { attempted: number; correct: number }>;
}

export class StudyEngine {
  /**
   * Filter available questions according to strict certification and domain criteria.
   * NEVER returns deleted, archived, or mismatched certification questions.
   */
  static filterCandidateQuestions(
    allQuestions: Question[],
    config: UnlimitedStudyConfig,
    weakTopics: string[] = []
  ): Question[] {
    if (!Array.isArray(allQuestions)) return [];

    let pool = allQuestions.filter((q) => {
      if (!q || typeof q !== 'object') return false;

      // 1. Lifecycle check: active only
      const isDel = q.status === 'deleted' || QuestionLifecycleRepository.isDeleted(q.id) || QuestionLifecycleRepository.isDeleted(q.code);
      const isArch = q.status === 'archived';
      if (isDel || isArch) return false;

      // 2. Strict Track Separation (RBT vs BACB)
      if (config.certification !== 'All') {
        const qCert = (q.certification || 'RBT').toUpperCase();
        if (qCert !== config.certification.toUpperCase()) return false;
      }

      // 3. Certification Version
      if (config.certificationVersion !== 'All') {
        const qVer = q.certificationVersion || '6th Edition';
        if (qVer !== config.certificationVersion) return false;
      }

      // 4. Domain filter
      if (config.domain && config.domain !== 'All') {
        const domLower = config.domain.toLowerCase();
        const qDom = (q.domainName || '').toLowerCase();
        const qTopic = (q.topicName || '').toLowerCase();

        let matches = qDom.includes(domLower) || qTopic.includes(domLower);
        if (!matches) {
          if (domLower.includes('measurement') && (qDom.includes('data collection') || qDom.includes('graphing') || qDom.includes('a —') || qDom.includes('a -') || qDom.includes('a:'))) {
            matches = true;
          } else if (domLower.includes('assessment') && (qDom.includes('preference') || qDom.includes('b —') || qDom.includes('b -') || qDom.includes('b:'))) {
            matches = true;
          } else if (domLower.includes('skill') && (qDom.includes('acquisition') || qDom.includes('c —') || qDom.includes('c -') || qDom.includes('c:'))) {
            matches = true;
          } else if (domLower.includes('behavior') && (qDom.includes('reduction') || qDom.includes('d —') || qDom.includes('d -') || qDom.includes('d:'))) {
            matches = true;
          } else if ((domLower.includes('ethics') || domLower.includes('conduct') || domLower.includes('professional')) && (qDom.includes('professional') || qDom.includes('ethics') || qDom.includes('f —') || qDom.includes('f -') || qDom.includes('f:'))) {
            matches = true;
          }
        }
        if (!matches) return false;
      }

      // 5. Topic filter
      if (config.topic && config.topic !== 'All') {
        const topLower = config.topic.toLowerCase();
        const qTop = (q.topicName || '').toLowerCase();
        if (!qTop.includes(topLower)) return false;
      }

      // 6. Difficulty filter
      if (config.difficulty && config.difficulty !== 'All') {
        const qDiff = (q.difficulty || 'Medium').toLowerCase();
        if (qDiff !== config.difficulty.toLowerCase()) return false;
      }

      return true;
    });

    // If prioritizing weak topics, sort weak topics first
    if (config.prioritizeWeakTopics && weakTopics.length > 0) {
      const weakSet = new Set(weakTopics.map((t) => t.toLowerCase()));
      pool.sort((a, b) => {
        const aIsWeak = weakSet.has((a.topicName || '').toLowerCase()) ? 1 : 0;
        const bIsWeak = weakSet.has((b.topicName || '').toLowerCase()) ? 1 : 0;
        return bIsWeak - aIsWeak;
      });
    }

    return pool;
  }

  /**
   * Select next question in the study session.
   * Handles cycle tracking and pool exhaustion.
   */
  static getNextQuestion(
    session: UnlimitedStudySession,
    allQuestions: Question[],
    weakTopics: string[] = []
  ): {
    question: Question | null;
    isExhausted: boolean;
    totalInPool: number;
    remainingInCycle: number;
  } {
    const candidatePool = this.filterCandidateQuestions(allQuestions, session.config, weakTopics);
    const totalInPool = candidatePool.length;

    if (totalInPool === 0) {
      return { question: null, isExhausted: true, totalInPool: 0, remainingInCycle: 0 };
    }

    // Determine questions already answered in this cycle
    const cycleAnsweredSet = new Set(session.cycleAnsweredQuestionIds);
    const globallyAnsweredSet = new Set(session.answeredQuestionIds);

    // If excluding previously answered across all sessions
    const excludedSet = session.config.excludePreviouslyAnswered ? globallyAnsweredSet : cycleAnsweredSet;

    let availableInCycle = candidatePool.filter((q) => !excludedSet.has(q.id) && !excludedSet.has(q.code));

    if (availableInCycle.length === 0) {
      // Pool is exhausted for this cycle
      if (session.config.allowRepeats) {
        // Automatically start new cycle
        session.currentCycle++;
        session.cycleAnsweredQuestionIds = [];
        availableInCycle = candidatePool;
      } else {
        return {
          question: null,
          isExhausted: true,
          totalInPool,
          remainingInCycle: 0,
        };
      }
    }

    let nextQ: Question;
    if (session.config.order === 'random') {
      const randIdx = Math.floor(Math.random() * availableInCycle.length);
      nextQ = availableInCycle[randIdx];
    } else {
      nextQ = availableInCycle[0];
    }

    session.currentQuestionId = nextQ.id;
    session.lastActiveAt = Date.now();

    return {
      question: nextQ,
      isExhausted: false,
      totalInPool,
      remainingInCycle: availableInCycle.length - 1,
    };
  }

  /**
   * Record answer to the current question and update all session metrics without fabricating data.
   */
  static recordAnswer(
    session: UnlimitedStudySession,
    question: Question,
    selectedOptionIndex: number
  ): {
    isCorrect: boolean;
    correctAnswerIndex: number;
    explanation: string;
    clinicalExplanation?: string;
  } {
    const isCorrect = selectedOptionIndex === question.correctAnswer;

    session.questionsAttempted++;
    if (isCorrect) {
      session.correctCount++;
      session.currentStreak++;
      if (session.currentStreak > session.bestStreak) {
        session.bestStreak = session.currentStreak;
      }
    } else {
      session.incorrectCount++;
      session.currentStreak = 0;
    }

    // Track ID in global and cycle sets
    if (!session.answeredQuestionIds.includes(question.id)) {
      session.answeredQuestionIds.push(question.id);
    }
    if (!session.cycleAnsweredQuestionIds.includes(question.id)) {
      session.cycleAnsweredQuestionIds.push(question.id);
    }

    // Domain breakdown
    const domKey = question.domainName || 'General';
    if (!session.domainStats[domKey]) {
      session.domainStats[domKey] = { attempted: 0, correct: 0 };
    }
    session.domainStats[domKey].attempted++;
    if (isCorrect) session.domainStats[domKey].correct++;

    // Topic breakdown
    const topKey = question.topicName || 'General';
    if (!session.topicStats[topKey]) {
      session.topicStats[topKey] = { attempted: 0, correct: 0 };
    }
    session.topicStats[topKey].attempted++;
    if (isCorrect) session.topicStats[topKey].correct++;

    // Difficulty breakdown
    const diffKey = question.difficulty || 'Medium';
    if (!session.difficultyStats[diffKey]) {
      session.difficultyStats[diffKey] = { attempted: 0, correct: 0 };
    }
    session.difficultyStats[diffKey].attempted++;
    if (isCorrect) session.difficultyStats[diffKey].correct++;

    session.lastActiveAt = Date.now();

    return {
      isCorrect,
      correctAnswerIndex: question.correctAnswer,
      explanation: question.explanation,
      clinicalExplanation: question.clinicalRationale,
    };
  }

  /**
   * Reset cycle answered list so the user can study matching pool again.
   */
  static restartCycle(session: UnlimitedStudySession): UnlimitedStudySession {
    return {
      ...session,
      currentCycle: session.currentCycle + 1,
      cycleAnsweredQuestionIds: [],
      lastActiveAt: Date.now(),
    };
  }

  /**
   * Create a new blank study session with user configuration.
   */
  static createSession(config: UnlimitedStudyConfig): UnlimitedStudySession {
    return {
      id: `study_sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      config,
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      isPaused: false,
      currentCycle: 1,
      answeredQuestionIds: [],
      cycleAnsweredQuestionIds: [],
      currentQuestionId: null,
      questionsAttempted: 0,
      correctCount: 0,
      incorrectCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      domainStats: {},
      topicStats: {},
      difficultyStats: {},
    };
  }

  /**
   * Anonymous LocalStorage Key
   */
  static STORAGE_KEY = 'rbt_unlimited_study_session_v1';

  static saveSessionToStorage(session: UnlimitedStudySession) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }

  static loadSessionFromStorage(): UnlimitedStudySession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.id) return null;

      // Fully sanitize all fields against null/undefined or corrupted types
      return {
        id: String(parsed.id),
        config: {
          certification: parsed.config?.certification || 'RBT',
          certificationVersion: parsed.config?.certificationVersion || '6th Edition',
          domain: parsed.config?.domain || 'All',
          topic: parsed.config?.topic || 'All',
          difficulty: parsed.config?.difficulty || 'All',
          order: parsed.config?.order === 'sequential' ? 'sequential' : 'random',
          excludePreviouslyAnswered: Boolean(parsed.config?.excludePreviouslyAnswered),
          prioritizeWeakTopics: Boolean(parsed.config?.prioritizeWeakTopics),
          allowRepeats: Boolean(parsed.config?.allowRepeats),
        },
        startedAt: Number(parsed.startedAt) || Date.now(),
        lastActiveAt: Number(parsed.lastActiveAt) || Date.now(),
        isPaused: Boolean(parsed.isPaused),
        currentCycle: Number(parsed.currentCycle) || 1,
        answeredQuestionIds: Array.isArray(parsed.answeredQuestionIds) ? parsed.answeredQuestionIds : [],
        cycleAnsweredQuestionIds: Array.isArray(parsed.cycleAnsweredQuestionIds) ? parsed.cycleAnsweredQuestionIds : [],
        currentQuestionId: parsed.currentQuestionId ? String(parsed.currentQuestionId) : null,
        questionsAttempted: Number(parsed.questionsAttempted) || 0,
        correctCount: Number(parsed.correctCount) || 0,
        incorrectCount: Number(parsed.incorrectCount) || 0,
        currentStreak: Number(parsed.currentStreak) || 0,
        bestStreak: Number(parsed.bestStreak) || 0,
        domainStats: parsed.domainStats && typeof parsed.domainStats === 'object' ? parsed.domainStats : {},
        topicStats: parsed.topicStats && typeof parsed.topicStats === 'object' ? parsed.topicStats : {},
        difficultyStats: parsed.difficultyStats && typeof parsed.difficultyStats === 'object' ? parsed.difficultyStats : {},
      };
    } catch {
      return null;
    }
  }

  static clearStoredSession() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  }
}
