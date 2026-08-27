import type { APIRoute } from 'astro';
import { INITIAL_MOCK_EXAMS } from '@/data/mock-data';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        items: INITIAL_MOCK_EXAMS.map((e) => ({
          id: e.id,
          code: e.code,
          title: e.title,
          description: e.description,
          domainScope: e.domain,
          durationMinutes: e.durationMinutes,
          passingScorePercent: e.passingScorePercent,
          totalQuestions: e.totalQuestions,
        })),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
