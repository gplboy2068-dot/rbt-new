import { defineMiddleware } from 'astro:middleware';
import { Logger } from '../lib/logger';
import { verifyAdminToken } from '../lib/auth/admin-auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  context.locals.requestId = requestId;

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Protect Admin UI & Admin API routes (excluding login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/admin/login')) {
    const token = context.cookies.get('rtb_admin_token')?.value;
    const admin = token ? await verifyAdminToken(token) : null;

    if (!admin) {
      if (pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Admin authentication required.' },
            meta: { requestId, timestamp: Math.floor(Date.now() / 1000) },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return context.redirect('/admin/login');
    }
  }

  // Execute request
  const response = await next();

  // Set Production Security Headers
  response.headers.set('X-Request-Id', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  const duration = Date.now() - start;
  if (pathname.startsWith('/api/')) {
    Logger.info('HTTP_API_REQUEST', `${context.request.method} ${pathname} [${response.status}] - ${duration}ms`, {
      requestId,
      route: pathname,
    });
  }

  return response;
});
