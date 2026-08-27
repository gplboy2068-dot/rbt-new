/**
 * Cloudflare Edge KV & D1 Optimized Server-Authoritative Flashcard Store
 * Memory caching and single-write batching to eliminate Cloudflare 1102 CPU/Subrequest limits.
 */

import { INITIAL_FLASHCARDS } from '@/data/mock-data';
import { Flashcard } from '@/types';

const KV_FLASHCARDS_KEY = 'rbt_flashcards_master_dataset_v3';
const KV_DELETED_FLASHCARDS_KEY = 'rbt_flashcards_deleted_registry_v3';
const KV_INITIALIZED_KEY = 'rbt_flashcards_initialized_v3';

let memoryCards: Map<string, Flashcard> = new Map();
let memoryDeletedRegistry: Map<string, { deletedAt: number; deletedBy: string; reason?: string }> = new Map();
let isInitialized = false;
let lastKVLoadTime = 0;
const KV_CACHE_TTL_MS = 15000;

export function seedInitialFlashcardsOnce() {
  if (!isInitialized && memoryCards.size === 0) {
    for (const fc of INITIAL_FLASHCARDS) {
      memoryCards.set(fc.id, {
        ...fc,
        certification: fc.certification || 'RBT',
        certificationVersion: fc.certificationVersion || '6th Edition',
        status: 'active',
      });
    }
    isInitialized = true;
  }
}

seedInitialFlashcardsOnce();

export class ServerFlashcardStore {
  private static getKV(locals?: any): any {
    if (locals?.runtime?.env?.EDGE_KV) return locals.runtime.env.EDGE_KV;
    if ((globalThis as any).EDGE_KV) return (globalThis as any).EDGE_KV;
    if ((globalThis as any).process?.env?.EDGE_KV) return (globalThis as any).process.env.EDGE_KV;
    return null;
  }

  static async loadMasterState(locals?: any, force = false): Promise<void> {
    const now = Date.now();
    if (!force && lastKVLoadTime > 0 && now - lastKVLoadTime < KV_CACHE_TTL_MS) {
      return;
    }

    const kv = this.getKV(locals);
    if (kv) {
      try {
        const [rawDel, rawCards, initializedFlag] = await Promise.all([
          kv.get(KV_DELETED_FLASHCARDS_KEY, 'json'),
          kv.get(KV_FLASHCARDS_KEY, 'json'),
          kv.get(KV_INITIALIZED_KEY),
        ]);

        if (rawDel && typeof rawDel === 'object') {
          memoryDeletedRegistry.clear();
          Object.entries(rawDel).forEach(([id, meta]: [string, any]) => {
            memoryDeletedRegistry.set(id, meta);
          });
        }

        if (initializedFlag === 'true' && Array.isArray(rawCards)) {
          memoryCards.clear();
          rawCards.forEach((c: Flashcard) => {
            if (memoryDeletedRegistry.has(c.id)) {
              const meta = memoryDeletedRegistry.get(c.id)!;
              c.status = 'deleted';
              c.deletedAt = meta.deletedAt;
              c.deletedBy = meta.deletedBy;
              c.deletionReason = meta.reason;
            }
            memoryCards.set(c.id, c);
          });
        }
        lastKVLoadTime = now;
      } catch (e) {
        console.error('Failed to read flashcards from Cloudflare EDGE_KV', e);
      }
    }
  }

  static async saveMasterState(locals?: any): Promise<boolean> {
    lastKVLoadTime = Date.now();
    const kv = this.getKV(locals);
    if (!kv) return true;

    const cardsList = Array.from(memoryCards.values());
    const delObj: Record<string, any> = {};
    memoryDeletedRegistry.forEach((val, key) => {
      delObj[key] = val;
    });

    try {
      await Promise.all([
        kv.put(KV_INITIALIZED_KEY, 'true'),
        kv.put(KV_FLASHCARDS_KEY, JSON.stringify(cardsList)),
        kv.put(KV_DELETED_FLASHCARDS_KEY, JSON.stringify(delObj)),
      ]);
      return true;
    } catch (e) {
      console.error('Failed to write flashcards to Cloudflare EDGE_KV', e);
      return false;
    }
  }

  static async getActiveFlashcards(
    filters?: { domain?: string; certification?: string; search?: string },
    locals?: any
  ): Promise<Flashcard[]> {
    await this.loadMasterState(locals);

    let list = Array.from(memoryCards.values()).filter(
      (c) => (c.status === 'active' || !c.status) && c.status !== 'deleted' && c.status !== 'archived' && !memoryDeletedRegistry.has(c.id)
    );

    if (filters?.domain && filters.domain !== 'All') {
      const d = filters.domain.toLowerCase();
      list = list.filter((c) => c.domain.toLowerCase().includes(d));
    }

    if (filters?.certification && filters.certification !== 'All') {
      const cert = filters.certification.toUpperCase();
      list = list.filter((c) => (c.certification || 'RBT').toUpperCase() === cert);
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

  static async getAllFlashcards(locals?: any): Promise<Flashcard[]> {
    await this.loadMasterState(locals);
    return Array.from(memoryCards.values());
  }

  static async getDeletedFlashcards(locals?: any): Promise<Flashcard[]> {
    await this.loadMasterState(locals);
    return Array.from(memoryCards.values()).filter(
      (c) => c.status === 'deleted' || memoryDeletedRegistry.has(c.id)
    );
  }

  static async addOrUpsertFlashcards(newCards: Flashcard[], locals?: any): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;

    for (const card of newCards) {
      memoryDeletedRegistry.delete(card.id);
      if (card.sourceQuestionId) {
        memoryDeletedRegistry.delete(card.sourceQuestionId);
      }

      const toSave: Flashcard = {
        ...card,
        status: 'active',
      };
      delete toSave.deletedAt;
      delete toSave.deletedBy;
      delete toSave.deletionReason;

      memoryCards.set(card.id, toSave);
      count++;
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  static async softDeleteFlashcardsBatch(
    ids: string[],
    reason = 'Admin Action',
    deletedBy = 'Admin',
    locals?: any
  ): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;
    const now = Date.now();

    for (const id of ids) {
      const card = memoryCards.get(id);
      if (card) {
        const audit = {
          deletedAt: now,
          deletedBy,
          reason,
        };

        card.status = 'deleted';
        card.deletedAt = audit.deletedAt;
        card.deletedBy = audit.deletedBy;
        card.deletionReason = reason;

        memoryDeletedRegistry.set(id, audit);
        if (card.sourceQuestionId) {
          memoryDeletedRegistry.set(card.sourceQuestionId, audit);
        }
        memoryCards.set(id, card);
        count++;
      }
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  static async softDeleteFlashcard(
    id: string,
    reason = 'Admin Action',
    deletedBy = 'Admin',
    locals?: any
  ): Promise<boolean> {
    const count = await this.softDeleteFlashcardsBatch([id], reason, deletedBy, locals);
    return count > 0;
  }

  static async restoreFlashcardsBatch(ids: string[], locals?: any): Promise<number> {
    await this.loadMasterState(locals);
    let count = 0;

    for (const id of ids) {
      const card = memoryCards.get(id);
      if (card) {
        card.status = 'active';
        delete card.deletedAt;
        delete card.deletedBy;
        delete card.deletionReason;

        memoryDeletedRegistry.delete(id);
        if (card.sourceQuestionId) {
          memoryDeletedRegistry.delete(card.sourceQuestionId);
        }
        memoryCards.set(id, card);
        count++;
      }
    }

    if (count > 0) {
      await this.saveMasterState(locals);
    }
    return count;
  }

  static async restoreFlashcard(id: string, locals?: any): Promise<boolean> {
    const count = await this.restoreFlashcardsBatch([id], locals);
    return count > 0;
  }
}
