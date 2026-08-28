import { testConfig } from './config.test';
import { testApiResponse } from './api-response.test';
import { testDbClient } from './db-client.test';
import { testStorage } from './storage.test';
import { testCSVImport } from './csv-import.test';
import { testAssessmentEngine } from './assessment-engine.test';
import { testFlashcardSRS } from './flashcard-srs.test';
import { testAIEngine } from './ai-engine.test';
import { testAnalyticsAdaptive } from './analytics-adaptive.test';
import { testCMSAndSEO } from './cms-seo.test';
import { testLaunchAudit } from './launch-audit.test';
import { runRBTAndBACBAudit } from './rbt-6th-edition-audit';
import { testQuestionDeletionLifecycle } from './question-deletion-lifecycle.test';
import { testFlashcardDeletionLifecycle } from './flashcard-deletion-lifecycle.test';
import { testMultiBrowserDatabaseSync } from './multi-browser-db-sync.test';
import { testUnlimitedStudyMode } from './unlimited-study.test';
import './indexnow.test';

async function main() {
  console.log('================================================================');
  console.log('🚀 RUNNING INTEGRATED TEST SUITE (PHASES 0 - 9 & MULTI-BROWSER DB AUDIT)');
  console.log('================================================================');

  let passed = true;
  if (!testConfig()) passed = false;
  if (!(await testApiResponse())) passed = false;
  if (!(await testDbClient())) passed = false;
  if (!(await testStorage())) passed = false;
  if (!(await testCSVImport())) passed = false;
  if (!(await testAssessmentEngine())) passed = false;
  if (!(await testFlashcardSRS())) passed = false;
  if (!(await testAIEngine())) passed = false;
  if (!(await testAnalyticsAdaptive())) passed = false;
  if (!(await testCMSAndSEO())) passed = false;
  if (!(await testLaunchAudit())) passed = false;
  if (!(await testQuestionDeletionLifecycle())) passed = false;
  if (!(await testFlashcardDeletionLifecycle())) passed = false;
  if (!(await testMultiBrowserDatabaseSync())) passed = false;
  if (!testUnlimitedStudyMode()) passed = false;

  const auditReport = runRBTAndBACBAudit();
  if (auditReport.verdict !== 'VERIFIED') passed = false;

  console.log('================================================================');
  if (passed) {
    console.log('🎉 ALL INTEGRATED TESTS PASSED (100% SUCCESS — PRODUCTION READY)');
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
