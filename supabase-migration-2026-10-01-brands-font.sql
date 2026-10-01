-- ==============================================================================
-- SHPIXELS additive migration — BRANDS navigation + Google Fonts typography
-- Date: 2026-10-01
--
-- Run this once in the SAME Supabase project used by the production Vercel site.
-- It is safe to re-run.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1) Explicit typography projection columns
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_font_url TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS font_family TEXT;

-- ------------------------------------------------------------------------------
-- 2) Backfill canonical branding defaults without replacing existing values
-- ------------------------------------------------------------------------------
UPDATE public.site_content
SET data = jsonb_set(
      COALESCE(data, '{}'::jsonb),
      '{branding}',
      COALESCE(data->'branding', '{}'::jsonb)
        || jsonb_build_object(
          'googleFontUrl',
          COALESCE(
            NULLIF(data->'branding'->>'googleFontUrl', ''),
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap'
          ),
          'fontFamily',
          COALESCE(NULLIF(data->'branding'->>'fontFamily', ''), 'Quicksand')
        ),
      true
    ),
    updated_at = NOW()
WHERE id = 'current';

-- ------------------------------------------------------------------------------
-- 3) Rename the old clientlogos visibility key to the dedicated BRANDS section.
--    If "brands" already exists, its current value wins.
-- ------------------------------------------------------------------------------
UPDATE public.site_content
SET data = jsonb_set(
      data,
      '{sectionVisibility}',
      (
        COALESCE(data->'sectionVisibility', '{}'::jsonb)
        || jsonb_build_object(
          'brands',
          CASE
            WHEN COALESCE(data->'sectionVisibility', '{}'::jsonb) ? 'brands'
              THEN data->'sectionVisibility'->'brands'
            WHEN COALESCE(data->'sectionVisibility', '{}'::jsonb) ? 'clientlogos'
              THEN data->'sectionVisibility'->'clientlogos'
            ELSE 'true'::jsonb
          END
        )
      ) - 'clientlogos',
      true
    ),
    updated_at = NOW()
WHERE id = 'current';

-- ------------------------------------------------------------------------------
-- 4) Add BRANDS to the CMS Navigation Menu when it does not already exist.
--    Existing menu entries from order 2 onward are shifted by one position.
-- ------------------------------------------------------------------------------
UPDATE public.site_content sc
SET data = jsonb_set(
      sc.data,
      '{navigation}',
      (
        SELECT COALESCE(
          jsonb_agg(
            CASE
              WHEN (
                CASE
                  WHEN COALESCE(item->>'order', '') ~ '^[0-9]+$'
                    THEN (item->>'order')::integer
                  ELSE 0
                END
              ) >= 2
              THEN jsonb_set(
                item,
                '{order}',
                to_jsonb(
                  (
                    CASE
                      WHEN COALESCE(item->>'order', '') ~ '^[0-9]+$'
                        THEN (item->>'order')::integer
                      ELSE 0
                    END
                  ) + 1
                ),
                true
              )
              ELSE item
            END
            ORDER BY
              CASE
                WHEN COALESCE(item->>'order', '') ~ '^[0-9]+$'
                  THEN (item->>'order')::integer
                ELSE 999999
              END
          ),
          '[]'::jsonb
        )
        FROM jsonb_array_elements(COALESCE(sc.data->'navigation', '[]'::jsonb)) AS item
      )
      || jsonb_build_array(
        jsonb_build_object(
          'id', 'nav-brands',
          'label', 'Brands',
          'href', '#brands',
          'order', 2,
          'visible', true,
          'target', '_self',
          'kind', 'link'
        )
      ),
      true
    ),
    updated_at = NOW()
WHERE sc.id = 'current'
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(sc.data->'navigation', '[]'::jsonb)) AS item
    WHERE LOWER(COALESCE(item->>'href', '')) = '#brands'
  );

-- ------------------------------------------------------------------------------
-- 5) Keep the explicit typography columns synchronized with canonical branding.
--    The existing main projection trigger continues to own the rest of
--    public.site_settings; this small trigger only manages the two new fields.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_shpixels_typography_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  branding_json JSONB := COALESCE(NEW.data->'branding', '{}'::jsonb);
BEGIN
  INSERT INTO public.site_settings (
    id,
    google_font_url,
    font_family,
    version,
    updated_at
  )
  VALUES (
    'current',
    NULLIF(branding_json->>'googleFontUrl', ''),
    NULLIF(branding_json->>'fontFamily', ''),
    COALESCE(NEW.version, 1),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE
  SET google_font_url = EXCLUDED.google_font_url,
      font_family = EXCLUDED.font_family;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zz_sync_shpixels_typography_settings_trigger
  ON public.site_content;

CREATE TRIGGER zz_sync_shpixels_typography_settings_trigger
AFTER INSERT OR UPDATE OF data, version, updated_at
ON public.site_content
FOR EACH ROW
WHEN (NEW.id = 'current')
EXECUTE FUNCTION public.sync_shpixels_typography_settings();

-- Force an immediate backfill of the new projection columns.
UPDATE public.site_content
SET updated_at = NOW()
WHERE id = 'current';

COMMIT;

-- ------------------------------------------------------------------------------
-- Verification queries
-- ------------------------------------------------------------------------------
SELECT
  id,
  google_font_url,
  font_family,
  version,
  updated_at
FROM public.site_settings
WHERE id = 'current';

SELECT
  item->>'label' AS label,
  item->>'href' AS href,
  item->>'order' AS display_order,
  item->>'visible' AS visible
FROM public.site_content,
LATERAL jsonb_array_elements(COALESCE(data->'navigation', '[]'::jsonb)) AS item
WHERE id = 'current'
ORDER BY
  CASE
    WHEN COALESCE(item->>'order', '') ~ '^[0-9]+$'
      THEN (item->>'order')::integer
    ELSE 999999
  END;
