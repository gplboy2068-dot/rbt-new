export interface AdminTokenPayload {
  username: string;
  role: string;
  iat: number;
  exp: number;
}



/**
 * Resolve the admin JWT secret from an explicit argument or the server
 * environment (Cloudflare Worker secret / Node env).
 * There is intentionally NO hard-coded fallback secret: if this is not
 * configured, signing fails closed and verification rejects every token.
 */
export function resolveAdminJwtSecret(secret?: string, locals?: any): string {
  if (secret) return secret;
  const runtimeEnv = locals?.runtime?.env || locals?.env || (globalThis as any).__ADMIN_ENV__;
  if (runtimeEnv?.ADMIN_JWT_SECRET) return String(runtimeEnv.ADMIN_JWT_SECRET);
  if (typeof process !== 'undefined' && process.env?.ADMIN_JWT_SECRET) return process.env.ADMIN_JWT_SECRET;
  return '';
}

async function importHmacKey(secret: string, usage: 'sign' | 'verify') {
  const resolved = resolveAdminJwtSecret(secret);
  if (!resolved) {
    throw new Error('ADMIN_JWT_SECRET is not configured on the server.');
  }
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(resolved), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

/**
 * Signs an Admin JWT using Web Crypto API (Cloudflare Workers compatible).
 */
export async function signAdminToken(username: string, secret?: string, locals?: any): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    username,
    role: 'admin',
    iat: now,
    exp: now + 8 * 3600, // 8 hours
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await importHmacKey(resolveAdminJwtSecret(secret, locals), 'sign');

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const signatureArray = Array.from(new Uint8Array(signature));
  const binarySignature = String.fromCharCode(...signatureArray);
  const encodedSignature = base64UrlEncode(binarySignature);

  return `${data}.${encodedSignature}`;
}

/**
 * Verifies an Admin JWT using Web Crypto API.
 */
export async function verifyAdminToken(token: string, secret?: string, locals?: any): Promise<AdminTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const resolvedSecret = resolveAdminJwtSecret(secret, locals);
    if (!resolvedSecret) return null;
    const key = await importHmacKey(resolvedSecret, 'verify');

    const binarySignature = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, enc.encode(data));
    if (!isValid) return null;

    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: AdminTokenPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
