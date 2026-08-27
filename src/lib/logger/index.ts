/**
 * Structured Server-Side Logger
 * Supports levels: info, warn, error, critical
 * Redacts sensitive keys (passwords, tokens, API keys, session secrets)
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  message: string;
  requestId?: string;
  route?: string;
  errorCode?: string;
  context?: Record<string, any>;
}

const REDACTED_KEYS = new Set([
  'password',
  'password_hash',
  'jwt_secret',
  'admin_jwt_secret',
  'api_key',
  'secret',
  'token',
  'authorization',
  'cookie',
]);

function sanitizeContext(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      sanitized[key] = sanitizeContext(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export class Logger {
  private static writeLog(level: LogLevel, event: string, message: string, meta?: { requestId?: string; route?: string; errorCode?: string; context?: Record<string, any> }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      message,
      requestId: meta?.requestId,
      route: meta?.route,
      errorCode: meta?.errorCode,
      context: meta?.context ? sanitizeContext(meta.context) : undefined,
    };

    const formatted = JSON.stringify(entry);
    if (level === 'error' || level === 'critical') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  static info(event: string, message: string, meta?: { requestId?: string; route?: string; context?: Record<string, any> }) {
    this.writeLog('info', event, message, meta);
  }

  static warn(event: string, message: string, meta?: { requestId?: string; route?: string; errorCode?: string; context?: Record<string, any> }) {
    this.writeLog('warn', event, message, meta);
  }

  static error(event: string, message: string, meta?: { requestId?: string; route?: string; errorCode?: string; context?: Record<string, any> }) {
    this.writeLog('error', event, message, meta);
  }

  static critical(event: string, message: string, meta?: { requestId?: string; route?: string; errorCode?: string; context?: Record<string, any> }) {
    this.writeLog('critical', event, message, meta);
  }
}
