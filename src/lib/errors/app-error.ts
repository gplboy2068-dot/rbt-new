/**
 * Centralized Application Error Hierarchy
 * Standardizes API and server errors with public-safe messaging and internal codes.
 */

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export interface ErrorDetail {
  field?: string;
  issue: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isPublicSafe: boolean;
  public readonly details?: ErrorDetail[];
  public readonly requestId?: string;

  constructor(params: {
    code: ErrorCode;
    message: string;
    statusCode?: number;
    isPublicSafe?: boolean;
    details?: ErrorDetail[];
    requestId?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.statusCode = params.statusCode || AppError.getDefaultStatusCode(params.code);
    this.isPublicSafe = params.isPublicSafe ?? true;
    this.details = params.details;
    this.requestId = params.requestId;

    if (params.cause) {
      this.cause = params.cause;
    }
  }

  private static getDefaultStatusCode(code: ErrorCode): number {
    switch (code) {
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
        return 400;
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'CONFLICT':
        return 409;
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      case 'DATABASE_ERROR':
      case 'STORAGE_ERROR':
      case 'AI_PROVIDER_ERROR':
      case 'INTERNAL_SERVER_ERROR':
      default:
        return 500;
    }
  }

  toPublicJSON() {
    return {
      code: this.code,
      message: this.isPublicSafe ? this.message : 'An internal system error occurred. Please try again.',
      details: this.details,
      requestId: this.requestId,
    };
  }
}
