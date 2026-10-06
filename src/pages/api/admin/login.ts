import type { APIRoute } from 'astro';
import { signAdminToken } from '@/lib/auth/admin-auth';



function getAdminCredentials(locals: any) {
  const env = locals?.runtime?.env || {};
  const username = env.ADMIN_USERNAME || (typeof process !== 'undefined' ? process.env.ADMIN_USERNAME : undefined);
  const password = env.ADMIN_PASSWORD || (typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : undefined);
  const jwtSecret = env.ADMIN_JWT_SECRET || (typeof process !== 'undefined' ? process.env.ADMIN_JWT_SECRET : undefined);
  return { username, password, jwtSecret };
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const { username, password } = await request.json();

    const configured = getAdminCredentials(locals);
    if (!configured.username || !configured.password || !configured.jwtSecret) {
      return new Response(JSON.stringify({ success: false, error: { code: 'SERVER_NOT_CONFIGURED', message: 'Admin login is not configured on the server.' } }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (username === configured.username && password === configured.password) {
      const token = await signAdminToken(username, configured.jwtSecret);

      cookies.set('rtb_admin_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      return new Response(JSON.stringify({ success: true, user: { username, role: 'admin' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Auth error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
