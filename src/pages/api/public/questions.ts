import type { APIRoute } from 'astro';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';

export const GET: APIRoute = async ({ url, locals }) => {
  const domain = url.searchParams.get('domain') || undefined;
  const difficulty = url.searchParams.get('difficulty') || undefined;
  const search = url.searchParams.get('search') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '60', 10);

  const activeQuestions = await ServerQuestionStore.getActiveQuestions(
    {
      domainCode: domain,
      difficulty,
      search,
    },
    locals
  );

  return new Response(
    JSON.stringify({
      total: activeQuestions.length,
      questions: activeQuestions.slice(0, limit),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
};
