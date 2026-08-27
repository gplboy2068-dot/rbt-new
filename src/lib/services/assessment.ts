/**
 * Server-Authoritative Assessment Engine
 * Manages Practice Sessions, Configurable Tests, and Mock Exams
 * Enforces server-calculated scoring, idempotency, and session stability.
 */

import { Question, DifficultyLevel } from '../../types';
import { INITIAL_QUESTIONS } from '../../data/mock-data';
import { QuestionLifecycleRepository } from '../storage/question-lifecycle';
import { AppError } from '../errors/app-error';

export interface AssessmentAnswerSubmission {
  questionId: string;
  selectedOption: number; // 0-based index (0=A, 1=B, 2=C, 3=D)
  timeSpentSeconds?: number;
  flagged?: boolean;
}

export interface DomainScore {
  domain: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface TopicScore {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface AssessmentSessionState {
  sessionId: string;
  type: 'practice' | 'practice_test' | 'mock_exam';
  examId?: string;
  title: string;
  anonymousSessionId: string;
  startedAt: number;
  completedAt?: number;
  durationMinutes?: number;
  isSubmitted: boolean;
  questionIds: string[];
  answers: Record<string, { selectedOption: number; isCorrect: boolean; timeSpentSeconds: number; answeredAt: number }>;
  flaggedQuestionIds: string[];
  score: number;
  accuracy: number;
  domainBreakdown?: DomainScore[];
  topicBreakdown?: TopicScore[];
  weakTopics?: string[];
}

// In-Memory Assessment Session Store (backed by Edge KV / D1)
const activeSessions = new Map<string, AssessmentSessionState>();

export class AssessmentEngine {
  /**
   * Initialize a stable practice session strictly using active, non-deleted questions.
   */
  static createPracticeSession(params: {
    anonymousSessionId: string;
    certification?: string; // 'RBT' | 'BACB'
    certificationVersion?: string; // '6th Edition'
    allowMixedCertification?: boolean;
    domainId?: string;
    topicId?: string;
    difficulty?: DifficultyLevel;
    questionCount?: number;
  }): { session: AssessmentSessionState; questions: Partial<Question>[] } {
    let pool = QuestionLifecycleRepository.getActiveQuestions({
      certification: params.allowMixedCertification ? undefined : params.certification,
      certificationVersion: params.certificationVersion,
      domainId: params.domainId,
      topicId: params.topicId,
      difficulty: params.difficulty,
    });
    if (params.difficulty && params.difficulty !== ('All' as any)) {
      const filteredD = pool.filter((q) => q.difficulty === params.difficulty);
      if (filteredD.length > 0) {
        pool = filteredD;
      }
    }

    // Stable selection
    const count = Math.min(params.questionCount || 10, pool.length);
    const selectedQuestions = pool.slice(0, count);
    const questionIds = selectedQuestions.map((q) => q.id);

    const certLabel = params.certification || 'RBT';
    const sessionId = `psess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sessionState: AssessmentSessionState = {
      sessionId,
      type: 'practice',
      title: `${certLabel} Practice Session`,
      anonymousSessionId: params.anonymousSessionId,
      startedAt: Date.now(),
      isSubmitted: false,
      questionIds,
      answers: {},
      flaggedQuestionIds: [],
      score: 0,
      accuracy: 0,
    };

    activeSessions.set(sessionId, sessionState);

    // Return questions without revealing correct answer
    const sanitizedQuestions = selectedQuestions.map((q) => ({
      id: q.id,
      code: q.code,
      domainName: q.domainName,
      topicName: q.topicName,
      difficulty: q.difficulty,
      content: q.content,
      options: q.options,
      hint: q.hint,
    }));

    return { session: sessionState, questions: sanitizedQuestions };
  }

  /**
   * Submit an answer to an active session (Server Authoritative & Idempotent).
   */
  static submitAnswer(params: {
    sessionId: string;
    questionId: string;
    selectedOption: number;
    timeSpentSeconds?: number;
    flagged?: boolean;
  }): {
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string;
    clinicalExplanation?: string;
    hint?: string;
    currentScore: number;
    answeredCount: number;
    totalQuestions: number;
  } {
    const session = activeSessions.get(params.sessionId);
    const question = INITIAL_QUESTIONS.find((q) => q.id === params.questionId);

    if (!question) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Question does not exist in Question Bank.',
        statusCode: 404,
      });
    }

    const isCorrect = params.selectedOption === question.correctAnswer;

    if (session) {
      if (session.isSubmitted) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Session has already been submitted and finalized.',
          statusCode: 400,
        });
      }

      // Record / Update Answer Idempotently
      session.answers[params.questionId] = {
        selectedOption: params.selectedOption,
        isCorrect,
        timeSpentSeconds: params.timeSpentSeconds || 0,
        answeredAt: Date.now(),
      };

      if (params.flagged !== undefined) {
        if (params.flagged && !session.flaggedQuestionIds.includes(params.questionId)) {
          session.flaggedQuestionIds.push(params.questionId);
        } else if (!params.flagged) {
          session.flaggedQuestionIds = session.flaggedQuestionIds.filter((id) => id !== params.questionId);
        }
      }

      // Recalculate score server-side
      const correctCount = Object.values(session.answers).filter((a) => a.isCorrect).length;
      session.score = correctCount;
      session.accuracy = Math.round((correctCount / Object.keys(session.answers).length) * 100);
    }

    const answeredCount = session ? Object.keys(session.answers).length : 1;
    const totalQuestions = session ? session.questionIds.length : 1;
    const currentScore = session ? session.score : (isCorrect ? 1 : 0);

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: question.hint,
      currentScore,
      answeredCount,
      totalQuestions,
    };
  }

  /**
   * Finalize and score an assessment session (Idempotent submission protection).
   */
  static completeSession(sessionId: string): AssessmentSessionState {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Assessment session not found or expired.',
        statusCode: 404,
      });
    }

    // Idempotency: If already submitted, return finalized state immediately
    if (session.isSubmitted) {
      return session;
    }

    session.isSubmitted = true;
    session.completedAt = Date.now();

    // Compute Domain & Topic Breakdowns
    const domainMap = new Map<string, { total: number; correct: number }>();
    const topicMap = new Map<string, { total: number; correct: number }>();

    for (const qid of session.questionIds) {
      const q = INITIAL_QUESTIONS.find((item) => item.id === qid);
      if (!q) continue;

      const dName = q.domainName;
      const tName = q.topicName;
      const ans = session.answers[qid];
      const wasCorrect = ans ? ans.isCorrect : false;

      // Update Domain
      const dCurr = domainMap.get(dName) || { total: 0, correct: 0 };
      dCurr.total += 1;
      if (wasCorrect) dCurr.correct += 1;
      domainMap.set(dName, dCurr);

      // Update Topic
      const tCurr = topicMap.get(tName) || { total: 0, correct: 0 };
      tCurr.total += 1;
      if (wasCorrect) tCurr.correct += 1;
      topicMap.set(tName, tCurr);
    }

    const domainBreakdown: DomainScore[] = [];
    domainMap.forEach((val, key) => {
      domainBreakdown.push({
        domain: key,
        total: val.total,
        correct: val.correct,
        accuracy: Math.round((val.correct / val.total) * 100),
      });
    });

    const topicBreakdown: TopicScore[] = [];
    const weakTopics: string[] = [];
    topicMap.forEach((val, key) => {
      const acc = Math.round((val.correct / val.total) * 100);
      topicBreakdown.push({
        topic: key,
        total: val.total,
        correct: val.correct,
        accuracy: acc,
      });
      if (acc < 75) {
        weakTopics.push(key);
      }
    });

    const totalAnswered = Object.keys(session.answers).length;
    const totalCorrect = Object.values(session.answers).filter((a) => a.isCorrect).length;

    session.score = totalCorrect;
    session.accuracy = session.questionIds.length > 0 ? Math.round((totalCorrect / session.questionIds.length) * 100) : 0;
    session.domainBreakdown = domainBreakdown;
    session.topicBreakdown = topicBreakdown;
    session.weakTopics = weakTopics;

    return session;
  }

  /**
   * Retrieve active session state (for recovery after browser refresh).
   */
  static getSession(sessionId: string): AssessmentSessionState | null {
    return activeSessions.get(sessionId) || null;
  }
}
