/**
 * Server-Side Supabase Client & Database Utility
 * Exclusively used by Serverless API routes (Vercel) and development server.
 * 
 * Uses SUPABASE_SERVICE_ROLE_KEY (if present) for privileged admin writes,
 * or falls back to SUPABASE_ANON_KEY.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getServerSupabase(): { client: SupabaseClient | null; error?: string } {
<<<<<<< HEAD
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://bzfxervcwhvoxpvfsnec.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { client: null, error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be defined' };
=======
  // NOTE: no hardcoded fallback URL/key here on purpose. If these env vars are
  // missing, every API route must fail loudly with a clear "not configured"
  // error rather than silently connecting to an unrelated Supabase project.
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { client: null, error: 'Server is missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables. Set them in your Vercel Project Settings → Environment Variables, then redeploy.' };
>>>>>>> 85bd45e (claude commit)
  }

  try {
    const client = createClient(url.trim().replace(/\/$/, ''), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    return { client };
  } catch (err: any) {
    return { client: null, error: err.message };
  }
}

/**
 * Validates that essential root keys are present in content payload before writing to Supabase
 */
export function validateContentPayload(payload: any): { isValid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Content payload must be a non-null JSON object.' };
  }

  const requiredSections = [
    'seo',
    'branding',
    'navigation',
    'hero',
    'about',
    'services',
    'projects',
    'featuredVideos',
    'gallery',
    'workflow',
    'contact',
    'footer'
  ];

  for (const section of requiredSections) {
    if (!payload[section] || typeof payload[section] !== 'object') {
      return { isValid: false, error: `Content validation failed: Required section "${section}" is missing or invalid.` };
    }
  }

  return { isValid: true };
}

/**
<<<<<<< HEAD
 * Admin authorization check for server-side mutations
 */
export function verifyAdminAuthorization(req: any): boolean {
  // Check authorization header
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && (token.startsWith('shpix_') || token.length >= 16)) {
=======
 * Admin authorization check for server-side mutations.
 *
 * IMPORTANT / KNOWN LIMITATION: the admin password itself is verified entirely
 * client-side (salted SHA-256 hash stored inside the site_content JSON), so this
 * server check can only confirm the request is carrying a token shaped like the
 * one the client generates after a successful login - it cannot re-verify the
 * password itself. Previously this check also accepted ANY string 16+ characters
 * long as a bearer token, which meant literally any request with a random header
 * could publish content. That bypass has been removed below: a token must match
 * the exact `shpix_<timestamp>_<random>` shape the client actually produces in
 * ContentContext.tsx's loginAdmin().
 *
 * For genuinely strong protection this would need a real server-side session
 * (e.g. Supabase Auth) instead of a client-verified password - see README for
 * a note on hardening this further if the site holds sensitive data.
 */
const SESSION_TOKEN_PATTERN = /^shpix_\d{10,}_[a-z0-9]{1,}$/i;

function isValidSessionToken(token: string | undefined | null): boolean {
  return Boolean(token && SESSION_TOKEN_PATTERN.test(token.trim()));
}

export function verifyAdminAuthorization(req: any): boolean {
  // Check Authorization: Bearer <token> header
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (authHeader) {
    const token = String(authHeader).replace(/^Bearer\s+/i, '').trim();
    if (isValidSessionToken(token)) {
>>>>>>> 85bd45e (claude commit)
      return true;
    }
  }

<<<<<<< HEAD
  // Check admin session cookie or header
  const sessionHeader = req.headers?.['x-admin-session'] || req.headers?.['x-admin-token'];
  if (sessionHeader && String(sessionHeader).startsWith('shpix_')) {
=======
  // Check admin session header
  const sessionHeader = req.headers?.['x-admin-session'] || req.headers?.['x-admin-token'];
  if (isValidSessionToken(sessionHeader ? String(sessionHeader) : null)) {
>>>>>>> 85bd45e (claude commit)
    return true;
  }

  // In development environments with internal server calls
  if (process.env.NODE_ENV !== 'production' && req.headers?.['x-local-dev-sync'] === 'true') {
    return true;
  }

  return false;
}
