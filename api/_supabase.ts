import { hasAdminSession } from './_admin-auth.js';
/**
 * Server-Side Supabase Client & Database Utility
 * Exclusively used by Serverless API routes (Vercel) and development server.
 * 
 * Uses SUPABASE_SERVICE_ROLE_KEY (if present) for privileged admin writes,
 * or falls back to SUPABASE_ANON_KEY.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getServerSupabaseAuth(): { client: SupabaseClient | null; error?: string } {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const publicKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    return {
      client: null,
      error: 'Supabase Auth is missing SUPABASE_URL and a publishable/anon key. Verify the Vercel Supabase integration and redeploy.'
    };
  }

  try {
    return {
      client: createClient(url.trim().replace(/\/$/, ''), publicKey.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      })
    };
  } catch (err: any) {
    return { client: null, error: err.message };
  }
}

export function getServerSupabase(accessToken?: string): { client: SupabaseClient | null; error?: string } {
  // NOTE: no hardcoded fallback URL/key here on purpose. If these env vars are
  // missing, every API route must fail loudly with a clear "not configured"
  // error rather than silently connecting to an unrelated Supabase project.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { client: null, error: 'Server is missing Supabase environment variables. With the Vercel Supabase integration, verify SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) are available, then redeploy.' };
  }

  try {
    const client = createClient(url.trim().replace(/\/$/, ''), key.trim(), {
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
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
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
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

  for (const key of ['navigation', 'services', 'projects', 'featuredVideos', 'gallery', 'workflow']) {
    if (!Array.isArray(payload[key])) return { isValid: false, error: `${key} must be an array.` };
  }
  for (const key of ['seo', 'branding', 'hero', 'about', 'contact', 'footer']) {
    if (Array.isArray(payload[key])) return { isValid: false, error: `${key} must be an object.` };
  }
  return { isValid: true };
}

/** Server-verified signed HttpOnly admin session. */
export async function verifyAdminAuthorization(req: any): Promise<boolean> {
  return hasAdminSession(req);
}
