import { db } from './db';
import {
  QuestionAttempt,
  Bookmark,
  FlashcardSRSState,
  MockExamAttempt,
  UserPreferences,
  SubjectCategory,
} from '@/types';
import { calculateSM2, createInitialSRSState, ReviewGrade } from '../srs/sm2';

export interface ExportDataPayload {
  version: number;
  exportedAt: number;
  attempts: QuestionAttempt[];
  bookmarks: Bookmark[];
  srsStates: FlashcardSRSState[];
  mockAttempts: MockExamAttempt[];
  preferences?: UserPreferences;
}

export interface IProgressRepository {
  saveAttempt(attempt: Omit<QuestionAttempt, 'id' | 'timestamp'>): Promise<QuestionAttempt>;
  getAttempts(subject?: SubjectCategory): Promise<QuestionAttempt[]>;
  getAllAttempts(): Promise<QuestionAttempt[]>;
  toggleBookmark(questionId: string, notes?: string): Promise<boolean>;
  isBookmarked(questionId: string): Promise<boolean>;
  getAllBookmarks(): Promise<Bookmark[]>;
  getSRSState(cardId: string): Promise<FlashcardSRSState>;
  getAllSRSStates(): Promise<FlashcardSRSState[]>;
  reviewFlashcard(cardId: string, grade: ReviewGrade): Promise<FlashcardSRSState>;
  saveMockAttempt(session: Omit<MockExamAttempt, 'id'>): Promise<MockExamAttempt>;
  getMockAttempts(): Promise<MockExamAttempt[]>;
  exportData(): Promise<string>;
  importData(jsonString: string): Promise<{ success: boolean; message: string }>;
  clearAll(): Promise<void>;
  clearAllProgress(): Promise<void>;
  clearAllProgress(): Promise<void>;
  getStats(): Promise<{
    totalAnswered: number;
    correctCount: number;
    accuracy: number;
    streakDays: number;
    subjectBreakdown: Record<string, { total: number; correct: number }>;
  }>;
}

class LocalIndexedDBRepository implements IProgressRepository {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  async saveAttempt(attemptData: Omit<QuestionAttempt, 'id' | 'timestamp'>): Promise<QuestionAttempt> {
    const attempt: QuestionAttempt = {
      ...attemptData,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    if (this.isClient()) {
      try {
        await db.attempts.add(attempt);
      } catch {
        // Fallback localStorage
        const attempts = this.getLocalStorage<QuestionAttempt[]>('rtb_attempts', []);
        attempts.push(attempt);
        localStorage.setItem('rtb_attempts', JSON.stringify(attempts.slice(-500)));
      }
    }
    return attempt;
  }

  async getAttempts(subject?: SubjectCategory): Promise<QuestionAttempt[]> {
    if (!this.isClient()) return [];
    try {
      if (subject) {
        return await db.attempts.where('subject').equals(subject).toArray();
      }
      return await db.attempts.toArray();
    } catch {
      const attempts = this.getLocalStorage<QuestionAttempt[]>('rtb_attempts', []);
      return subject ? attempts.filter((a) => a.subject === subject) : attempts;
    }
  }

  async getAllAttempts(): Promise<QuestionAttempt[]> {
    return this.getAttempts();
  }

  async toggleBookmark(questionId: string, notes?: string): Promise<boolean> {
    if (!this.isClient()) return false;
    try {
      const existing = await db.bookmarks.get(questionId);
      if (existing) {
        await db.bookmarks.delete(questionId);
        return false;
      } else {
        await db.bookmarks.put({ questionId, savedAt: Date.now(), notes });
        return true;
      }
    } catch {
      const bookmarks = this.getLocalStorage<Bookmark[]>('rtb_bookmarks', []);
      const idx = bookmarks.findIndex((b) => b.questionId === questionId);
      if (idx >= 0) {
        bookmarks.splice(idx, 1);
        localStorage.setItem('rtb_bookmarks', JSON.stringify(bookmarks));
        return false;
      } else {
        bookmarks.push({ questionId, savedAt: Date.now(), notes });
        localStorage.setItem('rtb_bookmarks', JSON.stringify(bookmarks));
        return true;
      }
    }
  }

  async isBookmarked(questionId: string): Promise<boolean> {
    if (!this.isClient()) return false;
    try {
      const item = await db.bookmarks.get(questionId);
      return !!item;
    } catch {
      const bookmarks = this.getLocalStorage<Bookmark[]>('rtb_bookmarks', []);
      return bookmarks.some((b) => b.questionId === questionId);
    }
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    if (!this.isClient()) return [];
    try {
      return await db.bookmarks.toArray();
    } catch {
      return this.getLocalStorage<Bookmark[]>('rtb_bookmarks', []);
    }
  }

  async getSRSState(cardId: string): Promise<FlashcardSRSState> {
    if (!this.isClient()) return createInitialSRSState(cardId);
    try {
      const state = await db.srsStates.get(cardId);
      return state || createInitialSRSState(cardId);
    } catch {
      const states = this.getLocalStorage<Record<string, FlashcardSRSState>>('rtb_srs', {});
      return states[cardId] || createInitialSRSState(cardId);
    }
  }

  async getAllSRSStates(): Promise<FlashcardSRSState[]> {
    if (!this.isClient()) return [];
    try {
      return await db.srsStates.toArray();
    } catch {
      const states = this.getLocalStorage<Record<string, FlashcardSRSState>>('rtb_srs', {});
      return Object.values(states);
    }
  }

  async reviewFlashcard(cardId: string, grade: ReviewGrade): Promise<FlashcardSRSState> {
    const current = await this.getSRSState(cardId);
    const updated = calculateSM2(current, grade);
    if (this.isClient()) {
      try {
        await db.srsStates.put(updated);
      } catch {
        const states = this.getLocalStorage<Record<string, FlashcardSRSState>>('rtb_srs', {});
        states[cardId] = updated;
        localStorage.setItem('rtb_srs', JSON.stringify(states));
      }
    }
    return updated;
  }

  async saveMockAttempt(sessionData: Omit<MockExamAttempt, 'id'>): Promise<MockExamAttempt> {
    const session: MockExamAttempt = {
      ...sessionData,
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    if (this.isClient()) {
      try {
        await db.mockAttempts.add(session);
      } catch {
        const attempts = this.getLocalStorage<MockExamAttempt[]>('rtb_mock_attempts', []);
        attempts.push(session);
        localStorage.setItem('rtb_mock_attempts', JSON.stringify(attempts));
      }
    }
    return session;
  }

  async getMockAttempts(): Promise<MockExamAttempt[]> {
    if (!this.isClient()) return [];
    try {
      return await db.mockAttempts.orderBy('completedAt').reverse().toArray();
    } catch {
      return this.getLocalStorage<MockExamAttempt[]>('rtb_mock_attempts', []);
    }
  }

  async exportData(): Promise<string> {
    if (!this.isClient()) return '{}';
    const attempts = await this.getAllAttempts();
    const bookmarks = await this.getAllBookmarks();
    const srsStates = await this.getAllSRSStates();
    const mockAttempts = await this.getMockAttempts();

    const payload: ExportDataPayload = {
      version: 1,
      exportedAt: Date.now(),
      attempts,
      bookmarks,
      srsStates,
      mockAttempts,
    };
    return JSON.stringify(payload, null, 2);
  }

  async importData(jsonString: string): Promise<{ success: boolean; message: string }> {
    if (!this.isClient()) return { success: false, message: 'Client context unavailable' };
    try {
      const data: ExportDataPayload = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid file format.' };
      }

      if (Array.isArray(data.attempts)) {
        await db.attempts.bulkPut(data.attempts);
      }
      if (Array.isArray(data.bookmarks)) {
        await db.bookmarks.bulkPut(data.bookmarks);
      }
      if (Array.isArray(data.srsStates)) {
        await db.srsStates.bulkPut(data.srsStates);
      }
      if (Array.isArray(data.mockAttempts)) {
        await db.mockAttempts.bulkPut(data.mockAttempts);
      }

      return { success: true, message: 'Progress successfully restored!' };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: err.message || 'Failed to import data.' };
    }
  }

  async clearAll(): Promise<void> {
    await this.clearAllProgress();
  }

  async clearAllProgress(): Promise<void> {
    if (!this.isClient()) return;
    try {
      await db.attempts.clear();
      await db.bookmarks.clear();
      await db.srsStates.clear();
      await db.mockAttempts.clear();
      localStorage.removeItem('rtb_attempts');
      localStorage.removeItem('rtb_bookmarks');
      localStorage.removeItem('rtb_srs');
      localStorage.removeItem('rtb_mock_attempts');
    } catch (e) {
      console.error('Error clearing progress:', e);
    }
  }

  async getStats(): Promise<{
    totalAnswered: number;
    correctCount: number;
    accuracy: number;
    streakDays: number;
    subjectBreakdown: Record<string, { total: number; correct: number }>;
  }> {
    const attempts = await this.getAllAttempts();
    const totalAnswered = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    const subjectBreakdown: Record<string, { total: number; correct: number }> = {};
    const datesSet = new Set<string>();

    for (const att of attempts) {
      const sub = att.subject || 'General';
      if (!subjectBreakdown[sub]) {
        subjectBreakdown[sub] = { total: 0, correct: 0 };
      }
      subjectBreakdown[sub].total += 1;
      if (att.isCorrect) subjectBreakdown[sub].correct += 1;

      const dateStr = new Date(att.timestamp).toISOString().split('T')[0];
      datesSet.add(dateStr);
    }

    // Calculate approximate active streak
    const streakDays = datesSet.size;

    return {
      totalAnswered,
      correctCount,
      accuracy,
      streakDays,
      subjectBreakdown,
    };
  }

  private getLocalStorage<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }
}

export const progressRepo: IProgressRepository = new LocalIndexedDBRepository();
