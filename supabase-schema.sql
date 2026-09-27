-- ==============================================================================
<<<<<<< HEAD
-- SHPIXELS • Supabase Database Schema & Setup Script
-- ==============================================================================
-- This script provisions all necessary tables, row-level security (RLS) policies,
-- and default permissions to allow persistent storage and instant data synchronization
-- across Vercel deployments and visitor sessions.
--
-- Instructions:
-- 1. Open your Supabase project dashboard (https://supabase.com/dashboard)
-- 2. Go to the "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "RUN"
-- 4. Copy your "Project URL" and "anon public key" from Project Settings -> API
-- 5. Paste them into the SHPIXELS Dashboard under "Settings -> Database & Supabase"
-- ==============================================================================

-- 1. Create site_content table (Primary store for all site data & CMS edits)
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY DEFAULT 'current',
    content JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    last_published TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant JSON retrieval
CREATE INDEX IF NOT EXISTS idx_site_content_id ON public.site_content(id);

-- 2. Create category_metadata table (Dedicated category taxonomy & cover images)
CREATE TABLE IF NOT EXISTS public.category_metadata (
    id UUID DEFAULT gen_random_column_or_uuid_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_ar TEXT,
    cover_image TEXT,
    description TEXT,
    description_ar TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fallback function if uuid-ossp is not enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_metadata ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies for site_content:
-- Allow PUBLIC READ so all visitors can see published portfolio without logging in
DROP POLICY IF EXISTS "Public read access for site_content" ON public.site_content;
CREATE POLICY "Public read access for site_content"
    ON public.site_content
    FOR SELECT
    TO public, anon, authenticated
    USING (true);

-- Allow upsert/write access using the anon key or authenticated users
DROP POLICY IF EXISTS "Allow write access for site_content" ON public.site_content;
CREATE POLICY "Allow write access for site_content"
    ON public.site_content
    FOR ALL
    TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Set RLS Policies for category_metadata:
DROP POLICY IF EXISTS "Public read access for category_metadata" ON public.category_metadata;
CREATE POLICY "Public read access for category_metadata"
    ON public.category_metadata
    FOR SELECT
    TO public, anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow write access for category_metadata" ON public.category_metadata;
CREATE POLICY "Allow write access for category_metadata"
    ON public.category_metadata
    FOR ALL
    TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_site_content_updated_at ON public.site_content;
CREATE TRIGGER set_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Insert Initial Categories with High-Quality Cover Images
INSERT INTO public.category_metadata (name, name_ar, cover_image, description, description_ar, sort_order)
VALUES
    ('Commercial & Brand Ads', 'إعلانات تجارية', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85', 'High-impact commercial storytelling and broadcast commercials.', 'إعلانات تجارية سينمائية عالية التأثير للعلامات التجارية.', 1),
    ('Sport & Gym', 'رياضة ولياقة', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85', 'High-octane fitness, athletic power, and dynamic movement.', 'تصوير حركي ديناميكي للياقة البدنية والرياضيين.', 2),
    ('Weddings & Events', 'أعراس وفعاليات', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85', 'Emotional luxury wedding films and memorable celebrations.', 'توثيق سينمائي فاخر للأعراس واللحظات العاطفية الخالدة.', 3),
    ('AI & Motion Graphics', 'ذكاء اصطناعي وموشن', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85', 'Generative neural aesthetics, VFX, and kinetic typography.', 'مؤثرات بصرية متقدمة وموشن جرافيكس مدعوم بالذكاء الاصطناعي.', 4),
    ('Medical & Healthcare', 'رعاية صحية وطبية', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85', 'Precise, empathetic healthcare documentaries and surgical portraits.', 'أفلام طبية وثائقية للمستشفيات والكوادر الصحية.', 5),
    ('Aerial & Drone', 'تصوير جوي درون', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=85', 'Licensed 4K aerial cinematography and sweeping landscape reveals.', 'لقطات جوية 4K مرخصة وتوثيق معماري وطبيعي مذهل.', 6)
ON CONFLICT (name) DO UPDATE SET
    cover_image = EXCLUDED.cover_image,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar;

-- ==============================================================================
-- Confirmation Query
-- Run this to verify that the table is ready:
-- SELECT id, version, updated_at FROM public.site_content;
=======
-- MOGRAFIX CMS — Supabase Database Setup (single source of truth)
-- ==============================================================================
-- This is the ONLY schema file this project needs. Run this once against a new
-- Supabase project, or re-run it any time — every step is idempotent and safe
-- to execute repeatedly.
--
-- What it creates:
--   public.site_content
--     id           TEXT PRIMARY KEY DEFAULT 'current'   (a single row holds the whole site)
--     data         JSONB NOT NULL DEFAULT '{}'::jsonb   (the entire GlobalContent object)
--     version      BIGINT NOT NULL DEFAULT 1            (incremented on every publish)
--     published_at TIMESTAMPTZ DEFAULT NOW()
--     updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
--     updated_by   TEXT DEFAULT 'Admin'
--
-- This exactly matches the column names the app code reads and writes
-- (see api/_supabase.ts, api/content.ts, api/publish-site.ts, src/lib/supabase.ts).
-- Older versions of this project shipped two different, conflicting schema
-- files (one using a "content" column, one using "data", plus an unused,
-- broken "category_metadata" table). Both have been replaced by this single file.
--
-- Instructions:
-- 1. Open your Supabase project dashboard (https://supabase.com/dashboard)
-- 2. Go to "SQL Editor" → "New Query"
-- 3. Paste this entire script and click "RUN"
-- 4. Copy your Project URL + anon public key from Project Settings → API
-- 5. Set them as environment variables (see .env.example / README.md), then
--    redeploy so the app picks them up.
-- ==============================================================================

-- STEP 1: Create the table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Admin'
);

-- STEP 2: Ensure every canonical column exists (handles older/partial tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'data'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN data JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN version BIGINT NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN updated_by TEXT DEFAULT 'Admin';
  END IF;
END $$;

-- STEP 3: Migrate data from a legacy "content" / "last_published" column if
-- this database was set up with an older version of this project.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'content'
  ) THEN
    UPDATE public.site_content
    SET data = content
    WHERE (data IS NULL OR data = '{}'::jsonb) AND content IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'last_published'
  ) THEN
    UPDATE public.site_content
    SET published_at = last_published
    WHERE published_at IS NULL AND last_published IS NOT NULL;
  END IF;
END $$;

-- STEP 4: Drop the legacy columns now that their data is safely preserved
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.site_content DROP COLUMN content;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'last_published'
  ) THEN
    ALTER TABLE public.site_content DROP COLUMN last_published;
  END IF;
END $$;

-- STEP 5: Drop the old, unused "category_metadata" table if it exists.
-- It was never read or written by any application code, and its CREATE TABLE
-- statement in older versions of this project referenced a function that
-- does not exist in Postgres (gen_random_column_or_uuid_v4), which caused the
-- whole setup script to fail with an error before anything else ran.
DROP TABLE IF EXISTS public.category_metadata;

-- STEP 6: Enforce NOT NULL on the data column and backfill any nulls first
UPDATE public.site_content SET data = '{}'::jsonb WHERE data IS NULL;
ALTER TABLE public.site_content ALTER COLUMN data SET NOT NULL;

-- STEP 7: Row Level Security
-- This app does not use Supabase Auth sessions — the admin login is a custom,
-- app-level password check, and every write goes through this project's own
-- serverless API routes (api/publish-site.ts), which check for a valid admin
-- session token before touching the database. Because of that, RLS is kept
-- permissive on this single row for both reads and writes, and the API layer
-- is the real gate.
--
-- If you want database-level write protection as well (recommended for a
-- production business site), set SUPABASE_SERVICE_ROLE_KEY in your server
-- environment (Vercel → Project Settings → Environment Variables — never
-- prefix it with VITE_) and then tighten the write policy below to
-- `TO service_role` only.
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon updates" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon insert" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon update" ON public.site_content;
DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.site_content;
DROP POLICY IF EXISTS "Allow authenticated users to write" ON public.site_content;
DROP POLICY IF EXISTS "Public read access for site_content" ON public.site_content;
DROP POLICY IF EXISTS "Allow write access for site_content" ON public.site_content;

CREATE POLICY "Allow public read access"
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow app-level writes"
  ON public.site_content
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- STEP 8: Add public.site_content to the Realtime publication so admin edits
-- reflect on the live site instantly for every open browser tab.
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

-- ==============================================================================
-- Confirmation query — run this after the script to verify the table is ready:
-- SELECT id, version, published_at, updated_at FROM public.site_content;
>>>>>>> 85bd45e (claude commit)
-- ==============================================================================
