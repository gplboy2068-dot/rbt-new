import type { APIRoute } from 'astro';
import { AssessmentEngine } from '@/lib/services/assessment';
import { apiSuccess, apiError } from '@/lib/api/response';

export const POST: APIRoute = async ({ params, request, locals }) => {
  const sessionId = params.id;
  if (!sessionId) {
    return apiError('Session ID is required.', locals.requestId);
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.questionId || body.selectedOption === undefined) {
      return apiError('Question ID and selected option are required.', locals.requestId);
    }

    const result = AssessmentEngine.submitAnswer({
      sessionId,
      questionId: body.questionId,
      selectedOption: body.selectedOption,
      timeSpentSeconds: body.timeSpentSeconds,
      flagged: body.flagged,
    });

    return apiSuccess(result, { requestId: locals.requestId });
  } catch (err: any) {
    return apiError(err.message || 'Failed to submit answer.', locals.requestId);
  }
};
