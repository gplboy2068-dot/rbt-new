import type { APIRoute } from 'astro';
import { calculateSM2, createInitialSRSState, ReviewGrade } from '@/lib/srs/sm2';

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  try {
    const body = await request.json();
    const grade: ReviewGrade = body.grade || 'good';

    const current = createInitialSRSState(id || 'card');
    const updated = calculateSM2(current, grade);

    return new Response(
      JSON.stringify({
        success: true,
        data: updated,
        meta: { timestamp: Math.floor(Date.now() / 1000) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process SRS review' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
