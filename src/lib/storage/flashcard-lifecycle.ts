/**
 * Authoritative Flashcard Lifecycle & Repository Engine
 * Enforces Soft-Delete Architecture, Immutable Audit Trails,
 * Strict Active-Only Study Session Filtering, and Protected Conversion Boundaries.
 */

import { INITIAL_FLASHCARDS } from '@/data/mock-data';
import { Flashcard } from '@/types';

export const FLASHCARD_LIFECYCLE_KEY = 'rbt_flashcard_lifecycle_store_v2';
export const FLASHCARD_DELETED_REGISTRY_KEY = 'rbt_flashcard_deleted_registry_v2';

// In-Memory Master Registry (Server & Edge Runtime Authoritative)
const inMemoryFlashcards = new Map<string, Flashcard>();
const deletedFlashcardsAudit = new Map<
  string,
  { deletedAt: number; deletedBy: string; reason?: string; sourceQuestionId?: string }
>();

// Seed with default authentic flashcards marked as active
for (const fc of INITIAL_FLASHCARDS) {
  inMemoryFlashcards.set(fc.id, {
    ...fc,
    certification: fc.certification || 'RBT',
    certificationVersion: fc.certificationVersion || '6th Edition',
    status: fc.status || 'active',
  });
}

function syncClientStorage(allCards: Flashcard[], deletedRegistry: Record<string, any>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FLASHCARD_LIFECYCLE_KEY, JSON.stringify(allCards));
      localStorage.setItem(FLASHCARD_DELETED_REGISTRY_KEY, JSON.stringify(deletedRegistry));
    } catch (e) {
      console.error('Failed to sync Flashcard store to localStorage', e);
    }
  }
}

function loadClientStorage() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(FLASHCARD_LIFECYCLE_KEY);
      const deleted = localStorage.getItem(FLASHCARD_DELETED_REGISTRY_KEY);

      if (deleted) {
        const parsedDel = JSON.parse(deleted);
        Object.entries(parsedDel).forEach(([id, meta]: [string, any]) => {
          deletedFlashcardsAudit.set(id, meta);
        });
      }

      if (saved) {
        const parsed: Flashcard[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          inMemoryFlashcards.clear();
          parsed.forEach((fc) => {
            if (deletedFlashcardsAudit.has(fc.id)) {
              const meta = deletedFlashcardsAudit.get(fc.id)!;
              fc.status = 'deleted';
              fc.deletedAt = meta.deletedAt;
              fc.deletedBy = meta.deletedBy;
              fc.deletionReason = meta.reason;
            }
            inMemoryFlashcards.set(fc.id, fc);
          });
        }
      }
    } catch (e) {
      console.error('Failed to load Flashcard store from localStorage', e);
    }
  }
}

// Initial load
loadClientStorage();

export class FlashcardLifecycleRepository {
  /**
   * Retrieves all flashcards in the repository (including deleted & archived for Admin).
   */
  static getAllFlashcards(): Flashcard[] {
    loadClientStorage();
    return Array.from(inMemoryFlashcards.values());
  }

  /**
   * STRICT ACTIVE-ONLY FLASHCARDS QUERY
   * Used for Study Sessions, Decks, Spaced Repetition (SM-2), and Search.
   * NEVER returns deleted or archived flashcards.
   */
  static getActiveFlashcards(filters?: {
    certification?: string;
    domain?: string;
    search?: string;
  }): Flashcard[] {
    loadClientStorage();
    let list = Array.from(inMemoryFlashcards.values()).filter(
      (c) => (c.status === 'active' || !c.status) && c.status !== 'deleted' && c.status !== 'archived' && !deletedFlashcardsAudit.has(c.id)
    );

    if (filters?.certification && filters.certification !== 'All') {
      const cert = filters.certification.toUpperCase();
      list = list.filter((c) => (c.certification || 'RBT').toUpperCase() === cert);
    }

    if (filters?.domain && filters.domain !== 'All') {
      list = list.filter((c) => c.domain.toLowerCase().includes(filters.domain!.toLowerCase()));
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.front.toLowerCase().includes(s) ||
          c.back.toLowerCase().includes(s) ||
          c.topic.toLowerCase().includes(s)
      );
    }

    return list;
  }

  /**
   * Retrieves deleted flashcards with full audit trail for Admin.
   */
  static getDeletedFlashcards(): Flashcard[] {
    loadClientStorage();
    return Array.from(inMemoryFlashcards.values()).filter(
      (c) => c.status === 'deleted' || deletedFlashcardsAudit.has(c.id)
    );
  }

  /**
   * Retrieves archived flashcards.
   */
  static getArchivedFlashcards(): Flashcard[] {
    loadClientStorage();
    return Array.from(inMemoryFlashcards.values()).filter(
      (c) => c.status === 'archived' && !deletedFlashcardsAudit.has(c.id)
    );
  }

  /**
   * SOFT-DELETE A FLASHCARD
   * Records immutable audit trail and permanently removes card from active study flows.
   */
  static softDeleteFlashcard(id: string, reason = 'Admin Action', deletedBy = 'Admin User'): boolean {
    loadClientStorage();
    const card = inMemoryFlashcards.get(id);
    if (!card) return false;

    const auditMeta = {
      deletedAt: Date.now(),
      deletedBy,
      reason,
      sourceQuestionId: card.sourceQuestionId,
    };

    card.status = 'deleted';
    card.deletedAt = auditMeta.deletedAt;
    card.deletedBy = auditMeta.deletedBy;
    card.deletionReason = reason;

    deletedFlashcardsAudit.set(id, auditMeta);
    inMemoryFlashcards.set(id, card);

    const deletedRecord: Record<string, any> = {};
    deletedFlashcardsAudit.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryFlashcards.values()), deletedRecord);
    return true;
  }

  /**
   * BULK SOFT-DELETE FLASHCARDS
   */
  static bulkSoftDeleteFlashcards(ids: string[], reason = 'Bulk Admin Action', deletedBy = 'Admin User'): number {
    let count = 0;
    for (const id of ids) {
      if (this.softDeleteFlashcard(id, reason, deletedBy)) {
        count++;
      }
    }
    return count;
  }

  /**
   * EXPLICIT RESTORE OF A DELIBERATELY DELETED FLASHCARD
   */
  static restoreDeletedFlashcard(id: string): boolean {
    loadClientStorage();
    const card = inMemoryFlashcards.get(id);
    if (!card) return false;

    card.status = 'active';
    delete card.deletedAt;
    delete card.deletedBy;
    delete card.deletionReason;

    deletedFlashcardsAudit.delete(id);
    inMemoryFlashcards.set(id, card);

    const deletedRecord: Record<string, any> = {};
    deletedFlashcardsAudit.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryFlashcards.values()), deletedRecord);
    return true;
  }

  /**
   * ADDS OR CONVERTS A NEW FLASHCARD INTO THE REPOSITORY
   */
  static registerFlashcard(card: Flashcard): boolean {
    loadClientStorage();
    if (deletedFlashcardsAudit.has(card.id)) {
      return false; // Prevent automatic resurrection of deleted card
    }

    inMemoryFlashcards.set(card.id, {
      ...card,
      status: 'active',
    });

    const deletedRecord: Record<string, any> = {};
    deletedFlashcardsAudit.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryFlashcards.values()), deletedRecord);
    return true;
  }

  /**
   * Checks if a card ID is deleted.
   */
  static isDeleted(id: string): boolean {
    loadClientStorage();
    return deletedFlashcardsAudit.has(id);
  }

  /**
   * Checks if a flashcard created from a specific source question was deleted.
   */
  static isSourceQuestionFlashcardDeleted(sourceQuestionId: string): boolean {
    loadClientStorage();
    for (const meta of deletedFlashcardsAudit.values()) {
      if (meta.sourceQuestionId === sourceQuestionId) {
        return true;
      }
    }
    return false;
  }
}
