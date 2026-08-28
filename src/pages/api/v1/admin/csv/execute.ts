import type { APIRoute } from 'astro';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { processCSVToQuestions } from '@/lib/csv/importer';
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
    const { csvText, questions: rawQuestions, conflictResolution = 'UPSERT', targetCertification } = body;

    let questionsToIngest = [];

    if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
      questionsToIngest = rawQuestions;
    } else if (csvText && typeof csvText === 'string') {
      const parsed = processCSVToQuestions(csvText, conflictResolution);
      questionsToIngest = parsed.questions;
    }

    if (targetCertification === 'BACB' || targetCertification === 'RBT') {
      questionsToIngest = questionsToIngest.map((q: any) => ({
        ...q,
        certification: targetCertification,
      }));
    }

    if (questionsToIngest.length === 0) {
      return apiError('No valid questions found in CSV payload to ingest.', locals.requestId);
    }

    // Ingest into ServerQuestionStore (central DB)
    const importedCount = await ServerQuestionStore.addOrUpsertQuestions(questionsToIngest, locals);
    // Sync memory lifecycle
    QuestionLifecycleRepository.addOrUpsertQuestions(questionsToIngest);

    const totalActive = (await ServerQuestionStore.getActiveQuestions({}, locals)).length;

    return apiSuccess(
      {
        importedCount,
        totalActiveQuestions: totalActive,
        message: `Successfully ingested ${importedCount} question(s) into central database.`,
      },
      { requestId: locals.requestId },
      200
    );
  } catch (err: any) {
    return apiError(err.message || 'Failed to ingest CSV questions into database.', locals.requestId);
  }
};
