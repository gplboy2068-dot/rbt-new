import type { APIRoute } from 'astro';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';
import { AIGateway } from '@/lib/ai/gateway';

export const POST: APIRoute = async ({ request, locals }) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const limitCheck = rateLimiter.checkLimit(ip);
  if (!limitCheck.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: limitCheck.reason || 'Rate limit exceeded for your IP.',
        quota: {
          remainingHourly: 0,
          remainingDaily: limitCheck.remainingDaily,
        },
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    rateLimiter.recordUsage(ip);

    const runtimeEnv = (locals as any)?.runtime?.env;
    const apiKey = runtimeEnv?.DEEPSEEK_API_KEY || (typeof process !== 'undefined' ? process.env.DEEPSEEK_API_KEY : '');

    const result = await AIGateway.executeTutorQuery(body, apiKey);
    const updatedStatus = rateLimiter.checkLimit(ip);

    const payload = {
      success: true,
      reply: result.reply,
      generatedQuestion: result.generatedQuestion,
      modelUsed: result.modelUsed,
      quota: {
        remainingHourly: updatedStatus.remainingHourly,
        remainingDaily: updatedStatus.remainingDaily,
      },
      data: {
        reply: result.reply,
        generatedQuestion: result.generatedQuestion,
        modelUsed: result.modelUsed,
        quota: {
          remainingHourly: updatedStatus.remainingHourly,
          remainingDaily: updatedStatus.remainingDaily,
        },
      },
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'AI_ERROR',
        message: err?.message || 'Failed to process AI query.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
