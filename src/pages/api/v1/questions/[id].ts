import type { APIRoute } from 'astro';
import { ServerQuestionStore } from '@/lib/storage/server-question-store';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'ID required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const all = await ServerQuestionStore.getAllQuestions(locals);
  const question = all.find((q) => q.id === id || q.code === id);

  if (!question) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: `Question '${id}' was not found.` },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: question,
      meta: { timestamp: Math.floor(Date.now() / 1000) },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const DELETE: APIRoute = async ({ params, locals, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'ID required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let reason = 'Admin Delete Action';
    try {
      const body = await request.json();
      if (body.reason) reason = body.reason;
    } catch {}

    const ok = await ServerQuestionStore.softDeleteQuestion(id, reason, 'Admin', locals);
    QuestionLifecycleRepository.softDeleteQuestion(id, reason, 'Admin');

    if (!ok) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Question ${id} soft-deleted from central database.` }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
