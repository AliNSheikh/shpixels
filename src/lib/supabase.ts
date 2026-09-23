/**
 * Supabase Data Client & Persistent Database Integration for SHPIXELS
 * 
 * Works seamlessly with Supabase REST API without bulky external dependencies,
 * allowing instant database sync on Vercel, Node, and local development.
 */

import { GlobalContent } from '../types/content';

const SUPABASE_STORAGE_URL_KEY = 'shpixels_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'shpixels_supabase_anon_key';

// Pre-configured default credentials for seamless instant connection
export const DEFAULT_SUPABASE_URL = 'https://bzfxervcwhvoxpvfsnec.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnhlcnZjd2h2b3hwdmZzbmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTYwOTQsImV4cCI6MjEwNTczMjA5NH0.FcnwXNlffUopnN4UsjhcPnzGitsNjFhRt8tAxvRgYaQ';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'default' | 'none';
}

/**
 * Retrieves the currently active Supabase configuration
 */
export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check Vite env vars (preferred for Vercel deployment)
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl.trim().replace(/\/$/, ''),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env'
    };
  }

  // 2. Check localStorage (allows admin to override or update via Dashboard UI)
  if (typeof window !== 'undefined') {
    try {
      const storedUrl = localStorage.getItem(SUPABASE_STORAGE_URL_KEY);
      const storedKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY);
      if (storedUrl && storedKey) {
        return {
          url: storedUrl.trim().replace(/\/$/, ''),
          anonKey: storedKey.trim(),
          isConfigured: true,
          source: 'custom'
        };
      }
    } catch {}
  }

  // 3. Fallback to active pre-configured project credentials
  if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
    return {
      url: DEFAULT_SUPABASE_URL.trim().replace(/\/$/, ''),
      anonKey: DEFAULT_SUPABASE_ANON_KEY.trim(),
      isConfigured: true,
      source: 'default'
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
}

/**
 * Saves custom Supabase configuration to local storage
 */
export function setSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const cleanKey = anonKey.trim();
      localStorage.setItem(SUPABASE_STORAGE_URL_KEY, cleanUrl);
      localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, cleanKey);
    } catch (e) {
      console.error('Failed to save Supabase credentials:', e);
    }
  }
}

/**
 * Clears custom Supabase credentials
 */
export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
    } catch {}
  }
}

/**
 * Tests connection to a Supabase instance
 */
export async function testSupabaseConnection(
  customUrl?: string, 
  customKey?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const config = getSupabaseConfig();
  const url = customUrl ? customUrl.trim().replace(/\/$/, '') : config.url;
  const key = customKey ? customKey.trim() : config.anonKey;

  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key must both be provided.'
    };
  }

  const startTime = Date.now();
  try {
    // Attempt querying the site_content table
    const endpoint = `${url}/rest/v1/site_content?select=id,version,updated_at&limit=1`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: `Successfully connected to Supabase table 'site_content' (${latencyMs}ms)`,
        latencyMs
      };
    }

    if (response.status === 404 || response.status === 400) {
      // Check if project is reachable but table doesn't exist yet
      const healthCheck = await fetch(`${url}/rest/v1/`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });

      if (healthCheck.ok) {
        return {
          success: false,
          message: "Connected to Supabase API, but 'site_content' table is missing. Run the SQL schema script provided.",
          latencyMs
        };
      }
    }

    const errText = await response.text();
    return {
      success: false,
      message: `Supabase returned ${response.status}: ${errText.slice(0, 150)}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network connection failed: ${err.message || 'Unable to reach Supabase'}`
    };
  }
}

/**
 * Fetches site content directly from Supabase
 */
export async function fetchContentFromSupabase(): Promise<GlobalContent | null> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  try {
    const endpoint = `${config.url}/rest/v1/site_content?id=eq.current&select=*`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.warn(`[Supabase] Fetch returned status ${response.status}`);
      return null;
    }

    const rows = await response.json();
    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0];
      const data = row.data || row.content;
      if (data && typeof data === 'object') {
        // Inject publication version if saved in table column
        if (row.version && data.publicationInfo) {
          data.publicationInfo.version = row.version;
        }
        return data;
      }
    }
    return null;
  } catch (err) {
    console.error('[Supabase] Failed to fetch content:', err);
    return null;
  }
}

/**
 * Saves site content directly into Supabase 'site_content' table
 */
export async function saveContentToSupabase(content: GlobalContent): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const endpoint = `${config.url}/rest/v1/site_content`;
    const version = content.publicationInfo?.version || 1;
    const now = new Date().toISOString();

    const payload = {
      id: 'current',
      data: content,
      content: content,
      version: version,
      published_at: content.lastPublished || now,
      last_published: content.lastPublished || now,
      updated_at: now
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase returned status ${response.status}: ${text}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Failed to save content:', err);
    return { success: false, error: err.message || 'Supabase save error' };
  }
}
