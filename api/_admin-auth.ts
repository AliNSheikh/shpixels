import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'node:crypto';

const PASSWORD_SALT = '96e213ce331f903eb16dd2bf816266a1';
const PASSWORD_HASH = '5a4dfb5a87a3e65ad31c2401b12ef134e064d1cf9dc7ef67f32b7c38ab31199e893ec58b948863766fee5c42f6811e184bcfd8148e9b2475350dbf59a376d84b';
const COOKIE = 'cms_admin';
const MAX_AGE = 8 * 60 * 60;
export function passwordMatches(password: string): boolean {
  return timingSafeEqual(scryptSync(password, PASSWORD_SALT, 64), Buffer.from(PASSWORD_HASH, 'hex'));
}
function signature(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function createSession(): string {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + MAX_AGE * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return payload + '.' + signature(payload);
}
export function hasAdminSession(req: any): boolean {
  try {
    const cookie = String(req.headers?.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='));
    const token = cookie?.slice(COOKIE.length + 1) || '';
    const parts = token.split('.');
    if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return false;
    if (!timingSafeEqual(Buffer.from(parts[1], 'hex'), Buffer.from(signature(parts[0]), 'hex'))) return false;
    return JSON.parse(Buffer.from(parts[0], 'base64url').toString()).expires > Date.now();
  } catch { return false; }
}
export function sessionCookie(req: any, token: string): string {
  const secure = req.secure || req.headers?.['x-forwarded-proto'] === 'https';
  return COOKIE + '=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + (token ? MAX_AGE : 0) + (secure ? '; Secure' : '');
}
