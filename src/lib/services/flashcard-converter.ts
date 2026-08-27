/**
 * Question to Flashcard Conversion Engine
 * Transforms complex question stems into concise, high-yield recall flashcards.
 * Enforces source_question_id tracking and duplicate prevention.
 */

import { Question, Flashcard } from '../../types';
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from '../../data/mock-data';
import { QuestionLifecycleRepository } from '../storage/question-lifecycle';
import { FlashcardLifecycleRepository } from '../storage/flashcard-lifecycle';
import { AppError } from '../errors/app-error';

export interface ConvertedFlashcardPreview {
  front: string;
  back: string;
  definition: string;
  rationale: string;
  clinicalRationale?: string;
  memoryTip?: string;
  domain: string;
  topic: string;
  difficulty: string;
  sourceQuestionId: string;
}

export interface BulkConversionResult {
  totalSelected: number;
  converted: number;
  alreadyConverted: number;
  failed: number;
  skipped: number;
  newCards: Flashcard[];
}

export class FlashcardConverterService {
  /**
   * Preview how a Question will be transformed into a Flashcard before saving.
   */
  static generateCardPreview(question: Question): ConvertedFlashcardPreview {
    const correctOpt = question.options[question.correctAnswer] || question.options[0] || 'Correct Concept';
    let front = question.content;
    if (front.length > 120) {
      front = `${front.slice(0, 117)}...`;
    }

    const domainName = question.domainName || 'General';
    const topicName = question.topicName || 'RBT Task List';

    return {
      front,
      back: correctOpt,
      definition: correctOpt,
      rationale: question.explanation || `Core concept for ${topicName}.`,
      clinicalRationale: question.explanation,
      memoryTip: `Remember: ${topicName} key focus.`,
      domain: domainName,
      topic: topicName,
      difficulty: question.difficulty || 'Medium',
      sourceQuestionId: question.id,
    };
  }

  /**
   * Convert a single Question into a Flashcard (Duplicate & Soft-Delete Protected).
   */
  static convertSingleQuestion(questionId: string): { card: Flashcard; alreadyExists: boolean } {
    if (QuestionLifecycleRepository.isDeleted(questionId)) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: `Cannot convert deleted question "${questionId}" to Flashcard.`,
        statusCode: 400,
      });
    }

    if (FlashcardLifecycleRepository.isSourceQuestionFlashcardDeleted(questionId)) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: `Flashcard derived from question "${questionId}" was intentionally deleted. Use explicit Restore to reactivate.`,
        statusCode: 400,
      });
    }

    const activeCards = FlashcardLifecycleRepository.getActiveFlashcards();
    for (const card of activeCards) {
      if (card.sourceQuestionId === questionId) {
        return { card, alreadyExists: true };
      }
    }

    const question = QuestionLifecycleRepository.getActiveQuestions().find((q) => q.id === questionId);
    if (!question) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: `Active source question "${questionId}" not found or has been deleted.`,
        statusCode: 404,
      });
    }

    const preview = this.generateCardPreview(question);
    const newCardId = `fc_${question.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (FlashcardLifecycleRepository.isDeleted(newCardId)) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: `Flashcard "${newCardId}" is marked as deleted. Use explicit Restore.`,
        statusCode: 400,
      });
    }

    const newCard: Flashcard = {
      id: newCardId,
      certification: question.certification || 'RBT',
      certificationVersion: question.certificationVersion || '6th Edition',
      domain: preview.domain,
      topic: preview.topic,
      front: preview.front,
      back: preview.back,
      explanation: preview.rationale,
      sourceQuestionId: question.id,
      status: 'active',
    };

    FlashcardLifecycleRepository.registerFlashcard(newCard);
    return { card: newCard, alreadyExists: false };
  }

  /**
   * Convert multiple questions in bulk with duplicate and deletion prevention.
   */
  static convertBulkQuestions(questionIds: string[]): BulkConversionResult {
    let converted = 0;
    let alreadyConverted = 0;
    let failed = 0;
    let skipped = 0;
    const newCards: Flashcard[] = [];

    const activeCards = FlashcardLifecycleRepository.getActiveFlashcards();
    const existingSourceIds = new Set<string>();
    for (const card of activeCards) {
      if (card.sourceQuestionId) {
        existingSourceIds.add(card.sourceQuestionId);
      }
    }

    for (const qid of questionIds) {
      if (existingSourceIds.has(qid)) {
        alreadyConverted++;
        continue;
      }

      if (QuestionLifecycleRepository.isDeleted(qid) || FlashcardLifecycleRepository.isSourceQuestionFlashcardDeleted(qid)) {
        skipped++;
        continue;
      }

      try {
        const res = this.convertSingleQuestion(qid);
        if (res.alreadyExists) {
          alreadyConverted++;
        } else {
          converted++;
          newCards.push(res.card);
          existingSourceIds.add(qid);
        }
      } catch {
        failed++;
      }
    }

    return {
      totalSelected: questionIds.length,
      converted,
      alreadyConverted,
      failed,
      skipped,
      newCards,
    };
  }

  /**
   * Get all active flashcards.
   */
  static getActiveFlashcards(): Flashcard[] {
    return FlashcardLifecycleRepository.getActiveFlashcards();
  }
}
