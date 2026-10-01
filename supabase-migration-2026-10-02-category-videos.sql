-- ==============================================================================
-- SHPIXELS — Category YouTube videos migration (2026-10-02)
-- Replaces the public portfolio-project workflow with direct YouTube videos
-- assigned to categories. Safe/additive: legacy project tables are preserved.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.category_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  category TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  client TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS raw JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE public.category_videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Dedicated compatibility projection. The full latest supabase-schema.sql also
-- projects the same canonical featuredVideos array into category_videos.
CREATE OR REPLACE FUNCTION public.sync_shpixels_category_videos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.category_videos WHERE TRUE;

  INSERT INTO public.category_videos
    (id,title,youtube_url,youtube_video_id,thumbnail,description,category,featured,visible,
     display_order,caption,client,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'video-' || x.ord::text),
    COALESCE(NULLIF(x.item->>'title',''), COALESCE(NULLIF(x.item->>'category',''),'Uncategorized') || ' Video'),
    COALESCE(x.item->>'youtubeUrl',''),
    COALESCE(x.item->>'videoId',''),
    x.item->>'thumbnail',
    x.item->>'description',
    COALESCE(NULLIF(x.item->>'category',''),'Uncategorized'),
    COALESCE((x.item->>'featured')::BOOLEAN,FALSE),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    x.item->>'caption',
    x.item->>'client',
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'featuredVideos','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord)
  WHERE COALESCE(x.item->>'videoId', x.item->>'youtubeUrl', '') <> '';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_shpixels_category_videos_trigger ON public.site_content;
CREATE TRIGGER sync_shpixels_category_videos_trigger
AFTER INSERT OR UPDATE OF data, version, updated_at ON public.site_content
FOR EACH ROW
WHEN (NEW.id = 'current')
EXECUTE FUNCTION public.sync_shpixels_category_videos();

-- Backfill immediately from the current canonical site document.
UPDATE public.site_content
SET updated_at = updated_at
WHERE id = 'current';

ALTER TABLE public.category_videos ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'category_videos'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

GRANT SELECT ON public.category_videos TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.category_videos FROM anon, authenticated;

CREATE POLICY "Public read category videos" ON public.category_videos
  FOR SELECT TO anon, authenticated USING (visible = TRUE);

-- Verification.
SELECT category, COUNT(*) AS video_count, MAX(version) AS version
FROM public.category_videos
WHERE visible = TRUE
GROUP BY category
ORDER BY category;
