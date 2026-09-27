/**
 * Supabase Data Client & Persistent Database Integration
 *
 * Production architecture:
 * - Public reads: Direct Supabase client using the Anon Key, OR the serverless /api/content route
 * - Realtime subscriptions: Directly on table 'site_content' with filter id=eq.current
 * - Admin writes: Through the secure serverless endpoint /api/publish (see api/publish-site.ts)
 *
 * IMPORTANT: This file intentionally has NO hardcoded fallback project URL or key.
 * If VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't set, every function below
 * returns a clear "not configured" result instead of silently talking to some
 * other project. Configure these in a local .env file (see .env.example) and in
 * your Vercel Project Settings → Environment Variables.
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { GlobalContent } from '../types/content';

export function getSupabaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  return envUrl && envUrl.trim() ? envUrl.trim().replace(/\/$/, '') : '';
}

export function getSupabaseAnonKey(): string {
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  return envKey && envKey.trim() ? envKey.trim() : '';
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a configured Supabase client, or null when VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY are missing. Callers MUST handle the null case.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseInstance;
}

export interface SupabaseContentResult {
  data: GlobalContent | null;
  version: number;
  publishedAt: string | null;
  updatedAt: string | null;
  error?: string;
}

const NOT_CONFIGURED_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';

/**
 * Reads the authoritative content row from Supabase
 */
export async function fetchAuthoritativeContent(): Promise<SupabaseContentResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, version: 0, publishedAt: null, updatedAt: null, error: NOT_CONFIGURED_ERROR };
  }

  try {
    let { data: rows, error } = await client
      .from('site_content')
      .select('id, data, version, published_at, updated_at')
      .eq('id', 'current')
      .limit(1);

    if (error && error.message && error.message.includes("Could not find the '")) {
      const retry = await client
        .from('site_content')
        .select('id, data, version')
        .eq('id', 'current')
        .limit(1);
      if (!retry.error) {
        rows = retry.data as any;
        error = null;
      }
    }

    if (error) {
      return { data: null, version: 0, publishedAt: null, updatedAt: null, error: error.message };
    }

    if (rows && rows.length > 0 && rows[0]?.data) {
      const row = rows[0];
      const content = row.data as GlobalContent;
      const ver = Number(row.version || 1);

      if (!content.publicationInfo) content.publicationInfo = { publishedAt: row.published_at || new Date().toISOString(), version: ver };
      content.publicationInfo.version = ver;
      if (row.published_at) content.lastPublished = row.published_at;

      return {
        data: content,
        version: ver,
        publishedAt: row.published_at,
        updatedAt: row.updated_at
      };
    }

    return { data: null, version: 0, publishedAt: null, updatedAt: null, error: 'No row found in site_content with id=current' };
  } catch (err: any) {
    return { data: null, version: 0, publishedAt: null, updatedAt: null, error: err.message };
  }
}

/**
 * Subscribes to Supabase Realtime changes on site_content for id=current.
 * Returns null when Supabase isn't configured - callers must check before calling unsubscribe().
 */
export function subscribeToContentChanges(
  onUpdate: (payload: { data: GlobalContent; version: number; publishedAt: string | null }) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) {
    if (onStatusChange) onStatusChange('CHANNEL_ERROR');
    return null;
  }

  const channel = client
    .channel('site_content_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_content',
        filter: 'id=eq.current'
      },
      (payload) => {
        const newRecord = payload.new as any;
        if (newRecord && newRecord.data) {
          const content = newRecord.data as GlobalContent;
          const version = Number(newRecord.version || 1);
          const publishedAt = newRecord.published_at || null;
          onUpdate({ data: content, version, publishedAt });
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status as any);
      }
    });

  return channel;
}

/**
 * Diagnostics check for Admin dashboard
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tableExists: boolean;
  version: number;
  publishedAt: string | null;
  updatedAt: string | null;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tableExists: false,
      version: 0,
      publishedAt: null,
      updatedAt: null,
      error: NOT_CONFIGURED_ERROR
    };
  }

  try {
    let { data, error } = await client
      .from('site_content')
      .select('version, published_at, updated_at')
      .eq('id', 'current')
      .limit(1);

    if (error && error.message && error.message.includes("Could not find the '")) {
      const retry = await client
        .from('site_content')
        .select('version')
        .eq('id', 'current')
        .limit(1);
      if (!retry.error) {
        data = retry.data as any;
        error = null;
      }
    }

    if (error) {
      return {
        connected: false,
        tableExists: error.code !== '42P01', // 42P01 is undefined_table in PostgreSQL
        version: 0,
        publishedAt: null,
        updatedAt: null,
        error: error.message
      };
    }

    if (data && data.length > 0) {
      return {
        connected: true,
        tableExists: true,
        version: Number(data[0].version || 1),
        publishedAt: data[0].published_at,
        updatedAt: data[0].updated_at
      };
    }

    return {
      connected: true,
      tableExists: true,
      version: 0,
      publishedAt: null,
      updatedAt: null
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      version: 0,
      publishedAt: null,
      updatedAt: null,
      error: err.message
    };
  }
}
