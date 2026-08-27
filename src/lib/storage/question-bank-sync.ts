import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { Question } from '@/types';

export const QUESTION_STORAGE_KEY = 'rbt_admin_question_bank';
export const QUESTION_DELETED_IDS_KEY = 'rbt_admin_deleted_question_ids';

/**
 * Universally retrieves the active Question Bank across all client features.
 * Respects admin deletions and custom imported questions from localStorage.
 */
export function getActiveQuestionBank(): Question[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(QUESTION_STORAGE_KEY);
      const deleted = localStorage.getItem(QUESTION_DELETED_IDS_KEY);
      const deletedSet = new Set<string>(deleted ? JSON.parse(deleted) : []);

      if (saved !== null) {
        const parsed: Question[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((q) => !deletedSet.has(q.id));
        }
      }

      if (deletedSet.size > 0) {
        return INITIAL_QUESTIONS.filter((q) => !deletedSet.has(q.id));
      }
    } catch (e) {
      console.error('Failed to get active question bank', e);
    }
  }

  return INITIAL_QUESTIONS;
}
