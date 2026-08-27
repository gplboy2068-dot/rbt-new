import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { AnalyticsService } from '@/lib/services/analytics';
import { apiSuccess, apiError } from '@/lib/api/response';

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const token = cookies.get('rtb_admin_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const admin = token ? await verifyAdminToken(token) : null;

  if (!admin) {
    return apiError('Admin authentication required.', locals.requestId);
  }

  const telemetry = AnalyticsService.getAdminAnalytics();
  return apiSuccess(telemetry, { requestId: locals.requestId });
};
