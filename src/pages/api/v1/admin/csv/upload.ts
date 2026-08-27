import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { parseRFC4180CSV, validateAndPreviewCSV } from '@/lib/csv/importer';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';
import { apiSuccess, apiError } from '@/lib/api/response';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const token = cookies.get('rtb_admin_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const admin = token ? await verifyAdminToken(token) : null;

  if (!admin) {
    return apiError('Admin authentication required.', locals.requestId);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError('No CSV file provided.', locals.requestId);
    }

    const text = await file.text();
    const activeQuestions = await ServerQuestionStore.getActiveQuestions({}, locals);
    const existingCodes = new Set<string>();
    activeQuestions.forEach((q) => {
      existingCodes.add(q.code);
      existingCodes.add(q.id);
    });

    const preview = validateAndPreviewCSV(text, existingCodes);
    const rows = parseRFC4180CSV(text);
    const fileKey = `imports/${new Date().toISOString().split('T')[0]}/${Date.now()}_${file.name}`;

    return apiSuccess(
      {
        fileKey,
        fileName: file.name,
        totalRows: preview.totalRows,
        validRows: preview.validRows,
        invalidRows: preview.invalidRows,
        duplicates: preview.duplicates,
        newQuestions: preview.newQuestions,
        existingQuestions: preview.existingQuestions,
        detectedColumns: preview.detectedColumns,
        previewRows: rows.slice(1, 6),
        errors: preview.errors,
      },
      { requestId: locals.requestId }
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to process CSV file.', locals.requestId);
  }
};
