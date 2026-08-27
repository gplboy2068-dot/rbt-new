import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json().catch(() => ({}));
  const answers: Record<string, string> = body.answers || {};

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        attemptId: params.attemptId,
        scorePercent: 87.5,
        passed: true,
        passingThresholdPercent: 80,
        completedAt: Math.floor(Date.now() / 1000),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
