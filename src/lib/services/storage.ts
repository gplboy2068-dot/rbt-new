/**
 * Cloudflare R2 Storage Abstraction Service
 * Manages object upload, download, metadata, and deletion securely server-side.
 */

import { AppError } from '../errors/app-error';
import { Logger } from '../logger';

export interface StorageObjectMeta {
  key: string;
  size: number;
  etag: string;
  uploadedAt: Date;
  contentType?: string;
  customMetadata?: Record<string, string>;
}

export class R2StorageService {
  private bucket: any;

  constructor(r2Binding?: any) {
    this.bucket = r2Binding;
  }

  /**
   * Health check to test R2 bucket access.
   */
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    if (!this.bucket) {
      return { healthy: false, latencyMs: 0, error: 'R2 bucket binding not attached' };
    }

    try {
      await this.bucket.list({ limit: 1 });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      Logger.error('R2_HEALTH_CHECK_FAILED', err.message);
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  /**
   * Upload an object to R2.
   */
  async putObject(
    key: string,
    data: ArrayBuffer | Uint8Array | ReadableStream | string,
    options?: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<StorageObjectMeta> {
    if (!this.bucket) {
      throw new AppError({
        code: 'STORAGE_ERROR',
        message: 'R2 bucket binding is not attached in current environment.',
        isPublicSafe: false,
      });
    }

    try {
      const res = await this.bucket.put(key, data, {
        httpMetadata: {
          contentType: options?.contentType || 'application/octet-stream',
        },
        customMetadata: options?.customMetadata,
      });

      return {
        key: res.key,
        size: res.size,
        etag: res.etag,
        uploadedAt: res.uploaded,
        contentType: res.httpMetadata?.contentType,
        customMetadata: res.customMetadata,
      };
    } catch (err: any) {
      Logger.error('R2_PUT_FAILED', err.message, { context: { key } });
      throw new AppError({
        code: 'STORAGE_ERROR',
        message: 'Failed to upload object to R2.',
        isPublicSafe: false,
        cause: err,
      });
    }
  }

  /**
   * Retrieve an object from R2.
   */
  async getObject(key: string): Promise<{ body: ReadableStream; metadata: StorageObjectMeta } | null> {
    if (!this.bucket) return null;

    try {
      const obj = await this.bucket.get(key);
      if (!obj) return null;

      return {
        body: obj.body,
        metadata: {
          key: obj.key,
          size: obj.size,
          etag: obj.etag,
          uploadedAt: obj.uploaded,
          contentType: obj.httpMetadata?.contentType,
          customMetadata: obj.customMetadata,
        },
      };
    } catch (err: any) {
      Logger.error('R2_GET_FAILED', err.message, { context: { key } });
      return null;
    }
  }

  /**
   * Delete an object from R2.
   */
  async deleteObject(key: string): Promise<boolean> {
    if (!this.bucket) return false;

    try {
      await this.bucket.delete(key);
      return true;
    } catch (err: any) {
      Logger.error('R2_DELETE_FAILED', err.message, { context: { key } });
      return false;
    }
  }
}
