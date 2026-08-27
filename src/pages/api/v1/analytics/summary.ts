import type { APIRoute } from 'astro';
import { AnalyticsService } from '@/lib/services/analytics';
import { apiSuccess } from '@/lib/api/response';

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => ({}));
  const attempts = Array.isArray(body.attempts) ? body.attempts : [];
  const analysis = AnalyticsService.analyzeStudentPerformance(attempts);

  return apiSuccess(analysis, { requestId: locals.requestId });
};
