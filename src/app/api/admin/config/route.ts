import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';
import { verifyAdminToken } from '@/lib/auth/admin-auth';

function checkAdminAuth(request: Request) {
  // Check cookie or Authorization header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/rtb_admin_token=([^;]+)/);
  const token = match ? match[1] : request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(request: Request) {
  const admin = checkAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = rateLimiter.getConfig();
  return NextResponse.json({ config });
}

export async function POST(request: Request) {
  const admin = checkAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const updatedConfig = rateLimiter.updateConfig(updates);

    return NextResponse.json({
      success: true,
      message: 'Rate limits and AI controls updated successfully.',
      config: updatedConfig,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid config payload' }, { status: 400 });
  }
}
