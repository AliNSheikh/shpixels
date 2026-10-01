-- ==============================================================================
-- SHPIXELS — Supabase verification
-- Safe/read-only checks to run AFTER supabase-schema.sql.
-- No DELETE/UPDATE/INSERT statements are executed by this file.
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
  data ? 'projects' AS has_projects,
  data ? 'contact' AS has_contact,
  data ? 'footer' AS has_footer
FROM public.site_content
WHERE id = 'current';

-- 2) Projection status should exist. After one CMS publish, ok should be TRUE and
--    version should equal site_content.version.
SELECT id, version, ok, error, updated_at
FROM public.cms_projection_status
WHERE id = 'current';

-- 3) Confirm the current trigger is installed on site_content.
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
  AND NOT t.tgisinternal;

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
    ('projects'),
    ('project_videos'),
    ('project_gallery'),
    ('project_links'),
    ('project_tags'),
    ('featured_videos'),
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

-- 8) Confirm brand logos/social links are projected when configured.
SELECT id, name, logo_url, website_url, display_order, visible, version
FROM public.client_logos
ORDER BY display_order, name;

SELECT id, platform, label, url, display_order, visible, version
FROM public.contact_social_links
ORDER BY display_order, platform;

-- 9) Supabase Storage bucket used by CMS uploads.
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'site-media';

-- 10) Realtime publication membership for canonical content.
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'site_content';
