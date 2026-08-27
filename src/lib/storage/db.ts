import Dexie, { Table } from 'dexie';
import { QuestionAttempt, Bookmark, FlashcardSRSState, MockExamAttempt, UserPreferences } from '@/types';

export class RTBDatabase extends Dexie {
  attempts!: Table<QuestionAttempt, string>;
  bookmarks!: Table<Bookmark, string>;
  srsStates!: Table<FlashcardSRSState, string>;
  mockAttempts!: Table<MockExamAttempt, string>;
  preferences!: Table<UserPreferences & { id: string }, string>;

  constructor() {
    super('RTB_StudyDB');
    this.version(1).stores({
      attempts: 'id, questionId, subject, topic, isCorrect, timestamp',
      bookmarks: 'questionId, savedAt',
      srsStates: 'cardId, dueDate, status, lastReviewed',
      mockAttempts: 'id, examId, subject, completedAt, score',
      preferences: 'id',
    });
  }
}

export const db = new RTBDatabase();
