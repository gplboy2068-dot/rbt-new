import type { APIRoute } from 'astro';
import { AssessmentEngine } from '@/lib/services/assessment';
import { apiSuccess, apiError } from '@/lib/api/response';

export const POST: APIRoute = async ({ request, locals }) => {
  const anonymousSessionId = request.headers.get('x-anonymous-session-id') || `anon_${Date.now()}`;

  try {
    const body = await request.json().catch(() => ({}));
    const { session, questions } = AssessmentEngine.createPracticeSession({
      anonymousSessionId,
      domainId: body.domainId,
      topicId: body.topicId,
      difficulty: body.difficulty,
      questionCount: body.questionCount,
    });

    return apiSuccess(
      {
        sessionId: session.sessionId,
        anonymousSessionId,
        totalQuestions: questions.length,
        questions,
      },
      { requestId: locals.requestId },
      201
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to initialize practice session.', locals.requestId);
  }
};
