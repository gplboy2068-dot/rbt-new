/**
 * Application Configuration Module
 * Separates Public Configuration from Server-Only Configuration & Cloudflare Bindings.
 */

export interface PublicConfig {
  appName: string;
  appEnv: 'development' | 'preview' | 'production';
  siteUrl: string;
  apiVersion: string;
  isPublicOpenAccess: boolean;
}

export interface ServerConfig {
  jwtSecret: string;
  tokenExpirySeconds: number;
  rateLimitHourlyDefault: number;
  rateLimitDailyDefault: number;
}

export interface CloudflareEnvBindings {
  DB?: any; // Cloudflare D1 Database binding
  STORAGE_BUCKET?: any; // Cloudflare R2 Bucket binding
  EDGE_KV?: any; // Cloudflare KV Namespace binding
  JOBS_QUEUE?: any; // Cloudflare Queue binding
}

export const publicConfig: PublicConfig = {
  appName: 'RBT Practice Exam',
  appEnv: (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ? 'production' : 'development',
  siteUrl: (typeof process !== 'undefined' && process.env.PUBLIC_SITE_URL) || 'https://rbtpracticeexam.xyz',
  apiVersion: 'v1',
  isPublicOpenAccess: true,
};

export function getServerConfig(env?: Record<string, any>): ServerConfig {
  const jwtSecret = env?.ADMIN_JWT_SECRET || (typeof process !== 'undefined' ? process.env.ADMIN_JWT_SECRET : '') || 'rtb-default-dev-secret-key-2026';
  return {
    jwtSecret,
    tokenExpirySeconds: 8 * 3600, // 8 hours
    rateLimitHourlyDefault: 15,
    rateLimitDailyDefault: 50,
  };
}

export function validateConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!publicConfig.appName) issues.push('App name is not configured.');
  return {
    valid: issues.length === 0,
    issues,
  };
}
