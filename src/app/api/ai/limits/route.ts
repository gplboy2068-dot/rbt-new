import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';

export async function GET(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const status = rateLimiter.checkLimit(ip);
  const config = rateLimiter.getConfig();

  return NextResponse.json({
    status: {
      allowed: status.allowed,
      remainingHourly: status.remainingHourly,
      remainingDaily: status.remainingDaily,
      resetHourInSeconds: status.resetHourInSeconds,
      reason: status.reason,
    },
    limits: {
      maxHourly: config.aiQueriesPerHourPerIp,
      maxDaily: config.aiQueriesPerDayPerIp,
      aiTutorEnabled: config.aiTutorEnabled,
    },
  });
}
