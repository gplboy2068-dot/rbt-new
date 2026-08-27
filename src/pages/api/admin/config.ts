import type { APIRoute } from 'astro';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';
import { verifyAdminToken } from '@/lib/auth/admin-auth';

async function checkAuth(request: Request, cookies: any) {
  const token = cookies.get('rtb_admin_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return await verifyAdminToken(token);
}

export const GET: APIRoute = async ({ request, cookies }) => {
  const admin = await checkAuth(request, cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ config: rateLimiter.getConfig() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const admin = await checkAuth(request, cookies);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const updated = rateLimiter.updateConfig(body);

    return new Response(JSON.stringify({ success: true, config: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid configuration' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
