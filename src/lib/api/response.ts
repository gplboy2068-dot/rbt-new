/**
 * Standard API Response Formatting Envelopes
 * Enforces unified /api/v1 JSON structures.
 */

import { AppError } from '../errors/app-error';

export interface ApiResponseMeta {
  requestId?: string;
  timestamp: number;
  version: string;
  [key: string]: any;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
    requestId?: string;
  };
  meta: ApiResponseMeta;
}

export function apiSuccess<T>(data: T, meta?: { requestId?: string; [key: string]: any }, status = 200): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: meta?.requestId,
      timestamp: Math.floor(Date.now() / 1000),
      version: 'v1',
      ...meta,
    },
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      ...(meta?.requestId ? { 'X-Request-Id': meta.requestId } : {}),
    },
  });
}

export function apiError(error: AppError | Error | string, requestId?: string): Response {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      isPublicSafe: false,
      requestId,
    });
  } else {
    appError = new AppError({
      code: 'BAD_REQUEST',
      message: error,
      requestId,
    });
  }

  const payload: ApiErrorResponse = {
    success: false,
    error: appError.toPublicJSON(),
    meta: {
      requestId: appError.requestId || requestId,
      timestamp: Math.floor(Date.now() / 1000),
      version: 'v1',
    },
  };

  return new Response(JSON.stringify(payload), {
    status: appError.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      ...(requestId ? { 'X-Request-Id': requestId } : {}),
    },
  });
}
