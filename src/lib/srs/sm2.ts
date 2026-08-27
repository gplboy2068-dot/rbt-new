import { FlashcardSRSState } from '@/types';

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

const GRADE_SCORES: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createInitialSRSState(cardId: string): FlashcardSRSState {
  return {
    cardId,
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: Date.now(),
    lastReviewed: 0,
    status: 'new',
  };
}

/**
 * Calculates updated SuperMemo-2 (SM-2) spaced repetition parameters.
 */
export function calculateSM2(
  currentState: FlashcardSRSState,
  grade: ReviewGrade
): FlashcardSRSState {
  const quality = GRADE_SCORES[grade];
  let { interval, repetition, easeFactor } = currentState;
  const now = Date.now();

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1; // 1 day
    } else if (repetition === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Failed recall (Again)
    repetition = 0;
    interval = 1;
  }

  // Calculate new Ease Factor (min 1.3)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Determine status
  let status: FlashcardSRSState['status'] = 'learning';
  if (interval >= 21) {
    status = 'mastered';
  } else if (repetition > 1) {
    status = 'review';
  }

  // Calculate next due date in milliseconds
  const msInDay = 24 * 60 * 60 * 1000;
  const dueDate = now + interval * msInDay;

  return {
    cardId: currentState.cardId,
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate,
    lastReviewed: now,
    status,
  };
}
