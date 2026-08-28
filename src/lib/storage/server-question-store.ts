/**
 * Cloudflare Edge KV & D1 Optimized Server-Authoritative Question Store
 * Ultra-fast in-memory caching with single-write batching to prevent Cloudflare 1102 CPU/Subrequest limits.
 */

import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { Question, QuestionStatus } from '@/types';

const KV_QUESTIONS_KEY = 'rbt_questions_master_dataset_v3';
const KV_DELETED_KEY = 'rbt_questions_deleted_registry_v3';
const KV_INITIALIZED_KEY = 'rbt_questions_initialized_flag_v3';

let memoryQuestions: Map<string, Question> = new Map();
let memoryDeletedRegistry: Map<string, { deletedAt: number; deletedBy: string; reason?: string }> = new Map();
let isInitialized = false;
let lastKVLoadTime = 0;
const KV_CACHE_TTL_MS = 15000; // 15 seconds memory cache per isolate

export function seedInitialDataOnce() {
  if (!isInitialized && memoryQuestions.size === 0 && memoryDeletedRegistry.size === 0) {
    for (const q of INITIAL_QUESTIONS) {
      memoryQuestions.set(q.id, {
        ...q,
        certification: q.certification || 'RBT',
        certificationVersion: q.certificationVersion || '6th Edition',
        status: (q.status as QuestionStatus) || 'active',
      });
    }
    isInitialized = true;
  }
}

seedInitialDataOnce();

export class ServerQuestionStore {
  private static getKV(locals?: any): any {
    if (locals?.runtime?.env?.EDGE_KV) return locals.runtime.env.EDGE_KV;
    if ((globalThis as any).EDGE_KV) return (globalThis as any).EDGE_KV;
    if ((globalThis as any).process?.env?.EDGE_KV) return (globalThis as any).process.env.EDGE_KV;
    return null;
  }

  /**
   * Fast load with isolate memory caching.
   */
  static async loadMasterState(locals?: any, force = false): Promise<void> {
    const now = Date.now();
    if (!force && lastKVLoadTime > 0 && now - lastKVLoadTime < KV_CACHE_TTL_MS) {
      return; // Use hot in-memory cache
    }

    const kv = this.getKV(locals);
    if (kv) {
      try {
        const [rawDel, rawQuestions, initializedFlag] = await Promise.all([
          kv.get(KV_DELETED_KEY, 'json'),
          kv.get(KV_QUESTIONS_KEY, 'json'),
          kv.get(KV_INITIALIZED_KEY),
        ]);

        if (rawDel && typeof rawDel === 'object') {
          memoryDeletedRegistry.clear();
          Object.entries(rawDel).forEach(([id, meta]: [string, any]) => {
            memoryDeletedRegistry.set(id, meta);
          });
        }

        if (initializedFlag === 'true' && Array.isArray(rawQuestions)) {
          const rbtCount = rawQuestions.filter((q) => (q.certification || 'RBT').toUpperCase() === 'RBT').length;
          const isUnsplit = rbtCount > 2250 && rawQuestions.length > 2250;

          memoryQuestions.clear();
          rawQuestions.forEach((q: Question, idx: number) => {
            if (isUnsplit && idx >= 2250 && (!q.certification || q.certification === 'RBT')) {
              q.certification = 'BACB';
            }
            if (memoryDeletedRegistry.has(q.id)) {
              const meta = memoryDeletedRegistry.get(q.id)!;
              q.status = 'deleted';
              q.deletedAt = meta.deletedAt;
              q.deletedBy = meta.deletedBy;
              q.deletionReason = meta.reason;
            }
            memoryQuestions.set(q.id, q);
          });
        }
        lastKVLoadTime = now;
      } catch (e) {
        console.error('Failed to read from Cloudflare EDGE_KV', e);
      }
    }
  }

  /**
   * Single-write batch persistence.
   */
  static async saveMasterState(locals?: any): Promise<boolean> {
    lastKVLoadTime = Date.now();
    const kv = this.getKV(locals);
    if (!kv) return true;

    const questionsList = Array.from(memoryQuestions.values());
    const delObj: Record<string, any> = {};
    memoryDeletedRegistry.forEach((val, key) => {
      delObj[key] = val;
    });

    try {
      await Promise.all([
        kv.put(KV_INITIALIZED_KEY, 'true'),
        kv.put(KV_QUESTIONS_KEY, JSON.stringify(questionsList)),
        kv.put(KV_DELETED_KEY, JSON.stringify(delObj)),
      ]);
      return true;
    } catch (e) {
      console.error('Failed to write to Cloudflare EDGE_KV', e);
      return false;
    }
  }

  static async getActiveQuestions(
    filters?: {
      certification?: string;
      certificationVersion?: string;
      domainCode?: string;
      topicCode?: string;
      difficulty?: string;
      search?: string;
    },
    locals?: any
  ): Promise<Question[]> {
    await this.loadMasterState(locals);

    let list = Array.from(memoryQuestions.values()).filter(
      (q) =>
        (q.status === 'active' || q.status === 'published' || !q.status) &&
        q.status !== 'deleted' &&
        q.status !== 'archived' &&
        !memoryDeletedRegistry.has(q.id)
    );

    if (filters?.certification && filters.certification !== 'All') {
      const targetCert = filters.certification.toUpperCase();
      list = list.filter((q) => (q.certification || 'RBT').toUpperCase() === targetCert);
    }

    if (filters?.certificationVersion && filters.certificationVersion !== 'All') {
      list = list.filter((q) => (q.certificationVersion || '6th Edition') === filters.certificationVersion);
    }

    if (filters?.domainCode && filters.domainCode !== 'All') {
      list = list.filter((q) => q.domainName.includes(filters.domainCode!));
    }

    if (filters?.topicCode && filters.topicCode !== 'All') {
      list = list.filter((q) => q.topicName.includes(filters.topicCode!));
    }

    if (filters?.difficulty && filters.difficulty !== 'All') {
      list = list.filter((q) => q.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
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

  static async getDeletedQuestions(locals?: any): Promise<Question[]> {
    await this.loadMasterState(locals);
    return Array.from(memoryQuestions.values()).filter(
      (q) => q.status === 'deleted' || memoryDeletedRegistry.has(q.id)
    );
  }

  static async getAllQuestions(locals?: any): Promise<Question[]> {
    await this.loadMasterState(locals);
    return Array.from(memoryQuestions.values());
  }

  static async softDeleteQuestion(
    id: string,
    reason = 'Admin Action',
    deletedBy = 'Admin User',
    locals?: any
  ): Promise<boolean> {
    await this.loadMasterState(locals);

    let q = memoryQuestions.get(id);
    if (!q) {
      for (const item of memoryQuestions.values()) {
        if (item.code === id) {
          q = item;
          id = item.id;
          break;
        }
      }
    }

    if (!q) return false;

    const audit = {
      deletedAt: Date.now(),
      deletedBy,
      reason,
    };

    q.status = 'deleted';
    q.deletedAt = audit.deletedAt;
    q.deletedBy = audit.deletedBy;
    q.deletionReason = reason;

    memoryDeletedRegistry.set(id, audit);
    memoryQuestions.set(id, q);

    await this.saveMasterState(locals);
    return true;
  }

  /**
   * BATCH BULK DELETE: Mutates in memory and writes to KV ONLY ONCE.
   */
  static async bulkSoftDeleteQuestions(
    ids: string[],
    reason = 'Bulk Admin Action',
    deletedBy = 'Admin User',
    locals?: any
  ): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;
    const now = Date.now();

    for (const rawId of ids) {
      let id = rawId;
      let q = memoryQuestions.get(id);
      if (!q) {
        for (const item of memoryQuestions.values()) {
          if (item.code === id) {
            q = item;
            id = item.id;
            break;
          }
        }
      }

      if (q) {
        const audit = {
          deletedAt: now,
          deletedBy,
          reason,
        };

        q.status = 'deleted';
        q.deletedAt = audit.deletedAt;
        q.deletedBy = audit.deletedBy;
        q.deletionReason = reason;

        memoryDeletedRegistry.set(id, audit);
        memoryQuestions.set(id, q);
        count++;
      }
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  /**
   * BATCH BULK CERTIFICATION UPDATE (RBT vs BACB)
   */
  static async bulkUpdateCertification(
    ids: string[],
    certification: 'RBT' | 'BACB',
    locals?: any
  ): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;
    const idSet = new Set(ids);

    for (const [id, q] of memoryQuestions.entries()) {
      if (idSet.has(id) || idSet.has(q.code)) {
        q.certification = certification;
        memoryQuestions.set(id, q);
        count++;
      }
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  /**
   * PURGE ALL: Mutates in memory and writes to KV ONLY ONCE.
   */
  static async purgeAllQuestions(locals?: any): Promise<number> {
    await this.loadMasterState(locals);
    const count = memoryQuestions.size;
    const now = Date.now();
    
    for (const [id, q] of memoryQuestions.entries()) {
      q.status = 'deleted';
      q.deletedAt = now;
      q.deletedBy = 'Admin';
      q.deletionReason = 'Admin Purge All Questions';
      memoryDeletedRegistry.set(id, {
        deletedAt: now,
        deletedBy: 'Admin',
        reason: q.deletionReason,
      });
    }

    await this.saveMasterState(locals);
    return count;
  }

  /**
   * BATCH RESTORE: Mutates in memory and writes to KV ONLY ONCE.
   */
  static async restoreQuestionsBatch(ids: string[], locals?: any): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;

    for (const rawId of ids) {
      let id = rawId;
      let q = memoryQuestions.get(id);
      if (!q) {
        for (const item of memoryQuestions.values()) {
          if (item.code === id) {
            q = item;
            id = item.id;
            break;
          }
        }
      }

      if (q) {
        q.status = 'active';
        delete q.deletedAt;
        delete q.deletedBy;
        delete q.deletionReason;

        memoryDeletedRegistry.delete(id);
        memoryQuestions.set(id, q);
        count++;
      }
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  static async restoreDeletedQuestion(id: string, locals?: any): Promise<boolean> {
    const count = await this.restoreQuestionsBatch([id], locals);
    return count > 0;
  }

  /**
   * INGEST/IMPORT QUESTIONS DIRECTLY INTO CENTRAL DATABASE: Writes to KV ONLY ONCE.
   */
  static async addOrUpsertQuestions(questions: Question[], locals?: any): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;

    for (const q of questions) {
      memoryDeletedRegistry.delete(q.id);
      memoryDeletedRegistry.delete(q.code);

      const toSave: Question = {
        ...q,
        status: 'active',
      };
      delete toSave.deletedAt;
      delete toSave.deletedBy;
      delete toSave.deletionReason;

      memoryQuestions.set(q.id, toSave);
      count++;
    }

    await this.saveMasterState(locals);
    return count;
  }

  static async isDeleted(id: string, locals?: any): Promise<boolean> {
    await this.loadMasterState(locals);
    return memoryDeletedRegistry.has(id);
  }
}
