import type { APIRoute } from 'astro';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';
import { AIGateway } from '@/lib/ai/gateway';

export const POST: APIRoute = async ({ request }) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const limitCheck = rateLimiter.checkLimit(ip);
  if (!limitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'RATE_LIMIT_EXCEEDED',
        message: limitCheck.reason || 'Rate limit exceeded.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    rateLimiter.recordUsage(ip);

    const result = await AIGateway.executeTutorQuery(body);
    const updatedStatus = rateLimiter.checkLimit(ip);

    return new Response(
      JSON.stringify({
        reply: result.reply,
        generatedQuestion: result.generatedQuestion,
        quota: {
          remainingHourly: updatedStatus.remainingHourly,
          remainingDaily: updatedStatus.remainingDaily,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to process AI query' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
