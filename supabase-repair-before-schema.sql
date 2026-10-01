-- ==============================================================================
-- SHPIXELS — Supabase repair preflight
-- Run this FIRST only when an older database returns errors such as:
--   21000: DELETE requires a WHERE clause
--   42702: column reference "ord" is ambiguous
--
-- This script does NOT delete website content. It removes stale site_content
-- projection triggers/functions so the complete latest supabase-schema.sql can
-- be installed cleanly without an old trigger blocking its migration updates.
--
-- REQUIRED NEXT STEP: immediately run the complete latest supabase-schema.sql.
-- ==============================================================================

BEGIN;

-- Remove every non-internal trigger currently attached to public.site_content.
-- Older SHPIXELS schema versions used more than one trigger name, so limiting
-- the repair to one hard-coded name can leave a stale trigger active.
DO $repair$
DECLARE
  trigger_record RECORD;
BEGIN
  IF to_regclass('public.site_content') IS NOT NULL THEN
    FOR trigger_record IN
      SELECT t.tgname
      FROM pg_trigger AS t
      JOIN pg_class AS c ON c.oid = t.tgrelid
      JOIN pg_namespace AS n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'site_content'
        AND NOT t.tgisinternal
    LOOP
      EXECUTE format(
        'DROP TRIGGER IF EXISTS %I ON public.site_content',
        trigger_record.tgname
      );
    END LOOP;
  END IF;
END
$repair$;

-- Remove known historical projection functions. The full schema recreates the
-- current function after all tables/columns have been upgraded.
DROP FUNCTION IF EXISTS public.sync_shpixels_site_projections();

-- Preserve/create projection status so diagnostics can report that a full schema
-- reinstall is still required. This table contains no website content.
CREATE TABLE IF NOT EXISTS public.cms_projection_status (
  id TEXT PRIMARY KEY DEFAULT 'current',
  version BIGINT NOT NULL DEFAULT 0,
  ok BOOLEAN NOT NULL DEFAULT FALSE,
  error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.cms_projection_status (id, version, ok, error, updated_at)
VALUES (
  'current',
  0,
  FALSE,
  'Repair preflight completed. Run the complete latest supabase-schema.sql now.',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET version = 0,
    ok = FALSE,
    error = EXCLUDED.error,
    updated_at = EXCLUDED.updated_at;

COMMIT;

-- DO NOT stop here. Run supabase-schema.sql next.
