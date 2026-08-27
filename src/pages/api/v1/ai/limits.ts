import type { APIRoute } from 'astro';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';

export const GET: APIRoute = async ({ request }) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const status = rateLimiter.checkLimit(ip);
  const config = rateLimiter.getConfig();

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        status,
        limits: {
          maxHourly: config.aiQueriesPerHourPerIp,
          maxDaily: config.aiQueriesPerDayPerIp,
          aiTutorEnabled: config.aiTutorEnabled,
        },
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
