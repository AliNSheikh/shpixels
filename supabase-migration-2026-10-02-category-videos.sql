-- ==============================================================================
-- SHPIXELS — 2026-10-02 Category Videos Migration
-- Converts the public portfolio from Project -> Videos into Category -> Videos.
-- Safe to run more than once.
--
-- What it does:
--   1. Keeps public.featured_videos as the physical storage table for backward
--      compatibility.
--   2. Adds public.category_videos as the semantic read view used for category
--      video content.
--   3. Migrates YouTube videos nested in legacy site_content.projects into
--      site_content.featuredVideos without deleting legacy project data.
--   4. Adds missing legacy project categories to the canonical categories list.
-- ==============================================================================

BEGIN;

CREATE INDEX IF NOT EXISTS featured_videos_category_order_idx
  ON public.featured_videos(category, display_order);

CREATE OR REPLACE VIEW public.category_videos
WITH (security_invoker = true)
AS
SELECT
  id,
  title,
  youtube_url,
  youtube_video_id,
  thumbnail,
  description,
  category,
  featured,
  visible,
  display_order,
  caption,
  client,
  raw,
  version,
  updated_at
FROM public.featured_videos;

GRANT SELECT ON public.category_videos TO anon, authenticated;

DO $$
DECLARE
  doc JSONB;
  videos JSONB;
  categories_json JSONB;
  project_row JSONB;
  video_row JSONB;
  project_ord BIGINT;
  video_ord BIGINT;
  legacy_id TEXT;
  legacy_category TEXT;
  legacy_video_id TEXT;
  legacy_url TEXT;
BEGIN
  SELECT data
  INTO doc
  FROM public.site_content
  WHERE id = 'current'
  FOR UPDATE;

  IF doc IS NULL THEN
    RETURN;
  END IF;

  videos := COALESCE(doc->'featuredVideos', '[]'::jsonb);
  categories_json := COALESCE(doc->'categories', '[]'::jsonb);

  FOR project_row, project_ord IN
    SELECT p.item, p.ord
    FROM jsonb_array_elements(COALESCE(doc->'projects', '[]'::jsonb))
      WITH ORDINALITY AS p(item, ord)
  LOOP
    FOR video_row, video_ord IN
      SELECT v.item, v.ord
      FROM jsonb_array_elements(COALESCE(project_row->'videos', '[]'::jsonb))
        WITH ORDINALITY AS v(item, ord)
    LOOP
      legacy_video_id := COALESCE(NULLIF(video_row->>'videoId', ''), NULLIF(video_row->>'youtubeUrl', ''));
      legacy_url := COALESCE(NULLIF(video_row->>'youtubeUrl', ''), legacy_video_id);
      legacy_category := COALESCE(NULLIF(project_row->>'category', ''), 'Uncategorized');
      legacy_id := 'legacy-' || COALESCE(NULLIF(project_row->>'id', ''), 'project-' || project_ord::text)
        || '-' || COALESCE(NULLIF(video_row->>'id', ''), 'video-' || video_ord::text);

      IF legacy_video_id IS NULL THEN
        CONTINUE;
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(videos) AS existing(item)
        WHERE existing.item->>'id' = legacy_id
           OR (
             COALESCE(existing.item->>'videoId', existing.item->>'youtubeUrl', '') = legacy_video_id
             AND COALESCE(existing.item->>'category', '') = legacy_category
           )
      ) THEN
        videos := videos || jsonb_build_array(
          jsonb_build_object(
            'id', legacy_id,
            'title', COALESCE(NULLIF(video_row->>'title', ''), NULLIF(project_row->>'title', ''), legacy_category || ' Video'),
            'youtubeUrl', legacy_url,
            'videoId', legacy_video_id,
            'thumbnail', COALESCE(project_row->>'coverImage', ''),
            'description', COALESCE(project_row->>'description', ''),
            'category', legacy_category,
            'featured', COALESCE((project_row->>'featured')::BOOLEAN, FALSE),
            'visible', COALESCE((project_row->>'published')::BOOLEAN, TRUE),
            'order', jsonb_array_length(videos) + 1,
            'caption', COALESCE(video_row->>'caption', ''),
            'client', COALESCE(project_row->>'client', '')
          )
        );
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(categories_json) AS existing_category(name)
        WHERE LOWER(existing_category.name) = LOWER(legacy_category)
      ) THEN
        categories_json := categories_json || to_jsonb(legacy_category);
      END IF;
    END LOOP;
  END LOOP;

  IF videos IS DISTINCT FROM COALESCE(doc->'featuredVideos', '[]'::jsonb)
     OR categories_json IS DISTINCT FROM COALESCE(doc->'categories', '[]'::jsonb) THEN
    UPDATE public.site_content
    SET data = jsonb_set(
          jsonb_set(doc, '{featuredVideos}', videos, TRUE),
          '{categories}',
          categories_json,
          TRUE
        ),
        version = version + 1,
        updated_at = NOW(),
        updated_by = 'Migration: Category Videos'
    WHERE id = 'current';
  END IF;
END $$;

COMMIT;

-- Verification
SELECT
  category,
  COUNT(*) AS video_count
FROM public.category_videos
WHERE visible = TRUE
GROUP BY category
ORDER BY category;
