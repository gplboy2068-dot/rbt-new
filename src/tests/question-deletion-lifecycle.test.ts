import { QuestionLifecycleRepository } from '../lib/storage/question-lifecycle';
import { AssessmentEngine } from '../lib/services/assessment';
import { FlashcardConverterService } from '../lib/services/flashcard-converter';
import { processCSVToQuestions } from '../lib/csv/importer';
import { INITIAL_QUESTIONS } from '../data/mock-data';

export async function testQuestionDeletionLifecycle(): Promise<boolean> {
  console.log('🧪 Testing Question Deletion, Restore Default & Exam Integrity Lifecycle...');

  // Reset test environment
  const targetQuestion = INITIAL_QUESTIONS[0]; // e.g. mq-rbt-freq-001
  const targetId = targetQuestion.id;

  // 1. Initial State: Question is active
  const initialActive = QuestionLifecycleRepository.getActiveQuestions();
  const existsInitially = initialActive.some((q) => q.id === targetId);
  if (!existsInitially) {
    console.error('❌ Test Setup Failed: Target question is not in active pool.');
    return false;
  }
  console.log(`   - Verified initial active state for target question "${targetQuestion.code}".`);

  // 2. Execute Soft-Delete
  const deleteResult = QuestionLifecycleRepository.softDeleteQuestion(targetId, 'Automated Test Deletion', 'QA Auditor');
  if (!deleteResult) {
    console.error('❌ Soft delete operation failed.');
    return false;
  }

  // Verify it is excluded from getActiveQuestions()
  const activeAfterDelete = QuestionLifecycleRepository.getActiveQuestions();
  if (activeAfterDelete.some((q) => q.id === targetId)) {
    console.error('❌ CRITICAL FAILURE: Soft-deleted question still returned in getActiveQuestions()!');
    return false;
  }

  // Verify it is present in getDeletedQuestions() with audit trail
  const deletedList = QuestionLifecycleRepository.getDeletedQuestions();
  const deletedRecord = deletedList.find((q) => q.id === targetId);
  if (!deletedRecord || deletedRecord.status !== 'deleted' || !deletedRecord.deletedAt) {
    console.error('❌ Deleted question audit trail missing or invalid.');
    return false;
  }
  console.log(`   - Verified soft-delete: Question "${targetQuestion.code}" moved to Deleted Archive with timestamp.`);

  // 3. CRITICAL TEST: Practice Engine excludes deleted question
  const practiceSession = AssessmentEngine.createPracticeSession({
    anonymousSessionId: 'anon_qa_test',
    questionCount: 60,
  });
  if (practiceSession.questions.some((q) => q.id === targetId)) {
    console.error('❌ CRITICAL FAILURE: Practice Session created with deleted question!');
    return false;
  }
  console.log('   - Verified Practice Engine: Deleted question excluded from active practice sessions.');

  // 4. CRITICAL TEST: Flashcard conversion rejects deleted question
  try {
    FlashcardConverterService.convertSingleQuestion(targetId);
    console.error('❌ CRITICAL FAILURE: Flashcard conversion succeeded on deleted question!');
    return false;
  } catch (err: any) {
    console.log(`   - Verified Flashcard Engine: Rejected conversion of deleted question (${err.message}).`);
  }

  // 5. CRITICAL TEST: CSV Ingestion does NOT resurrect deleted question
  const testCSV = `Code,Question,OptionA,OptionB,OptionC,OptionD,Answer,Explanation,Category,Topic,Difficulty
${targetQuestion.code},${targetQuestion.content},${targetQuestion.options[0]},${targetQuestion.options[1]},${targetQuestion.options[2] || 'Opt C'},${targetQuestion.options[3] || 'Opt D'},A,${targetQuestion.explanation},Measurement,Continuous,Easy`;

  const csvResult = processCSVToQuestions(testCSV, 'INSERT_NEW');
  if (csvResult.questions.some((q) => q.id === targetId || q.code === targetQuestion.code)) {
    console.error('❌ CRITICAL FAILURE: CSV import resurrected a deleted question!');
    return false;
  }
  console.log('   - Verified CSV Ingestion: Deleted question prevented from automatic resurrection.');

  // 6. CRITICAL TEST: Restore Default Configuration does NOT resurrect deleted question
  const configRestoreResult = QuestionLifecycleRepository.restoreDefaultConfiguration();
  if (configRestoreResult.deletedQuestionsPreservedCount === 0) {
    console.error('❌ Restore Default Configuration cleared deleted registry!');
    return false;
  }
  const activeAfterRestoreDefault = QuestionLifecycleRepository.getActiveQuestions();
  if (activeAfterRestoreDefault.some((q) => q.id === targetId)) {
    console.error('❌ CRITICAL FAILURE: Restore Default Configuration resurrected deleted question!');
    return false;
  }
  console.log('   - Verified Restore Default: Settings restored, deleted questions strictly preserved.');

  // 7. CRITICAL TEST: Explicit Restore re-activates the question
  const explicitRestoreResult = QuestionLifecycleRepository.restoreDeletedQuestion(targetId);
  if (!explicitRestoreResult) {
    console.error('❌ Explicit restore failed.');
    return false;
  }

  const activeAfterExplicitRestore = QuestionLifecycleRepository.getActiveQuestions();
  if (!activeAfterExplicitRestore.some((q) => q.id === targetId)) {
    console.error('❌ Question not restored to active pool after explicit restore.');
    return false;
  }
  console.log(`   - Verified Explicit Restore: Question "${targetQuestion.code}" re-activated to Active Question Bank.`);

  console.log('✅ Question Deletion Lifecycle & Exam Integrity Tests Passed (100% Verified).');
  return true;
}

if (process.argv[1]?.includes('question-deletion-lifecycle.test')) {
  testQuestionDeletionLifecycle().then((res) => {
    if (!res) process.exit(1);
  });
}
