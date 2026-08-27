import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';
import { verifyAdminToken } from '@/lib/auth/admin-auth';
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS, INITIAL_MOCK_EXAMS, INITIAL_STUDY_GUIDES } from '@/data/mock-data';

function checkAdminAuth(request: Request) {
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

  const rateMetrics = rateLimiter.getMetricsSummary();

  // Aggregate anonymous platform telemetry
  return NextResponse.json({
    metrics: {
      totalQuestionsAvailable: INITIAL_QUESTIONS.length,
      totalFlashcards: INITIAL_FLASHCARDS.length,
      totalMockExams: INITIAL_MOCK_EXAMS.length,
      totalStudyGuides: INITIAL_STUDY_GUIDES.length,
      anonymousIpsTracked: rateMetrics.trackedIpsCount,
      activeAnonSessionsToday: rateMetrics.activeSessionsToday,
      authModel: 'Phase 1: Zero-Signup / Open Access + Client-side Storage',
      storageEngine: 'IndexedDB + localStorage fallback',
      systemHealth: 'All services operating normally (100% Free & Open Access)',
    },
  });
}
