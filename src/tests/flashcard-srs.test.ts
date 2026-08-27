import { FlashcardConverterService } from '../lib/services/flashcard-converter';
import { calculateSM2, createInitialSRSState } from '../lib/srs/sm2';
import { INITIAL_QUESTIONS } from '../data/mock-data';

export async function testFlashcardSRS(): Promise<boolean> {
  console.log('🧪 Testing Flashcard & SuperMemo-2 (SM-2) SRS Engine (Phase 3)...');

  // ==========================================
  // TEST 1: Single Question Transformation & Concise Extraction
  // ==========================================
  console.log('   - Test 1: Single Question -> Flashcard concise transformation...');
  const q1 = INITIAL_QUESTIONS[0];
  const preview = FlashcardConverterService.generateCardPreview(q1);

  if (!preview.front || !preview.back || !preview.definition) {
    console.error('❌ Flashcard preview generation missing required fields:', preview);
    return false;
  }
  console.log(`   - Converted Question ${q1.code}: Front="${preview.front.slice(0, 50)}...", Back="${preview.back.split('\n')[0]}"`);

  // ==========================================
  // TEST 2: Duplicate Prevention
  // ==========================================
  console.log('   - Test 2: Testing Duplicate Conversion Prevention on same question ID...');
  const firstConvert = FlashcardConverterService.convertSingleQuestion(q1.id);
  const secondConvert = FlashcardConverterService.convertSingleQuestion(q1.id);

  if (firstConvert.alreadyExists || !secondConvert.alreadyExists) {
    console.error('❌ Duplicate prevention failed: Second conversion did not detect existing card.');
    return false;
  }
  console.log('   - Duplicate successfully blocked. First run created card; second run flagged existing.');

  // ==========================================
  // TEST 3: Bulk Conversion Matrix (1st Run vs 2nd Run)
  // ==========================================
  console.log('   - Test 3: Bulk Conversion Matrix on 5 questions...');
  const testQids = INITIAL_QUESTIONS.slice(1, 6).map((q) => q.id);

  const bulkRun1 = FlashcardConverterService.convertBulkQuestions(testQids);
  console.log(`   - Bulk Run 1: Total=${bulkRun1.totalSelected}, Converted=${bulkRun1.converted}, AlreadyExisted=${bulkRun1.alreadyConverted}`);

  if (bulkRun1.converted !== testQids.length) {
    console.error('❌ Bulk Run 1 failed to convert all selected questions:', bulkRun1);
    return false;
  }

  const bulkRun2 = FlashcardConverterService.convertBulkQuestions(testQids);
  console.log(`   - Bulk Run 2: Total=${bulkRun2.totalSelected}, Converted=${bulkRun2.converted}, AlreadyExisted=${bulkRun2.alreadyConverted}`);

  if (bulkRun2.converted !== 0 || bulkRun2.alreadyConverted !== testQids.length) {
    console.error('❌ Bulk Run 2 duplicate check failed. Converted should be 0, already converted should be', testQids.length);
    return false;
  }

  // ==========================================
  // TEST 4: SuperMemo-2 (SM-2) Algorithmic Interval Progression
  // ==========================================
  console.log('   - Test 4: Testing SuperMemo-2 (SM-2) interval calculations...');
  let srsState = createInitialSRSState('test_card_01');

  // Repetition 0 -> Good (Quality 4) -> Interval: 1 day, Rep: 1
  srsState = calculateSM2(srsState, 'good');
  if (srsState.interval !== 1 || srsState.repetition !== 1) {
    console.error('❌ SM-2 Rep 0 -> Good failed:', srsState);
    return false;
  }
  console.log(`   - SM-2 Rep 1: Interval=${srsState.interval} day, Ease=${srsState.easeFactor}, Status=${srsState.status}`);

  // Repetition 1 -> Good (Quality 4) -> Interval: 6 days, Rep: 2
  srsState = calculateSM2(srsState, 'good');
  if (srsState.interval !== 6 || srsState.repetition !== 2) {
    console.error('❌ SM-2 Rep 1 -> Good failed:', srsState);
    return false;
  }
  console.log(`   - SM-2 Rep 2: Interval=${srsState.interval} days, Ease=${srsState.easeFactor}, Status=${srsState.status}`);

  // Repetition 2 -> Easy (Quality 5) -> Interval: 6 * 2.5 = 15 days, Rep: 3
  srsState = calculateSM2(srsState, 'easy');
  if (srsState.interval < 14 || srsState.repetition !== 3) {
    console.error('❌ SM-2 Rep 2 -> Easy failed:', srsState);
    return false;
  }
  console.log(`   - SM-2 Rep 3 (Easy): Interval=${srsState.interval} days, Ease=${srsState.easeFactor}, Status=${srsState.status}`);

  // Failed Recall -> Again (Quality 1) -> Repetition resets to 0, Interval: 1 day
  srsState = calculateSM2(srsState, 'again');
  if (srsState.interval !== 1 || srsState.repetition !== 0) {
    console.error('❌ SM-2 Failed Recall (Again) failed:', srsState);
    return false;
  }
  console.log(`   - SM-2 Reset on 'Again': Repetition=${srsState.repetition}, Interval=${srsState.interval} day`);

  // ==========================================
  // TEST 5: Refresh & State Recovery Resilience
  // ==========================================
  console.log('   - Test 5: Testing State Serialization & Refresh Recovery...');
  const serialized = JSON.stringify(srsState);
  const rehydrated = JSON.parse(serialized);

  if (rehydrated.cardId !== srsState.cardId || rehydrated.easeFactor !== srsState.easeFactor) {
    console.error('❌ State serialization round-trip failed.');
    return false;
  }
  console.log('   - State serialization verified: Rehydrated state accurately matches original.');

  console.log('✅ Flashcard & SuperMemo-2 SRS Tests Passed.');
  return true;
}
