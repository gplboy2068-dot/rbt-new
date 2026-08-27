import type { APIRoute } from 'astro';
import { AssessmentEngine } from '@/lib/services/assessment';
import { apiSuccess, apiError } from '@/lib/api/response';

export const POST: APIRoute = async ({ params, locals }) => {
  const sessionId = params.id;
  if (!sessionId) {
    return apiError('Session ID is required.', locals.requestId);
  }

  try {
    const finalSession = AssessmentEngine.completeSession(sessionId);
    return apiSuccess(
      {
        sessionId: finalSession.sessionId,
        score: finalSession.score,
        totalQuestions: finalSession.questionIds.length,
        accuracy: finalSession.accuracy,
        domainBreakdown: finalSession.domainBreakdown,
        topicBreakdown: finalSession.topicBreakdown,
        weakTopics: finalSession.weakTopics,
        completedAt: finalSession.completedAt,
      },
      { requestId: locals.requestId }
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to complete session.', locals.requestId);
  }
};
