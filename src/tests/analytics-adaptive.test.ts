import { AnalyticsService } from '../lib/services/analytics';
import { QuestionAttempt } from '../types';

export async function testAnalyticsAdaptive(): Promise<boolean> {
  console.log('🧪 Testing Analytics & Adaptive Learning Engine (Phase 5)...');

  // ==========================================
  // TEST 1: Empty State Handling (Zero Data Fabrication)
  // ==========================================
  console.log('   - Test 1: Testing Empty State Handling on zero attempts...');
  const emptyAnalysis = AnalyticsService.analyzeStudentPerformance([]);

  if (emptyAnalysis.totalAttempts !== 0 || emptyAnalysis.accuracy !== 0 || emptyAnalysis.domainBreakdown.length !== 0) {
    console.error('❌ Empty state failed: fabricated non-zero data:', emptyAnalysis);
    return false;
  }
  if (emptyAnalysis.recommendations.length === 0 || emptyAnalysis.recommendations[0].id !== 'rec_start_practice') {
    console.error('❌ Empty state failed to generate initial onboarding recommendation.');
    return false;
  }
  console.log('   - Empty state verified: Clean zero totals, zero fake charts, initial diagnostic CTA generated.');

  // ==========================================
  // TEST 2: Deterministic Weak vs Strong Topic Test Dataset
  // ==========================================
  console.log('   - Test 2: Testing Weak vs Strong Topic Detection (Topic A: 60% vs Topic B: 90%)...');
  const attempts: QuestionAttempt[] = [];

  // Topic A: Continuous Measurement (20 attempts: 12 correct, 8 incorrect -> 60% accuracy -> WEAK)
  for (let i = 0; i < 20; i++) {
    attempts.push({
      id: `att_a_${i}`,
      questionId: `q_a_${i}`,
      domain: 'A: Measurement',
      topic: 'Continuous Measurement',
      selectedAnswer: i < 12 ? 1 : 0,
      isCorrect: i < 12,
      timeSpentSeconds: 10,
      timestamp: Date.now() - i * 1000,
    });
  }

  // Topic B: Preference Assessments (20 attempts: 18 correct, 2 incorrect -> 90% accuracy -> STRONG)
  for (let i = 0; i < 20; i++) {
    attempts.push({
      id: `att_b_${i}`,
      questionId: `q_b_${i}`,
      domain: 'B: Assessment',
      topic: 'Preference Assessments',
      selectedAnswer: i < 18 ? 1 : 0,
      isCorrect: i < 18,
      timeSpentSeconds: 8,
      timestamp: Date.now() - i * 1000,
    });
  }

  const analysis = AnalyticsService.analyzeStudentPerformance(attempts);
  console.log(`   - Total Processed: ${analysis.totalAttempts} attempts, Accuracy=${analysis.accuracy}% (${analysis.correctAttempts}/${analysis.totalAttempts})`);

  // Verify Weak Topics
  const weakContinuous = analysis.weakTopics.find((t) => t.topic === 'Continuous Measurement');
  if (!weakContinuous || weakContinuous.accuracy !== 60 || weakContinuous.attempts !== 20) {
    console.error('❌ Topic A was not correctly identified as Weak with 60% accuracy:', weakContinuous);
    return false;
  }
  console.log(`   - Weak Topic Detected: "${weakContinuous.topic}" (Acc: ${weakContinuous.accuracy}%, Score: ${weakContinuous.weaknessScore})`);

  // Verify Strong Topics
  const strongPref = analysis.strongTopics.find((t) => t.topic === 'Preference Assessments');
  if (!strongPref || strongPref.accuracy !== 90 || strongPref.attempts !== 20) {
    console.error('❌ Topic B was not correctly identified as Strong with 90% accuracy:', strongPref);
    return false;
  }
  console.log(`   - Strong Topic Detected: "${strongPref.topic}" (Acc: ${strongPref.accuracy}%)`);

  // ==========================================
  // TEST 3: Adaptive Explanatory Recommendation
  // ==========================================
  console.log('   - Test 3: Testing Adaptive Recommendation Generation & Explanatory "WHY"...');
  const topRec = analysis.recommendations[0];
  if (!topRec || !topRec.reason.includes('Continuous Measurement') || !topRec.reason.includes('60%')) {
    console.error('❌ Adaptive recommendation missing explanatory why rationale:', topRec);
    return false;
  }
  console.log(`   - Recommendation generated: "${topRec.title}" -> WHY: "${topRec.reason}"`);

  console.log('✅ Analytics & Adaptive Learning Engine Tests Passed.');
  return true;
}
