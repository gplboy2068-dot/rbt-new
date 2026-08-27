import { FlashcardLifecycleRepository } from '../lib/storage/flashcard-lifecycle';
import { FlashcardConverterService } from '../lib/services/flashcard-converter';
import { INITIAL_FLASHCARDS } from '../data/mock-data';

export async function testFlashcardDeletionLifecycle(): Promise<boolean> {
  console.log('🧪 Testing Flashcard Deletion, Persistence, Restore & Conversion Safeguards...');

  const targetCard = INITIAL_FLASHCARDS[0]; // e.g. fc_continuous_measurement
  const targetId = targetCard.id;

  // 1. Initial State: Active
  const initialActive = FlashcardLifecycleRepository.getActiveFlashcards();
  if (!initialActive.some((c) => c.id === targetId)) {
    console.error('❌ Flashcard Test Setup Failed: Target card not active initially.');
    return false;
  }
  console.log(`   - Verified initial active state for Flashcard "${targetId}".`);

  // 2. Soft Delete Flashcard
  const deleteOk = FlashcardLifecycleRepository.softDeleteFlashcard(targetId, 'QA Deletion Test', 'QA Auditor');
  if (!deleteOk) {
    console.error('❌ Flashcard soft delete operation failed.');
    return false;
  }

  // Verify excluded from active list
  const activeAfterDelete = FlashcardLifecycleRepository.getActiveFlashcards();
  if (activeAfterDelete.some((c) => c.id === targetId)) {
    console.error('❌ CRITICAL FAILURE: Soft-deleted flashcard still returned in getActiveFlashcards()!');
    return false;
  }

  // Verify in deleted archive with audit trail
  const deletedCards = FlashcardLifecycleRepository.getDeletedFlashcards();
  const deletedItem = deletedCards.find((c) => c.id === targetId);
  if (!deletedItem || deletedItem.status !== 'deleted' || !deletedItem.deletedAt) {
    console.error('❌ Deleted flashcard audit trail missing or invalid.');
    return false;
  }
  console.log(`   - Verified soft-delete: Flashcard "${targetId}" moved to Deleted Archive with timestamp.`);

  // 3. Question -> Flashcard conversion must NOT resurrect deleted card
  if (targetCard.sourceQuestionId) {
    try {
      FlashcardConverterService.convertSingleQuestion(targetCard.sourceQuestionId);
      console.error('❌ CRITICAL FAILURE: Conversion silently resurrected deleted flashcard!');
      return false;
    } catch (err: any) {
      console.log(`   - Verified Conversion Guard: Blocked resurrection of deleted flashcard (${err.message}).`);
    }
  }

  // 4. Bulk Conversion must NOT resurrect deleted card
  if (targetCard.sourceQuestionId) {
    const bulkRes = FlashcardConverterService.convertBulkQuestions([targetCard.sourceQuestionId]);
    if (bulkRes.newCards.some((c) => c.id === targetId)) {
      console.error('❌ CRITICAL FAILURE: Bulk conversion recreated deleted flashcard!');
      return false;
    }
    console.log('   - Verified Bulk Conversion: Deleted flashcard was safely skipped.');
  }

  // 5. Explicit Restore re-activates flashcard
  const restoreOk = FlashcardLifecycleRepository.restoreDeletedFlashcard(targetId);
  if (!restoreOk) {
    console.error('❌ Explicit flashcard restore failed.');
    return false;
  }

  const activeAfterRestore = FlashcardLifecycleRepository.getActiveFlashcards();
  if (!activeAfterRestore.some((c) => c.id === targetId)) {
    console.error('❌ Flashcard not returned to active list after explicit restore.');
    return false;
  }
  console.log(`   - Verified Explicit Restore: Flashcard "${targetId}" reactivated to Active Deck.`);

  console.log('✅ Flashcard Deletion Lifecycle & Persistence Tests Passed (100% Verified).');
  return true;
}

if (process.argv[1]?.includes('flashcard-deletion-lifecycle.test')) {
  testFlashcardDeletionLifecycle().then((res) => {
    if (!res) process.exit(1);
  });
}
