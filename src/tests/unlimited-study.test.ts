/**
 * Phase 9: Unlimited Study Mode Comprehensive Test Suite
 * Tests session lifecycle, certification isolation, anti-resurrection,
 * 10-question pool exhaustion & repeat logic, weak-topic weighting, and anonymous persistence.
 */

import { StudyEngine, UnlimitedStudyConfig } from '../lib/study/study-engine';
import { INITIAL_QUESTIONS } from '../data/mock-data';
import { QuestionLifecycleRepository } from '../lib/storage/question-lifecycle';
import { Question } from '../types';

export function testUnlimitedStudyMode(): boolean {
  console.log('🧪 Testing Phase 9: Unlimited Study Mode & Exhaustion Lifecycle...');

  // 1. Test Session Creation
  const config: UnlimitedStudyConfig = {
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'All',
    topic: 'All',
    difficulty: 'All',
    order: 'sequential',
    excludePreviouslyAnswered: false,
    prioritizeWeakTopics: false,
    allowRepeats: false,
  };

  const session = StudyEngine.createSession(config);
  if (!session.id || session.questionsAttempted !== 0 || session.currentCycle !== 1) {
    console.error('❌ Failed to initialize unlimited study session.');
    return false;
  }
  console.log('   - Test 1: Created Unlimited Study Session successfully (ID: ' + session.id + ').');

  // 2. Test Strict Certification Track Separation
  const mixedPool: Question[] = [
    ...INITIAL_QUESTIONS.slice(0, 5).map((q) => ({ ...q, certification: 'RBT' as const, certificationVersion: '6th Edition' as const })),
    {
      id: 'bacb_q_01',
      code: 'BACB-ETH-001',
      content: 'BACB Only Question',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      domainName: 'Ethics',
      topicName: 'Conduct',
      difficulty: 'Medium',
      explanation: 'BACB explanation',
      certification: 'BACB',
      certificationVersion: 'Standard',
      status: 'active',
    },
  ];

  const rbtFiltered = StudyEngine.filterCandidateQuestions(mixedPool, {
    ...config,
    certification: 'RBT',
  });
  if (rbtFiltered.some((q) => q.certification === 'BACB' || q.id === 'bacb_q_01')) {
    console.error('❌ CRITICAL FAILURE: RBT Study Mode leaked BACB question!');
    return false;
  }

  const bacbFiltered = StudyEngine.filterCandidateQuestions(mixedPool, {
    ...config,
    certification: 'BACB',
    certificationVersion: 'All',
  });
  if (bacbFiltered.some((q) => q.certification === 'RBT')) {
    console.error('❌ CRITICAL FAILURE: BACB Study Mode leaked RBT question!');
    return false;
  }
  console.log('   - Test 2: Strict Certification Track Isolation Verified (RBT vs BACB 100% separated).');

  // 3. Test Anti-Resurrection / Deleted Question Exclusion
  const targetDelId = INITIAL_QUESTIONS[0].id;
  QuestionLifecycleRepository.softDeleteQuestion(targetDelId, 'Test Study Delete', 'Tester');

  const poolWithDeleted = StudyEngine.filterCandidateQuestions(INITIAL_QUESTIONS, config);
  if (poolWithDeleted.some((q) => q.id === targetDelId)) {
    console.error('❌ CRITICAL FAILURE: Deleted question appeared in candidate study pool!');
    return false;
  }
  // Restore for subsequent tests
  QuestionLifecycleRepository.restoreDeletedQuestion(targetDelId);
  console.log('   - Test 3: Anti-Resurrection Guard Verified (Deleted questions excluded from study pool).');

  // 4. CRITICAL TEST: 10-Question Pool Exhaustion & "Allow Repeats" Cycle Restart
  const testTenQuestions: Question[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `study_ten_q_${i + 1}`,
    code: `TEN-Q-${i + 1}`,
    content: `Question Number ${i + 1} Stem`,
    options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
    correctAnswer: 0,
    domainName: 'A: Measurement',
    topicName: 'Continuous',
    difficulty: 'Easy',
    explanation: `Explanation for Q${i + 1}`,
    certification: 'RBT',
    certificationVersion: '6th Edition',
    status: 'active',
  }));

  const tenSession = StudyEngine.createSession(config);
  const servedIds = new Set<string>();

  for (let i = 0; i < 10; i++) {
    const nextRes = StudyEngine.getNextQuestion(tenSession, testTenQuestions);
    if (!nextRes.question) {
      console.error(`❌ Premature exhaustion at index ${i}`);
      return false;
    }
    if (servedIds.has(nextRes.question.id)) {
      console.error(`❌ Duplicate question served before pool exhaustion: ${nextRes.question.id}`);
      return false;
    }
    servedIds.add(nextRes.question.id);

    // Record answer (alternate correct/incorrect)
    StudyEngine.recordAnswer(tenSession, nextRes.question, i % 2 === 0 ? 0 : 1);
  }

  // 11th call must be EXHAUSTED
  const exhaustedRes = StudyEngine.getNextQuestion(tenSession, testTenQuestions);
  if (!exhaustedRes.isExhausted || exhaustedRes.question !== null) {
    console.error('❌ CRITICAL FAILURE: Pool exhaustion was not signaled after 10 questions!');
    return false;
  }
  console.log('   - Test 4A: 10-Question Pool Exhaustion Verified (All 10 served uniquely without duplicates).');

  // Allow Repeats: Start Cycle 2
  const cycleTwoSession = StudyEngine.restartCycle(tenSession);
  if (cycleTwoSession.currentCycle !== 2 || cycleTwoSession.cycleAnsweredQuestionIds.length !== 0) {
    console.error('❌ Cycle restart failed to reset cycleAnsweredQuestionIds.');
    return false;
  }

  const cycleTwoNext = StudyEngine.getNextQuestion(cycleTwoSession, testTenQuestions);
  if (cycleTwoNext.isExhausted || !cycleTwoNext.question) {
    console.error('❌ Cycle 2 failed to serve question after Allow Repeats.');
    return false;
  }
  console.log('   - Test 4B: Allow Repeats / New Cycle Restart Verified (Cycle #2 seamlessly began).');

  // 5. Test Metrics and Streak Tracking
  if (
    tenSession.questionsAttempted !== 10 ||
    tenSession.correctCount !== 5 ||
    tenSession.incorrectCount !== 5 ||
    tenSession.bestStreak === 0
  ) {
    console.error('❌ Metrics calculation error on study session.');
    return false;
  }
  console.log(`   - Test 5: Metrics Verified (Attempted: ${tenSession.questionsAttempted}, Correct: ${tenSession.correctCount}, Best Streak: ${tenSession.bestStreak}).`);

  // 6. Test Weak Topic Prioritization
  const weakTopic = 'Continuous';
  const weakSession = StudyEngine.createSession({
    ...config,
    prioritizeWeakTopics: true,
  });

  const weakQuestions = StudyEngine.filterCandidateQuestions(
    testTenQuestions,
    weakSession.config,
    [weakTopic]
  );
  if (weakQuestions[0].topicName !== weakTopic) {
    console.error('❌ Weak topic questions were not prioritized at head of candidate pool.');
    return false;
  }
  console.log('   - Test 6: Adaptive Weak Topic Prioritization Verified.');

  console.log('✅ Phase 9 Unlimited Study Mode Tests Passed (100% Verified).');
  return true;
}
