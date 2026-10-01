-- ==============================================================================
-- SHPIXELS — Supabase verification
-- Safe/read-only checks to run AFTER supabase-schema.sql and the latest additive
-- migrations. No DELETE/UPDATE/INSERT statements are executed by this file.
-- ==============================================================================

-- 1) Canonical site document must exist.
SELECT
  id,
  version,
  published_at,
  updated_at,
  jsonb_typeof(data) AS data_type,
  data ? 'branding' AS has_branding,
  data ? 'hero' AS has_hero,
  data ? 'about' AS has_about,
  data ? 'featuredVideos' AS has_category_videos,
  jsonb_array_length(COALESCE(data->'featuredVideos','[]'::jsonb)) AS category_video_count,
  data ? 'contact' AS has_contact,
  data ? 'footer' AS has_footer,
  data #>> '{branding,googleFontUrl}' AS canonical_google_font_url,
  data #>> '{branding,fontFamily}' AS canonical_font_family,
  data #>> '{sectionVisibility,brands}' AS brands_visible
FROM public.site_content
WHERE id = 'current';

-- 2) Projection status should exist. After one CMS publish, ok should be TRUE and
--    version should equal site_content.version.
SELECT id, version, ok, error, updated_at
FROM public.cms_projection_status
WHERE id = 'current';

-- 3) Confirm the current triggers are installed on site_content.
SELECT
  t.tgname AS trigger_name,
  p.proname AS function_name,
  pg_get_triggerdef(t.oid, TRUE) AS trigger_definition
FROM pg_trigger AS t
JOIN pg_class AS c ON c.oid = t.tgrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_proc AS p ON p.oid = t.tgfoid
WHERE n.nspname = 'public'
  AND c.relname = 'site_content'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4) Detect the historical unsafe-delete bug. This query should return FALSE.
SELECT
  position('DELETE FROM public.navigation_items;' IN pg_get_functiondef(
    'public.sync_shpixels_site_projections()'::regprocedure
  )) > 0 AS has_legacy_delete_without_where;

-- 5) Detect the historical ambiguous ordinality pattern. This query should
--    return FALSE for the problematic category SELECT.
SELECT
  position('SELECT value #>> ''{}'' AS name, ord' IN pg_get_functiondef(
    'public.sync_shpixels_site_projections()'::regprocedure
  )) > 0 AS has_legacy_ambiguous_ord;

-- 6) All CMS projection tables expected by the current application.
WITH expected(table_name) AS (
  VALUES
    ('site_content'),
    ('site_sections'),
    ('site_settings'),
    ('navigation_items'),
    ('header_ctas'),
    ('hero_settings'),
    ('about_profile'),
    ('services'),
    ('project_categories'),
    ('featured_videos'),
    ('category_videos'),
    ('gallery_items'),
    ('client_logos'),
    ('workflow_steps'),
    ('timeline_items'),
    ('skills'),
    ('testimonials'),
    ('footer_links'),
    ('section_headers'),
    ('section_visibility'),
    ('contact_social_links'),
    ('contact_inquiries'),
    ('cms_projection_status')
)
SELECT
  e.table_name,
  to_regclass('public.' || e.table_name) IS NOT NULL AS exists
FROM expected AS e
ORDER BY e.table_name;

-- 7) Compare canonical/projection versions. After publishing, all non-empty
--    projection tables should use the same version as site_content.
SELECT 'site_content' AS source, version FROM public.site_content WHERE id='current'
UNION ALL SELECT 'site_settings', version FROM public.site_settings WHERE id='current'
UNION ALL SELECT 'hero_settings', version FROM public.hero_settings WHERE id='current'
UNION ALL SELECT 'about_profile', version FROM public.about_profile WHERE id='current'
UNION ALL SELECT 'cms_projection_status', version FROM public.cms_projection_status WHERE id='current';

-- 8) Verify typography projection added by the BRANDS + font migration.
--    If these columns do not exist, run supabase-migration-2026-10-01-brands-font.sql.
SELECT
  id,
  google_font_url,
  font_family,
  branding #>> '{googleFontUrl}' AS branding_google_font_url,
  branding #>> '{fontFamily}' AS branding_font_family,
  version,
  updated_at
FROM public.site_settings
WHERE id = 'current';

-- 9) Confirm the dedicated BRANDS menu target is present and projected.
SELECT id, label, href, display_order, visible, version
FROM public.navigation_items
WHERE LOWER(href) = '#brands'
ORDER BY display_order;

-- 10) Confirm brand logos/social links are projected when configured.
SELECT id, name, logo_url, website_url, display_order, visible, version
FROM public.client_logos
ORDER BY display_order, name;

SELECT id, platform, label, url, display_order, visible, version
FROM public.contact_social_links
ORDER BY display_order, platform;

-- 11) Confirm direct category-video projection/view.
SELECT category, COUNT(*) AS video_count
FROM public.category_videos
WHERE visible = TRUE
GROUP BY category
ORDER BY category;

-- 12) Supabase Storage bucket used by CMS uploads.
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'site-media';

-- 13) Realtime publication membership for canonical content.
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'site_content';
