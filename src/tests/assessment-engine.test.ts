import { AssessmentEngine } from '../lib/services/assessment';

export async function testAssessmentEngine(): Promise<boolean> {
  console.log('🧪 Testing Assessment Engine (Phases 2: Practice + Tests + Mock Exams)...');

  // ==========================================
  // FLOW 1: Practice Session & Selection
  // ==========================================
  console.log('   - Flow 1: Initializing Practice Session with domain filters...');
  const { session, questions } = AssessmentEngine.createPracticeSession({
    anonymousSessionId: 'anon_test_user_1',
    domainId: 'dom_a',
    questionCount: 5,
  });

  if (!session.sessionId || questions.length === 0) {
    console.error('❌ Failed to create practice session.');
    return false;
  }
  console.log(`   - Practice session created: ${session.sessionId} with ${questions.length} questions.`);

  // ==========================================
  // FLOW 2: Answer Submission & Scoring
  // ==========================================
  console.log('   - Flow 2: Testing Server-Authoritative Answer Validation & Flagging...');
  const q1 = questions[0];
  const ansRes = AssessmentEngine.submitAnswer({
    sessionId: session.sessionId,
    questionId: q1.id!,
    selectedOption: 1,
    timeSpentSeconds: 12,
    flagged: true,
  });

  if (ansRes.correctAnswer === undefined || !ansRes.explanation) {
    console.error('❌ Answer submission did not return server authoritative explanation/answer.');
    return false;
  }
  console.log(`   - Question ${q1.code}: Answer recorded, CorrectIdx=${ansRes.correctAnswer}, isCorrect=${ansRes.isCorrect}`);

  // ==========================================
  // FLOW 3: Session Completion & Diagnostics
  // ==========================================
  console.log('   - Flow 3: Testing Session Finalization & Domain/Topic Diagnostics...');
  const finalSession = AssessmentEngine.completeSession(session.sessionId);

  if (!finalSession.isSubmitted || !finalSession.domainBreakdown || !finalSession.topicBreakdown) {
    console.error('❌ Session completion diagnostics incomplete.');
    return false;
  }
  console.log(`   - Finalized Score: ${finalSession.score}/${finalSession.questionIds.length} (${finalSession.accuracy}%), Domains Scored=${finalSession.domainBreakdown.length}`);

  // ==========================================
  // FLOW 4: Session Recovery After Refresh
  // ==========================================
  console.log('   - Flow 4: Testing Session State Recovery (Simulating Page Refresh)...');
  const recovered = AssessmentEngine.getSession(session.sessionId);
  if (!recovered || recovered.sessionId !== session.sessionId) {
    console.error('❌ Failed to recover session state from memory store.');
    return false;
  }
  console.log(`   - Successfully recovered session ${recovered.sessionId} with ${Object.keys(recovered.answers).length} saved answers.`);

  // ==========================================
  // FLOW 5: Idempotent Double-Click Protection
  // ==========================================
  console.log('   - Flow 5: Testing Idempotency / Double-Click Submit Protection...');
  const reComplete = AssessmentEngine.completeSession(session.sessionId);
  if (reComplete.completedAt !== finalSession.completedAt || reComplete.score !== finalSession.score) {
    console.error('❌ Idempotency failure: Repeated completion mutated session state.');
    return false;
  }
  console.log('   - Double-submit correctly returned existing finalized result with zero side effects.');

  console.log('✅ Assessment Engine Tests Passed.');
  return true;
}
