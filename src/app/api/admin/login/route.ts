import { NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth/admin-auth';

// Default administrator credentials
const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Firoz@#$3030';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = signAdminToken(username);

      const response = NextResponse.json({
        success: true,
        user: { username, role: 'admin' },
      });

      // Set secure HttpOnly cookie for Admin session
      response.cookies.set({
        name: 'rtb_admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid administrative credentials.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication error.' }, { status: 500 });
  }
}
