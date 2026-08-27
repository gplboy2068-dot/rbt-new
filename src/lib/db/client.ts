/**
 * Cloudflare D1 Database Abstraction Layer
 * Provides typed queries, parameter binding, batch execution, and health ping.
 */

import { AppError } from '../errors/app-error';
import { Logger } from '../logger';

export interface QueryResult<T> {
  results: T[];
  success: boolean;
  meta: {
    durationMs?: number;
    changes?: number;
    lastRowId?: number;
    servedBy?: string;
  };
}

export class D1Client {
  private db: any;

  constructor(d1Binding?: any) {
    this.db = d1Binding;
  }

  /**
   * Check if D1 binding is initialized and responsive.
   */
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.db) {
      return { healthy: false, latencyMs: 0, error: 'D1 binding not attached' };
    }

    try {
      await this.db.prepare('SELECT 1 as ping').first();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      Logger.error('D1_HEALTH_CHECK_FAILED', err.message);
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  /**
   * Execute a single read query returning typed rows.
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.db) {
      throw new AppError({
        code: 'DATABASE_ERROR',
        message: 'D1 database binding is unavailable in current runtime.',
        statusCode: 500,
        isPublicSafe: false,
      });
    }

    const start = Date.now();
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const res = await stmt.all();
      return {
        results: res.results || [],
        success: res.success ?? true,
        meta: {
          durationMs: Date.now() - start,
          changes: res.meta?.changes,
          lastRowId: res.meta?.last_row_id,
        },
      };
    } catch (err: any) {
      Logger.error('D1_QUERY_ERROR', err.message, { context: { sql, params } });
      throw new AppError({
        code: 'DATABASE_ERROR',
        message: 'Database query execution failed.',
        statusCode: 500,
        isPublicSafe: false,
        cause: err,
      });
    }
  }

  /**
   * Execute a single row query.
   */
  async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.results[0] || null;
  }

  /**
   * Execute a batch of statements transactionally.
   */
  async batch(statements: Array<{ sql: string; params?: any[] }>): Promise<boolean> {
    if (!this.db) {
      throw new AppError({
        code: 'DATABASE_ERROR',
        message: 'D1 binding is unavailable.',
        isPublicSafe: false,
      });
    }

    try {
      const preparedList = statements.map((s) =>
        this.db.prepare(s.sql).bind(...(s.params || []))
      );
      await this.db.batch(preparedList);
      return true;
    } catch (err: any) {
      Logger.error('D1_BATCH_ERROR', err.message);
      throw new AppError({
        code: 'DATABASE_ERROR',
        message: 'Database transaction batch failed.',
        isPublicSafe: false,
        cause: err,
      });
    }
  }
}
