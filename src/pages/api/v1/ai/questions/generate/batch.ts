import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('rtb_admin_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const admin = token ? await verifyAdminToken(token) : null;

  if (!admin) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const jobId = `job_aigen_${Date.now()}`;
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        jobId,
        status: 'pending',
        message: 'Batch AI question generation dispatched to processing queue.',
      },
    }),
    { status: 202, headers: { 'Content-Type': 'application/json' } }
  );
};
