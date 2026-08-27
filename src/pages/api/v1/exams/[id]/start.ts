import type { APIRoute } from 'astro';
import { INITIAL_MOCK_EXAMS, INITIAL_QUESTIONS } from '@/data/mock-data';

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const exam = INITIAL_MOCK_EXAMS.find((e) => e.id === id || e.code === id);

  if (!exam) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Exam not found.' } }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const questions = INITIAL_QUESTIONS.filter((q) => exam.questionIds.includes(q.id));
  const attemptId = `exatt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + exam.durationMinutes * 60;

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        attemptId,
        mockExamId: exam.id,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        expiresAt,
        questions: questions.map((q) => ({
          id: q.id,
          code: q.code,
          domainName: q.domainName,
          topicName: q.topicName,
          content: q.content,
          options: q.options.map((o, idx) => ({ key: String.fromCharCode(65 + idx), content: o })),
        })),
      },
      meta: { timestamp: now },
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
