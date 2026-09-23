-- ==============================================================================
-- SHPIXELS CMS - Production Supabase Migration
-- Authoritative Single Source of Truth
-- ==============================================================================

-- 1. Create canonical site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  version BIGINT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Admin'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy: Anyone (unauthenticated visitor or anon client) can READ published content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
CREATE POLICY "Allow public read access"
  ON public.site_content
  FOR SELECT
  USING (true);

-- 4. Disallow anonymous client direct writes (Writes must only occur via secure server-side API or authenticated admin)
DROP POLICY IF EXISTS "Public can read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon updates" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon insert" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon update" ON public.site_content;
DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;

-- 5. Realtime publication: Enable site_content for Supabase Realtime broadcast
-- Run this if publication exists:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  END IF;
END $$;
