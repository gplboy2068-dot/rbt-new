import type { APIRoute } from 'astro';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';

export const GET: APIRoute = async ({ url, locals }) => {
  const domainCode = url.searchParams.get('domain_code') || undefined;
  const topicCode = url.searchParams.get('topic_code') || undefined;
  const difficulty = url.searchParams.get('difficulty') || undefined;
  const search = url.searchParams.get('search') || undefined;
  const certification = url.searchParams.get('certification') || undefined;
  const certificationVersion = url.searchParams.get('certification_version') || undefined;
  const status = url.searchParams.get('status') || 'active';
  
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 20000) : 20000;
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  let items = [];
  if (status === 'deleted') {
    items = await ServerQuestionStore.getDeletedQuestions(locals);
  } else if (status === 'all') {
    items = await ServerQuestionStore.getAllQuestions(locals);
  } else {
    items = await ServerQuestionStore.getActiveQuestions(
      {
        domainCode,
        topicCode,
        difficulty,
        search,
        certification,
        certificationVersion,
      },
      locals
    );
  }

  const paginated = items.slice(offset, offset + limit);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        total: items.length,
        limit,
        offset,
        items: paginated,
      },
      meta: {
        timestamp: Math.floor(Date.now() / 1000),
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { questionId, questionIds, reason, deletedBy, purgeAll } = body;

    if (purgeAll) {
      const count = await ServerQuestionStore.purgeAllQuestions(locals);
      const allQ = QuestionLifecycleRepository.getAllQuestions();
      QuestionLifecycleRepository.bulkSoftDeleteQuestions(allQ.map((q) => q.id), 'Admin Purge All', 'Admin');
      return new Response(
        JSON.stringify({
          success: true,
          data: { deletedCount: count },
          message: `Successfully purged all ${count} questions from database.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
    }

    if (questionIds && Array.isArray(questionIds)) {
      const count = await ServerQuestionStore.bulkSoftDeleteQuestions(
        questionIds,
        reason || 'Admin Bulk Delete',
        deletedBy || 'Admin User',
        locals
      );
      // Sync memory repository
      QuestionLifecycleRepository.bulkSoftDeleteQuestions(questionIds, reason, deletedBy);

      return new Response(
        JSON.stringify({
          success: true,
          data: { deletedCount: count },
          message: `Successfully soft-deleted ${count} question(s) from central database.`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    if (questionId) {
      const ok = await ServerQuestionStore.softDeleteQuestion(
        questionId,
        reason || 'Admin Single Delete',
        deletedBy || 'Admin User',
        locals
      );
      // Sync memory repository
      QuestionLifecycleRepository.softDeleteQuestion(questionId, reason, deletedBy);

      if (!ok) {
        return new Response(
          JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: { questionId, status: 'deleted' },
          message: `Question ${questionId} soft-deleted from central database.`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'questionId or questionIds required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { action, questionId, questionIds } = body;

    if (action === 'restore') {
      if (questionIds && Array.isArray(questionIds)) {
        await ServerQuestionStore.restoreQuestionsBatch(questionIds, locals);
        for (const qid of questionIds) {
          QuestionLifecycleRepository.restoreDeletedQuestion(qid);
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Restored ${questionIds.length} question(s) to active status.`,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
        );
      }

      if (questionId) {
        const ok = await ServerQuestionStore.restoreDeletedQuestion(questionId, locals);
        QuestionLifecycleRepository.restoreDeletedQuestion(questionId);

        if (!ok) {
          return new Response(
            JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, message: `Question ${questionId} restored to active status.` }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid action or missing parameters' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
