-- ==============================================================================
-- SHPIXELS CMS — Supabase Database Setup (canonical content + section projections)
-- ==============================================================================
-- The application writes one authoritative JSON document to public.site_content.
-- Two read-only projection tables are maintained automatically by a trigger:
--
--   public.site_sections
--     One row per top-level CMS section (branding, contact, projects, etc.).
--
--   public.site_settings
--     Explicit searchable columns for the most important global settings:
--     logo, favicon, email, phone, WhatsApp, location and social links.
--
-- This design keeps publishing atomic (one source of truth) while still making
-- every section and every global contact/branding field visible in the database.
-- Re-running this file is safe.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Canonical site document
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Admin'
);

ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'Admin';

-- Migrate older schema variants when those legacy columns are present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_content'
      AND column_name = 'content'
  ) THEN
    EXECUTE $sql$
      UPDATE public.site_content
      SET data = content
      WHERE (data IS NULL OR data = '{}'::jsonb)
        AND content IS NOT NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_content'
      AND column_name = 'last_published'
  ) THEN
    EXECUTE $sql$
      UPDATE public.site_content
      SET published_at = last_published
      WHERE published_at IS NULL
        AND last_published IS NOT NULL
    $sql$;
  END IF;
END $$;

UPDATE public.site_content SET data = '{}'::jsonb WHERE data IS NULL;
ALTER TABLE public.site_content ALTER COLUMN data SET NOT NULL;

-- Never keep authentication secrets inside public CMS content.
UPDATE public.site_content
SET data = data - 'adminAuth' - 'supabaseConfig'
WHERE id = 'current';

CREATE INDEX IF NOT EXISTS site_content_data_gin_idx
  ON public.site_content USING GIN (data);

-- ------------------------------------------------------------------------------
-- 2. One database row per CMS section
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_sections (
  section_key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_sections ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_sections ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE public.site_sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 3. Explicit global branding/contact/settings projection
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',

  site_name TEXT,
  logo_text TEXT,
  logo_subtext TEXT,
  logo_image TEXT,
  favicon TEXT,
  accent_color TEXT,

  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  location TEXT,
  instagram TEXT,
  youtube TEXT,
  tiktok TEXT,
  linkedin TEXT,
  behance TEXT,

  cta_heading TEXT,
  cta_subtitle TEXT,
  response_time_note TEXT,

  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  footer JSONB NOT NULL DEFAULT '{}'::jsonb,

  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_subtext TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS youtube TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS behance TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS cta_heading TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS cta_subtitle TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS response_time_note TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS branding JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 4. Keep projections synchronized automatically after every CMS publication
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_shpixels_site_projections()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id <> 'current' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.site_sections (section_key, data, version, updated_at)
  SELECT
    entry.key,
    entry.value,
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  FROM jsonb_each(COALESCE(NEW.data, '{}'::jsonb)) AS entry
  ON CONFLICT (section_key) DO UPDATE
  SET
    data = EXCLUDED.data,
    version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;

  DELETE FROM public.site_sections
  WHERE section_key NOT IN (
    SELECT key
    FROM jsonb_each(COALESCE(NEW.data, '{}'::jsonb))
  );

  INSERT INTO public.site_settings (
    id,
    site_name,
    logo_text,
    logo_subtext,
    logo_image,
    favicon,
    accent_color,
    email,
    phone,
    whatsapp,
    location,
    instagram,
    youtube,
    tiktok,
    linkedin,
    behance,
    cta_heading,
    cta_subtitle,
    response_time_note,
    branding,
    contact,
    seo,
    footer,
    version,
    updated_at
  )
  VALUES (
    'current',
    NEW.data #>> '{branding,siteName}',
    NEW.data #>> '{branding,logoText}',
    NEW.data #>> '{branding,logoSubtext}',
    NEW.data #>> '{branding,logoImage}',
    COALESCE(
      NEW.data #>> '{branding,favicon}',
      NEW.data #>> '{seo,favicon}'
    ),
    NEW.data #>> '{branding,accentColor}',
    NEW.data #>> '{contact,email}',
    NEW.data #>> '{contact,phone}',
    NEW.data #>> '{contact,whatsapp}',
    NEW.data #>> '{contact,location}',
    NEW.data #>> '{contact,instagram}',
    NEW.data #>> '{contact,youtube}',
    NEW.data #>> '{contact,tiktok}',
    NEW.data #>> '{contact,linkedin}',
    NEW.data #>> '{contact,behance}',
    NEW.data #>> '{contact,ctaHeading}',
    NEW.data #>> '{contact,ctaSubtitle}',
    NEW.data #>> '{contact,responseTimeNote}',
    COALESCE(NEW.data -> 'branding', '{}'::jsonb),
    COALESCE(NEW.data -> 'contact', '{}'::jsonb),
    COALESCE(NEW.data -> 'seo', '{}'::jsonb),
    COALESCE(NEW.data -> 'footer', '{}'::jsonb),
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    site_name = EXCLUDED.site_name,
    logo_text = EXCLUDED.logo_text,
    logo_subtext = EXCLUDED.logo_subtext,
    logo_image = EXCLUDED.logo_image,
    favicon = EXCLUDED.favicon,
    accent_color = EXCLUDED.accent_color,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    location = EXCLUDED.location,
    instagram = EXCLUDED.instagram,
    youtube = EXCLUDED.youtube,
    tiktok = EXCLUDED.tiktok,
    linkedin = EXCLUDED.linkedin,
    behance = EXCLUDED.behance,
    cta_heading = EXCLUDED.cta_heading,
    cta_subtitle = EXCLUDED.cta_subtitle,
    response_time_note = EXCLUDED.response_time_note,
    branding = EXCLUDED.branding,
    contact = EXCLUDED.contact,
    seo = EXCLUDED.seo,
    footer = EXCLUDED.footer,
    version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_shpixels_site_projections_trigger
  ON public.site_content;

CREATE TRIGGER sync_shpixels_site_projections_trigger
AFTER INSERT OR UPDATE OF data, version, updated_at
ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.sync_shpixels_site_projections();

-- Backfill projection tables from the current canonical row.
UPDATE public.site_content
SET updated_at = updated_at
WHERE id = 'current';

-- ------------------------------------------------------------------------------
-- 5. Row Level Security
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('site_content', 'site_sections', 'site_settings')
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  END LOOP;
END $$;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT ON public.site_sections TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.site_content FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_sections FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings FROM anon, authenticated;

CREATE POLICY "Public read current site"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (id = 'current');

CREATE POLICY "Public read site sections"
ON public.site_sections
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (id = 'current');

-- All writes are performed server-side using SUPABASE_SECRET_KEY/service_role
-- after the CMS session has been verified.

-- ------------------------------------------------------------------------------
-- 6. Supabase Realtime
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_sections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_sections;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. Verification queries
-- ------------------------------------------------------------------------------
-- Canonical document/version:
-- SELECT id, version, published_at, updated_at FROM public.site_content;
--
-- Every stored top-level CMS section:
-- SELECT section_key, version, updated_at
-- FROM public.site_sections
-- ORDER BY section_key;
--
-- Logo, contact details and social links:
-- SELECT site_name, logo_image, favicon, email, phone, whatsapp,
--        instagram, youtube, tiktok, linkedin, behance, version, updated_at
-- FROM public.site_settings
-- WHERE id = 'current';
-- ==============================================================================
