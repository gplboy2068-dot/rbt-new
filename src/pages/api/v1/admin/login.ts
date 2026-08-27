import type { APIRoute } from 'astro';
import { signAdminToken } from '@/lib/auth/admin-auth';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'rtb2026admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = await signAdminToken(username);

      cookies.set('rtb_admin_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: { user: { username, role: 'superadmin' } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid admin username or password' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: 'Authentication failed' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
