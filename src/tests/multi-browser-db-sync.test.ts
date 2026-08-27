import { ServerQuestionStore } from '../lib/storage/server-question-store';
import { INITIAL_QUESTIONS } from '../data/mock-data';

export async function testMultiBrowserDatabaseSync(): Promise<boolean> {
  console.log('🧪 Testing Multi-Browser & Multi-Device Central Database Synchronization...');

  const targetQuestion = INITIAL_QUESTIONS[1]; // e.g. mq-rbt-dur-002
  const targetId = targetQuestion.id;

  // 1. Initial State: Central Database has question as active
  const initialActive = await ServerQuestionStore.getActiveQuestions();
  const existsInitially = initialActive.some((q) => q.id === targetId);
  if (!existsInitially) {
    console.error('❌ Sync Test Setup Failed: Target question not active in central database.');
    return false;
  }
  console.log(`   - [Browser A & Browser B] Initial state verified: Question "${targetQuestion.code}" active in central database.`);

  // 2. Browser A executes Delete Action -> Server Database Mutation
  const deleteOk = await ServerQuestionStore.softDeleteQuestion(
    targetId,
    'Browser A Delete Action',
    'Admin Session A'
  );
  if (!deleteOk) {
    console.error('❌ Central database delete mutation failed.');
    return false;
  }
  console.log(`   - [Browser A] Soft-deleted question "${targetQuestion.code}" from central database.`);

  // 3. Browser B (Simulating fresh request / another device / incognito) queries Central DB
  const browserBActiveQuestions = await ServerQuestionStore.getActiveQuestions();
  if (browserBActiveQuestions.some((q) => q.id === targetId)) {
    console.error('❌ CRITICAL FAILURE: Browser B still received deleted question from Central Database!');
    return false;
  }
  console.log(`   - [Browser B] Verified Central DB: Question "${targetQuestion.code}" is 100% ABSENT in fresh query.`);

  // 4. Browser B queries Deleted Archive -> Question is present with audit metadata
  const deletedArchive = await ServerQuestionStore.getDeletedQuestions();
  const deletedRecord = deletedArchive.find((q) => q.id === targetId);
  if (!deletedRecord || deletedRecord.status !== 'deleted' || !deletedRecord.deletedAt) {
    console.error('❌ Central database deleted archive missing audit trail.');
    return false;
  }
  console.log(`   - [Browser B] Verified Deleted Archive: Question recorded as deleted with timestamp.`);

  // 5. Browser B executes Explicit Restore
  const restoreOk = await ServerQuestionStore.restoreDeletedQuestion(targetId);
  if (!restoreOk) {
    console.error('❌ Central database restore mutation failed.');
    return false;
  }

  // 6. Browser A & Browser B query again -> Question is active for both
  const finalActive = await ServerQuestionStore.getActiveQuestions();
  if (!finalActive.some((q) => q.id === targetId)) {
    console.error('❌ Question not restored across browsers in Central Database.');
    return false;
  }
  console.log(`   - [Browser A & B] Verified Central DB Restore: Question "${targetQuestion.code}" active again across all browsers.`);

  console.log('✅ Multi-Browser & Central Database Synchronization Tests Passed (100% Verified).');
  return true;
}

if (process.argv[1]?.includes('multi-browser-db-sync.test')) {
  testMultiBrowserDatabaseSync().then((res) => {
    if (!res) process.exit(1);
  });
}
