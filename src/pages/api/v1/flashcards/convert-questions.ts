import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { FlashcardConverterService } from '@/lib/services/flashcard-converter';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';
import { ServerFlashcardStore } from '@/lib/storage/server-flashcard-store';
import { FlashcardLifecycleRepository } from '@/lib/storage/flashcard-lifecycle';
import { apiSuccess, apiError } from '@/lib/api/response';
import { Flashcard, Question } from '@/types';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const questionIds: string[] = body.questionIds || [];

    if (questionIds.length === 0) {
      return apiError('No question IDs provided for conversion.', locals.requestId);
    }

    const allQuestions = await ServerQuestionStore.getAllQuestions(locals);
    const questionMap = new Map<string, Question>();
    allQuestions.forEach((q) => {
      questionMap.set(q.id, q);
      questionMap.set(q.code, q);
    });

    const newCards: Flashcard[] = [];
    let converted = 0;
    let failed = 0;

    for (const qid of questionIds) {
      const q = questionMap.get(qid);
      if (!q || q.status === 'deleted') {
        failed++;
        continue;
      }

      const preview = FlashcardConverterService.generateCardPreview(q);
      const cardId = `fc_${q.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      const card: Flashcard = {
        id: cardId,
        certification: q.certification || 'RBT',
        certificationVersion: q.certificationVersion || '6th Edition',
        domain: preview.domain,
        topic: preview.topic,
        front: preview.front,
        back: preview.back,
        explanation: preview.rationale,
        sourceQuestionId: q.id,
        status: 'active',
      };

      newCards.push(card);
      converted++;
    }

    if (newCards.length > 0) {
      await ServerFlashcardStore.addOrUpsertFlashcards(newCards, locals);
      newCards.forEach((c) => FlashcardLifecycleRepository.registerFlashcard(c));
    }

    return apiSuccess(
      {
        totalSelected: questionIds.length,
        convertedCount: converted,
        failedCount: failed,
        newCards,
      },
      { requestId: locals.requestId }
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to convert questions to flashcards.', locals.requestId);
  }
};
