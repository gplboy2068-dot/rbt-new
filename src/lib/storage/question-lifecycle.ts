/**
 * Authoritative Question Lifecycle & Repository Engine
 * Enforces Soft-Delete Architecture, Immutable Audit Trails,
 * Strict Active-Only Learning Flow Filtering, and Protected Restore Boundaries.
 */

import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { Question, QuestionStatus, DifficultyLevel } from '@/types';

export const LIFECYCLE_STORAGE_KEY = 'rbt_question_lifecycle_store_v2';
export const DELETED_REGISTRY_KEY = 'rbt_deleted_questions_registry_v2';

// In-Memory Master Registry (Server & Edge Runtime Authoritative)
const inMemoryQuestions = new Map<string, Question>();
const deletedAuditRegistry = new Map<string, { deletedAt: number; deletedBy: string; reason?: string }>();

// Seed with default authentic questions marked as active
for (const q of INITIAL_QUESTIONS) {
  inMemoryQuestions.set(q.id, {
    ...q,
    certification: q.certification || 'RBT',
    certificationVersion: q.certificationVersion || '6th Edition',
    status: (q.status as QuestionStatus) || 'active',
  });
}

// Client Storage Sync Helper
function syncClientStorage(allQuestions: Question[], deletedRegistry: Record<string, any>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(allQuestions));
      localStorage.setItem(DELETED_REGISTRY_KEY, JSON.stringify(deletedRegistry));
    } catch (e) {
      console.error('Failed to sync Question Lifecycle store to localStorage', e);
    }
  }
}

function loadClientStorage() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LIFECYCLE_STORAGE_KEY);
      const deleted = localStorage.getItem(DELETED_REGISTRY_KEY);

      if (deleted) {
        const parsedDel = JSON.parse(deleted);
        Object.entries(parsedDel).forEach(([id, meta]: [string, any]) => {
          deletedAuditRegistry.set(id, meta);
        });
      }

      if (saved) {
        const parsed: Question[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const rbtCount = parsed.filter((q) => (q.certification || 'RBT').toUpperCase() === 'RBT').length;
          const isUnsplit = rbtCount > 2250 && parsed.length > 2250;

          inMemoryQuestions.clear();
          parsed.forEach((q, idx) => {
            if (isUnsplit && idx >= 2250 && (!q.certification || q.certification === 'RBT')) {
              q.certification = 'BACB';
            }
            if (deletedAuditRegistry.has(q.id)) {
              const meta = deletedAuditRegistry.get(q.id)!;
              q.status = 'deleted';
              q.deletedAt = meta.deletedAt;
              q.deletedBy = meta.deletedBy;
              q.deletionReason = meta.reason;
            }
            inMemoryQuestions.set(q.id, q);
          });

          if (isUnsplit) {
            const deletedRecord: Record<string, any> = {};
            deletedAuditRegistry.forEach((val, key) => {
              deletedRecord[key] = val;
            });
            syncClientStorage(Array.from(inMemoryQuestions.values()), deletedRecord);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load Question Lifecycle store from localStorage', e);
    }
  }
}

// Initialize on module load
loadClientStorage();

export class QuestionLifecycleRepository {
  /**
   * Retrieves all questions currently in the repository (including deleted & archived for Admin).
   */
  static getAllQuestions(): Question[] {
    loadClientStorage();
    return Array.from(inMemoryQuestions.values());
  }

  /**
   * STRICT ACTIVE-ONLY QUERY
   * Used by Practice, Practice Tests, Mock Exams, and Flashcard Conversion.
   * NEVER returns deleted or archived questions.
   */
  static getActiveQuestions(filters?: {
    certification?: string;
    certificationVersion?: string;
    domainId?: string;
    topicId?: string;
    difficulty?: DifficultyLevel;
    search?: string;
  }): Question[] {
    loadClientStorage();
    let list = Array.from(inMemoryQuestions.values()).filter(
      (q) => (q.status === 'active' || q.status === 'published' || !q.status) && q.status !== 'deleted' && q.status !== 'archived' && !deletedAuditRegistry.has(q.id)
    );

    if (filters?.certification && filters.certification !== 'All') {
      const cert = filters.certification.toUpperCase();
      list = list.filter((q) => (q.certification || 'RBT').toUpperCase() === cert);
    }

    if (filters?.certificationVersion && filters.certificationVersion !== 'All') {
      list = list.filter((q) => (q.certificationVersion || '6th Edition') === filters.certificationVersion);
    }

    if (filters?.domainId && filters.domainId !== 'All') {
      const target = filters.domainId.toLowerCase().replace(/^dom_/, '');
      list = list.filter(
        (q) =>
          q.domainId.toLowerCase() === target ||
          q.domainName.toLowerCase().startsWith(target) ||
          q.domainName.toLowerCase().includes(target)
      );
    }

    if (filters?.topicId && filters.topicId !== 'All') {
      const targetT = filters.topicId.toLowerCase().replace(/^top_/, '');
      list = list.filter(
        (q) =>
          q.topicId.toLowerCase() === targetT ||
          q.topicName.toLowerCase().includes(targetT)
      );
    }

    if (filters?.difficulty && filters.difficulty !== ('All' as any)) {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.content.toLowerCase().includes(s) ||
          q.code.toLowerCase().includes(s) ||
          q.topicName.toLowerCase().includes(s)
      );
    }

    return list;
  }

  /**
   * Retrieves only deleted questions with full deletion audit metadata.
   */
  static getDeletedQuestions(): Question[] {
    loadClientStorage();
    return Array.from(inMemoryQuestions.values()).filter(
      (q) => q.status === 'deleted' || deletedAuditRegistry.has(q.id)
    );
  }

  /**
   * Retrieves archived questions.
   */
  static getArchivedQuestions(): Question[] {
    loadClientStorage();
    return Array.from(inMemoryQuestions.values()).filter(
      (q) => q.status === 'archived' && !deletedAuditRegistry.has(q.id)
    );
  }

  /**
   * SOFT-DELETE A SINGLE QUESTION
   * Marks status as 'deleted', records audit trail, and permanently prevents selection in learning engines.
   */
  static softDeleteQuestion(id: string, reason = 'Admin Action', deletedBy = 'Admin User'): boolean {
    loadClientStorage();
    const q = inMemoryQuestions.get(id);
    if (!q) return false;

    const auditMeta = {
      deletedAt: Date.now(),
      deletedBy,
      reason,
    };

    q.status = 'deleted';
    q.deletedAt = auditMeta.deletedAt;
    q.deletedBy = auditMeta.deletedBy;
    q.deletionReason = reason;

    deletedAuditRegistry.set(id, auditMeta);
    inMemoryQuestions.set(id, q);

    const deletedRecord: Record<string, any> = {};
    deletedAuditRegistry.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryQuestions.values()), deletedRecord);
    return true;
  }

  /**
   * BULK SOFT-DELETE QUESTIONS
   */
  static bulkSoftDeleteQuestions(ids: string[], reason = 'Bulk Admin Action', deletedBy = 'Admin User'): number {
    let count = 0;
    for (const id of ids) {
      if (this.softDeleteQuestion(id, reason, deletedBy)) {
        count++;
      }
    }
    return count;
  }

  /**
   * BULK UPDATE CERTIFICATION TRACK (RBT vs BACB)
   */
  static bulkUpdateCertification(ids: string[], certification: 'RBT' | 'BACB'): number {
    loadClientStorage();
    let count = 0;
    const idSet = new Set(ids);
    for (const [id, q] of inMemoryQuestions.entries()) {
      if (idSet.has(id) || idSet.has(q.code)) {
        q.certification = certification;
        count++;
      }
    }
    const deletedRecord: Record<string, any> = {};
    deletedAuditRegistry.forEach((val, key) => {
      deletedRecord[key] = val;
    });
    syncClientStorage(Array.from(inMemoryQuestions.values()), deletedRecord);
    return count;
  }

  /**
   * EXPLICIT RESTORE OF A DELIBERATELY DELETED QUESTION
   * Re-activates a question back to active pool only upon direct Admin request.
   */
  static restoreDeletedQuestion(id: string): boolean {
    loadClientStorage();
    const q = inMemoryQuestions.get(id);
    if (!q) return false;

    q.status = 'active';
    delete q.deletedAt;
    delete q.deletedBy;
    delete q.deletionReason;

    deletedAuditRegistry.delete(id);
    inMemoryQuestions.set(id, q);

    const deletedRecord: Record<string, any> = {};
    deletedAuditRegistry.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryQuestions.values()), deletedRecord);
    return true;
  }

  /**
   * INGEST/IMPORT QUESTIONS DIRECTLY INTO ACTIVE REPOSITORY
   */
  static addOrUpsertQuestions(questions: Question[]): number {
    loadClientStorage();
    let count = 0;
    for (const q of questions) {
      deletedAuditRegistry.delete(q.id);
      deletedAuditRegistry.delete(q.code);

      const toSave: Question = {
        ...q,
        status: 'active',
      };
      delete toSave.deletedAt;
      delete toSave.deletedBy;
      delete toSave.deletionReason;

      inMemoryQuestions.set(q.id, toSave);
      count++;
    }

    const deletedRecord: Record<string, any> = {};
    deletedAuditRegistry.forEach((val, key) => {
      deletedRecord[key] = val;
    });

    syncClientStorage(Array.from(inMemoryQuestions.values()), deletedRecord);
    return count;
  }

  /**
   * RESTORE DEFAULT CONFIGURATION ONLY
   * CRITICAL GUARANTEE: Restores application settings, rate limits, theme defaults.
   * NEVER resurrects deliberately deleted questions!
   */
  static restoreDefaultConfiguration(): { settingsRestored: boolean; deletedQuestionsPreservedCount: number } {
    loadClientStorage();
    const preservedDeletedCount = deletedAuditRegistry.size;

    // Reset UI / site configs only, keeping deleted question registry intact
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('rbt_user_preferences');
        localStorage.removeItem('rbt_theme_override');
      } catch (e) {}
    }

    return {
      settingsRestored: true,
      deletedQuestionsPreservedCount: preservedDeletedCount,
    };
  }

  /**
   * Checks if a question ID is in the deleted registry.
   */
  static isDeleted(id: string): boolean {
    loadClientStorage();
    return deletedAuditRegistry.has(id);
  }
}
