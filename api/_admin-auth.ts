import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const COOKIE = 'cms_admin';
const MAX_AGE = 8 * 60 * 60;

function configuredAdminEmail(): string {
  return String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

function signature(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET is not configured.');
  }
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createSession(email: string): string {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const allowedEmail = configuredAdminEmail();

  if (!normalizedEmail || !allowedEmail || normalizedEmail !== allowedEmail) {
    throw new Error('Administrator email is not configured or does not match.');
  }

  const payload = Buffer.from(JSON.stringify({
    email: normalizedEmail,
    expires: Date.now() + MAX_AGE * 1000,
    nonce: randomBytes(16).toString('hex')
  })).toString('base64url');

  return payload + '.' + signature(payload);
}

export function hasAdminSession(req: any): boolean {
  try {
    const allowedEmail = configuredAdminEmail();
    if (!allowedEmail) return false;

    const cookie = String(req.headers?.cookie || '')
      .split(';')
      .map((x: string) => x.trim())
      .find((x: string) => x.startsWith(COOKIE + '='));

    const token = cookie?.slice(COOKIE.length + 1) || '';
    const parts = token.split('.');

    if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return false;

    const expectedSignature = Buffer.from(signature(parts[0]), 'hex');
    const suppliedSignature = Buffer.from(parts[1], 'hex');
    if (expectedSignature.length !== suppliedSignature.length) return false;
    if (!timingSafeEqual(suppliedSignature, expectedSignature)) return false;

    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return (
      payload?.expires > Date.now() &&
      String(payload?.email || '').trim().toLowerCase() === allowedEmail
    );
  } catch {
    return false;
  }
}

export function sessionCookie(req: any, token: string): string {
  const secure = req.secure || req.headers?.['x-forwarded-proto'] === 'https';
  return COOKIE + '=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + (token ? MAX_AGE : 0) + (secure ? '; Secure' : '');
}
