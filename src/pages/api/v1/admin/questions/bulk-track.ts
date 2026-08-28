import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';
import { apiSuccess, apiError } from '@/lib/api/response';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const token = cookies.get('rtb_admin_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const admin = token ? await verifyAdminToken(token) : null;

  if (!admin) {
    return apiError('Admin authentication required.', locals.requestId);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { questionIds, certification } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return apiError('questionIds array is required.', locals.requestId);
    }

    if (certification !== 'RBT' && certification !== 'BACB') {
      return apiError('certification must be "RBT" or "BACB".', locals.requestId);
    }

    // Update central server store
    const count = await ServerQuestionStore.bulkUpdateCertification(questionIds, certification, locals);

    // Sync memory store
    QuestionLifecycleRepository.bulkUpdateCertification(questionIds, certification);

    return apiSuccess(
      {
        updatedCount: count,
        certification,
        message: `Successfully updated ${count} question(s) to ${certification} track.`,
      },
      { requestId: locals.requestId },
      200
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to bulk update questions certification.', locals.requestId);
  }
};
