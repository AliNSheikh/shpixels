-- ==============================================================================
-- SHPIXELS CMS — Complete Supabase Database Schema
-- ==============================================================================
-- Architecture
-- 1) public.site_content is the transactional source of truth written by the CMS.
-- 2) A trigger projects every editable website section into normalized tables.
-- 3) public.contact_inquiries is independent and stores inbound contact requests.
-- 4) Authentication remains in Supabase Auth; secrets never live in public tables.
--
-- Re-running this file is safe. After running it, publish the site once from the
-- CMS to backfill all projection tables from public.site_content.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- Canonical content document
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

UPDATE public.site_content SET data = '{}'::jsonb WHERE data IS NULL;
ALTER TABLE public.site_content ALTER COLUMN data SET NOT NULL;
UPDATE public.site_content SET data = data - 'adminAuth' - 'supabaseConfig' WHERE id = 'current';

CREATE INDEX IF NOT EXISTS site_content_data_gin_idx
  ON public.site_content USING GIN (data);

-- ------------------------------------------------------------------------------
-- Generic section projection
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_sections (
  section_key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Global settings / branding / SEO / contact / footer
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  site_name TEXT,
  logo_text TEXT,
  logo_subtext TEXT,
  logo_image TEXT,
  logo_light TEXT,
  logo_dark TEXT,
  favicon TEXT,
  accent_color TEXT,

  page_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  google_site_verification TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  meta_pixel_id TEXT,

  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  location TEXT,
  address TEXT,
  working_hours TEXT,
  instagram TEXT,
  youtube TEXT,
  tiktok TEXT,
  linkedin TEXT,
  behance TEXT,
  cta_heading TEXT,
  cta_subtitle TEXT,
  response_time_note TEXT,

  copyright_text TEXT,
  footer_quote TEXT,
  footer_disclaimer TEXT,
  legal_notice TEXT,

  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  footer JSONB NOT NULL DEFAULT '{}'::jsonb,

  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns safely for databases created with an older version.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_light TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_dark TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS page_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_site_verification TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_tag_manager_id TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS copyright_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer_quote TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer_disclaimer TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS legal_notice TEXT;

-- ------------------------------------------------------------------------------
-- Header / navigation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '_self',
  kind TEXT NOT NULL DEFAULT 'link',
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.header_ctas (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '_self',
  variant TEXT NOT NULL DEFAULT 'primary',
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Hero / about
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  headline TEXT,
  sub_headline TEXT,
  badge_text TEXT,
  typing_strings JSONB NOT NULL DEFAULT '[]'::jsonb,
  background_type TEXT DEFAULT 'image',
  background_image TEXT,
  background_video TEXT,
  featured_youtube_video_id TEXT,
  primary_cta_text TEXT,
  primary_cta_link TEXT,
  secondary_cta_text TEXT,
  secondary_cta_link TEXT,
  marquee_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.about_profile (
  id TEXT PRIMARY KEY DEFAULT 'current',
  badge TEXT,
  heading TEXT,
  highlight_text TEXT,
  biography JSONB NOT NULL DEFAULT '[]'::jsonb,
  profile_image TEXT,
  experience_years INTEGER,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  resume_url TEXT,
  resume_label TEXT,
  location TEXT,
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Services / portfolio / media
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  icon TEXT,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_categories (
  name TEXT PRIMARY KEY,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  cover_image TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  category TEXT,
  client_name TEXT,
  year TEXT,
  completion_date DATE,
  cover_image TEXT,
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS public.projects_slug_unique_idx;
CREATE INDEX IF NOT EXISTS projects_slug_idx
  ON public.projects(slug)
  WHERE slug IS NOT NULL AND slug <> '';

CREATE TABLE IF NOT EXISTS public.project_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  caption TEXT,
  platform TEXT DEFAULT 'youtube',
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_gallery (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_tags (
  project_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, tag)
);

CREATE TABLE IF NOT EXISTS public.featured_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  category TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  client TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  caption TEXT,
  client TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_logos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id TEXT PRIMARY KEY,
  step_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Resume/timeline, skills, testimonials
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('experience', 'education')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  location TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  proficiency INTEGER CHECK (proficiency IS NULL OR (proficiency >= 0 AND proficiency <= 100)),
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  position TEXT,
  company TEXT,
  avatar TEXT,
  testimonial_body TEXT NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Footer, section headers and visibility
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.footer_links (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '_self',
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.section_headers (
  section_key TEXT PRIMARY KEY,
  badge TEXT,
  title TEXT,
  description TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.section_visibility (
  section_key TEXT PRIMARY KEY,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Inbound inquiry log (not part of public site_content)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  budget TEXT,
  message TEXT,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx
  ON public.contact_inquiries(created_at DESC);

-- ------------------------------------------------------------------------------
-- Projection trigger: one atomic CMS publish updates every normalized table
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_shpixels_site_projections()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_row JSONB;
  project_ord BIGINT;
BEGIN
  IF NEW.id <> 'current' THEN
    RETURN NEW;
  END IF;

  -- Generic top-level section rows.
  INSERT INTO public.site_sections (section_key, data, version, updated_at)
  SELECT entry.key, entry.value, NEW.version, COALESCE(NEW.updated_at, NOW())
  FROM jsonb_each(COALESCE(NEW.data, '{}'::jsonb)) AS entry
  ON CONFLICT (section_key) DO UPDATE
  SET data = EXCLUDED.data,
      version = EXCLUDED.version,
      updated_at = EXCLUDED.updated_at;

  DELETE FROM public.site_sections
  WHERE section_key NOT IN (
    SELECT key FROM jsonb_each(COALESCE(NEW.data, '{}'::jsonb))
  );

  -- Global settings.
  INSERT INTO public.site_settings (
    id, site_name, logo_text, logo_subtext, logo_image, logo_light, logo_dark,
    favicon, accent_color,
    page_title, meta_description, og_title, og_description, og_image, canonical_url,
    google_site_verification, google_analytics_id, google_tag_manager_id, meta_pixel_id,
    email, phone, whatsapp, location, address, working_hours,
    instagram, youtube, tiktok, linkedin, behance,
    cta_heading, cta_subtitle, response_time_note,
    copyright_text, footer_quote, footer_disclaimer, legal_notice,
    branding, seo, contact, footer, version, updated_at
  )
  VALUES (
    'current',
    NEW.data #>> '{branding,siteName}',
    NEW.data #>> '{branding,logoText}',
    NEW.data #>> '{branding,logoSubtext}',
    NEW.data #>> '{branding,logoImage}',
    NEW.data #>> '{branding,logoLight}',
    NEW.data #>> '{branding,logoDark}',
    COALESCE(NEW.data #>> '{branding,favicon}', NEW.data #>> '{seo,favicon}'),
    NEW.data #>> '{branding,accentColor}',
    NEW.data #>> '{seo,pageTitle}',
    NEW.data #>> '{seo,metaDescription}',
    NEW.data #>> '{seo,ogTitle}',
    NEW.data #>> '{seo,ogDescription}',
    NEW.data #>> '{seo,ogImage}',
    NEW.data #>> '{seo,canonicalUrl}',
    NEW.data #>> '{seo,googleSiteVerification}',
    NEW.data #>> '{seo,googleAnalyticsId}',
    NEW.data #>> '{seo,googleTagManagerId}',
    NEW.data #>> '{seo,metaPixelId}',
    NEW.data #>> '{contact,email}',
    NEW.data #>> '{contact,phone}',
    NEW.data #>> '{contact,whatsapp}',
    NEW.data #>> '{contact,location}',
    NEW.data #>> '{contact,address}',
    NEW.data #>> '{contact,workingHours}',
    NEW.data #>> '{contact,instagram}',
    NEW.data #>> '{contact,youtube}',
    NEW.data #>> '{contact,tiktok}',
    NEW.data #>> '{contact,linkedin}',
    NEW.data #>> '{contact,behance}',
    NEW.data #>> '{contact,ctaHeading}',
    NEW.data #>> '{contact,ctaSubtitle}',
    NEW.data #>> '{contact,responseTimeNote}',
    NEW.data #>> '{footer,copyrightText}',
    NEW.data #>> '{footer,quote}',
    NEW.data #>> '{footer,disclaimer}',
    NEW.data #>> '{footer,legalNotice}',
    COALESCE(NEW.data -> 'branding', '{}'::jsonb),
    COALESCE(NEW.data -> 'seo', '{}'::jsonb),
    COALESCE(NEW.data -> 'contact', '{}'::jsonb),
    COALESCE(NEW.data -> 'footer', '{}'::jsonb),
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    logo_text = EXCLUDED.logo_text,
    logo_subtext = EXCLUDED.logo_subtext,
    logo_image = EXCLUDED.logo_image,
    logo_light = EXCLUDED.logo_light,
    logo_dark = EXCLUDED.logo_dark,
    favicon = EXCLUDED.favicon,
    accent_color = EXCLUDED.accent_color,
    page_title = EXCLUDED.page_title,
    meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title,
    og_description = EXCLUDED.og_description,
    og_image = EXCLUDED.og_image,
    canonical_url = EXCLUDED.canonical_url,
    google_site_verification = EXCLUDED.google_site_verification,
    google_analytics_id = EXCLUDED.google_analytics_id,
    google_tag_manager_id = EXCLUDED.google_tag_manager_id,
    meta_pixel_id = EXCLUDED.meta_pixel_id,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    working_hours = EXCLUDED.working_hours,
    instagram = EXCLUDED.instagram,
    youtube = EXCLUDED.youtube,
    tiktok = EXCLUDED.tiktok,
    linkedin = EXCLUDED.linkedin,
    behance = EXCLUDED.behance,
    cta_heading = EXCLUDED.cta_heading,
    cta_subtitle = EXCLUDED.cta_subtitle,
    response_time_note = EXCLUDED.response_time_note,
    copyright_text = EXCLUDED.copyright_text,
    footer_quote = EXCLUDED.footer_quote,
    footer_disclaimer = EXCLUDED.footer_disclaimer,
    legal_notice = EXCLUDED.legal_notice,
    branding = EXCLUDED.branding,
    seo = EXCLUDED.seo,
    contact = EXCLUDED.contact,
    footer = EXCLUDED.footer,
    version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;

  -- Clear projection collections and rebuild them from the same canonical snapshot.
  DELETE FROM public.navigation_items;
  DELETE FROM public.header_ctas;
  DELETE FROM public.services;
  DELETE FROM public.project_categories;
  DELETE FROM public.project_videos;
  DELETE FROM public.project_gallery;
  DELETE FROM public.project_links;
  DELETE FROM public.project_tags;
  DELETE FROM public.projects;
  DELETE FROM public.featured_videos;
  DELETE FROM public.gallery_items;
  DELETE FROM public.client_logos;
  DELETE FROM public.workflow_steps;
  DELETE FROM public.timeline_items;
  DELETE FROM public.skills;
  DELETE FROM public.testimonials;
  DELETE FROM public.footer_links;
  DELETE FROM public.section_headers;
  DELETE FROM public.section_visibility;

  -- Navigation.
  INSERT INTO public.navigation_items
    (id, label, href, target, kind, display_order, visible, raw, version, updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'nav-' || x.ord::text),
    COALESCE(x.item->>'label',''),
    COALESCE(x.item->>'href','#'),
    COALESCE(x.item->>'target','_self'),
    COALESCE(x.item->>'kind','link'),
    COALESCE((x.item->>'order')::INTEGER, x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN, TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'navigation','[]'::jsonb))
    WITH ORDINALITY AS x(item, ord);

  -- Header CTAs.
  INSERT INTO public.header_ctas
    (id, label, url, target, variant, display_order, visible, raw, version, updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'cta-' || x.ord::text),
    COALESCE(x.item->>'label',''),
    COALESCE(x.item->>'url','#contact'),
    COALESCE(x.item->>'target','_self'),
    COALESCE(x.item->>'variant','primary'),
    COALESCE((x.item->>'order')::INTEGER, x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN, TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'headerCtas','[]'::jsonb))
    WITH ORDINALITY AS x(item, ord);

  -- Hero.
  INSERT INTO public.hero_settings (
    id, headline, sub_headline, badge_text, typing_strings, background_type,
    background_image, background_video, featured_youtube_video_id,
    primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link,
    marquee_items, raw, version, updated_at
  )
  VALUES (
    'current',
    NEW.data #>> '{hero,title}',
    NEW.data #>> '{hero,subtitle}',
    NEW.data #>> '{hero,badgeText}',
    COALESCE(NEW.data #> '{hero,typingStrings}','[]'::jsonb),
    COALESCE(NEW.data #>> '{hero,backgroundType}','image'),
    NEW.data #>> '{hero,bgImageUrl}',
    NEW.data #>> '{hero,backgroundVideoUrl}',
    NEW.data #>> '{hero,featuredVideoId}',
    NEW.data #>> '{hero,primaryCtaText}',
    NEW.data #>> '{hero,primaryCtaLink}',
    NEW.data #>> '{hero,secondaryCtaText}',
    NEW.data #>> '{hero,secondaryCtaLink}',
    COALESCE(NEW.data #> '{hero,marqueeItems}','[]'::jsonb),
    COALESCE(NEW.data->'hero','{}'::jsonb),
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    headline=EXCLUDED.headline,
    sub_headline=EXCLUDED.sub_headline,
    badge_text=EXCLUDED.badge_text,
    typing_strings=EXCLUDED.typing_strings,
    background_type=EXCLUDED.background_type,
    background_image=EXCLUDED.background_image,
    background_video=EXCLUDED.background_video,
    featured_youtube_video_id=EXCLUDED.featured_youtube_video_id,
    primary_cta_text=EXCLUDED.primary_cta_text,
    primary_cta_link=EXCLUDED.primary_cta_link,
    secondary_cta_text=EXCLUDED.secondary_cta_text,
    secondary_cta_link=EXCLUDED.secondary_cta_link,
    marquee_items=EXCLUDED.marquee_items,
    raw=EXCLUDED.raw,
    version=EXCLUDED.version,
    updated_at=EXCLUDED.updated_at;

  -- About/profile.
  INSERT INTO public.about_profile (
    id, badge, heading, highlight_text, biography, profile_image, experience_years,
    specialties, tools, resume_url, resume_label, location, stats, raw, version, updated_at
  )
  VALUES (
    'current',
    NEW.data #>> '{about,badge}',
    NEW.data #>> '{about,heading}',
    NEW.data #>> '{about,highlightText}',
    COALESCE(NEW.data #> '{about,bioParagraphs}','[]'::jsonb),
    NEW.data #>> '{about,profileImage}',
    NULLIF(NEW.data #>> '{about,experienceYears}','')::INTEGER,
    COALESCE(NEW.data #> '{about,specialties}','[]'::jsonb),
    COALESCE(NEW.data #> '{about,tools}','[]'::jsonb),
    NEW.data #>> '{about,resumeUrl}',
    NEW.data #>> '{about,resumeLabel}',
    NEW.data #>> '{about,location}',
    COALESCE(NEW.data #> '{about,stats}','[]'::jsonb),
    COALESCE(NEW.data->'about','{}'::jsonb),
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    badge=EXCLUDED.badge,
    heading=EXCLUDED.heading,
    highlight_text=EXCLUDED.highlight_text,
    biography=EXCLUDED.biography,
    profile_image=EXCLUDED.profile_image,
    experience_years=EXCLUDED.experience_years,
    specialties=EXCLUDED.specialties,
    tools=EXCLUDED.tools,
    resume_url=EXCLUDED.resume_url,
    resume_label=EXCLUDED.resume_label,
    location=EXCLUDED.location,
    stats=EXCLUDED.stats,
    raw=EXCLUDED.raw,
    version=EXCLUDED.version,
    updated_at=EXCLUDED.updated_at;

  -- Services.
  INSERT INTO public.services
    (id,title,subtitle,description,category,icon,deliverables,display_order,visible,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'service-' || x.ord::text),
    COALESCE(x.item->>'title',''),
    x.item->>'subtitle',
    x.item->>'description',
    x.item->>'category',
    x.item->>'icon',
    COALESCE(x.item->'deliverables', x.item->'features', '[]'::jsonb),
    COALESCE((x.item->>'order')::INTEGER, x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN, TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'services','[]'::jsonb))
    WITH ORDINALITY AS x(item, ord);

  -- Categories.
  INSERT INTO public.project_categories
    (name,name_ar,description,description_ar,cover_image,color,display_order,raw,version,updated_at)
  SELECT
    x.name,
    (NEW.data->'categoryDetails'->x.name)->>'nameAr',
    (NEW.data->'categoryDetails'->x.name)->>'description',
    (NEW.data->'categoryDetails'->x.name)->>'descriptionAr',
    (NEW.data->'categoryDetails'->x.name)->>'coverImage',
    (NEW.data->'categoryDetails'->x.name)->>'color',
    x.ord::INTEGER,
    COALESCE(NEW.data->'categoryDetails'->x.name,'{}'::jsonb),
    NEW.version,
    COALESCE(NEW.updated_at, NOW())
  FROM (
    SELECT value #>> '{}' AS name, ord
    FROM jsonb_array_elements(COALESCE(NEW.data->'categories','[]'::jsonb))
      WITH ORDINALITY AS c(value, ord)
  ) AS x
  WHERE x.name IS NOT NULL AND x.name <> '';

  -- Projects and their YouTube/gallery/tag child rows.
  INSERT INTO public.projects
    (id,title,slug,description,category,client_name,year,completion_date,cover_image,
     live_url,github_url,featured,published,display_order,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'project-' || x.ord::text),
    COALESCE(x.item->>'title',''),
    x.item->>'slug',
    x.item->>'description',
    x.item->>'category',
    x.item->>'client',
    x.item->>'year',
    NULLIF(x.item->>'completionDate','')::DATE,
    x.item->>'coverImage',
    x.item->>'liveUrl',
    x.item->>'githubUrl',
    COALESCE((x.item->>'featured')::BOOLEAN,FALSE),
    COALESCE((x.item->>'published')::BOOLEAN,TRUE),
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'projects','[]'::jsonb))
    WITH ORDINALITY AS x(item, ord);

  FOR project_row, project_ord IN
    SELECT item, ord
    FROM jsonb_array_elements(COALESCE(NEW.data->'projects','[]'::jsonb))
      WITH ORDINALITY AS x(item,ord)
  LOOP
    INSERT INTO public.project_videos
      (id,project_id,title,youtube_url,youtube_video_id,caption,platform,display_order,raw,version,updated_at)
    SELECT
      COALESCE(NULLIF(v.item->>'id',''), COALESCE(project_row->>'id','project-'||project_ord::text) || '-video-' || v.ord::text),
      COALESCE(project_row->>'id','project-'||project_ord::text),
      v.item->>'title',
      COALESCE(v.item->>'youtubeUrl',''),
      COALESCE(v.item->>'videoId',''),
      v.item->>'caption',
      COALESCE(v.item->>'platform','youtube'),
      v.ord::INTEGER,
      v.item,
      NEW.version,
      COALESCE(NEW.updated_at,NOW())
    FROM jsonb_array_elements(COALESCE(project_row->'videos','[]'::jsonb))
      WITH ORDINALITY AS v(item,ord);

    INSERT INTO public.project_gallery
      (id,project_id,image_url,display_order,version,updated_at)
    SELECT
      COALESCE(project_row->>'id','project-'||project_ord::text) || '-gallery-' || g.ord::text,
      COALESCE(project_row->>'id','project-'||project_ord::text),
      g.value #>> '{}',
      g.ord::INTEGER,
      NEW.version,
      COALESCE(NEW.updated_at,NOW())
    FROM jsonb_array_elements(COALESCE(project_row->'gallery','[]'::jsonb))
      WITH ORDINALITY AS g(value,ord)
    WHERE (g.value #>> '{}') IS NOT NULL;

    INSERT INTO public.project_links
      (id,project_id,label,url,display_order,version,updated_at)
    SELECT
      COALESCE(project_row->>'id','project-'||project_ord::text) || '-link-' || l.ord::text,
      COALESCE(project_row->>'id','project-'||project_ord::text),
      COALESCE(l.item->>'label','Link'),
      COALESCE(l.item->>'url',''),
      l.ord::INTEGER,
      NEW.version,
      COALESCE(NEW.updated_at,NOW())
    FROM jsonb_array_elements(COALESCE(project_row->'externalLinks','[]'::jsonb))
      WITH ORDINALITY AS l(item,ord)
    WHERE COALESCE(l.item->>'url','') <> '';

    INSERT INTO public.project_tags
      (project_id,tag,display_order,version,updated_at)
    SELECT
      COALESCE(project_row->>'id','project-'||project_ord::text),
      t.value #>> '{}',
      t.ord::INTEGER,
      NEW.version,
      COALESCE(NEW.updated_at,NOW())
    FROM jsonb_array_elements(COALESCE(project_row->'techStack','[]'::jsonb))
      WITH ORDINALITY AS t(value,ord)
    WHERE (t.value #>> '{}') IS NOT NULL;
  END LOOP;

  -- Featured YouTube videos.
  INSERT INTO public.featured_videos
    (id,title,youtube_url,youtube_video_id,thumbnail,description,category,featured,visible,
     display_order,caption,client,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'video-' || x.ord::text),
    COALESCE(x.item->>'title',''),
    COALESCE(x.item->>'youtubeUrl',''),
    COALESCE(x.item->>'videoId',''),
    x.item->>'thumbnail',
    x.item->>'description',
    x.item->>'category',
    COALESCE((x.item->>'featured')::BOOLEAN,FALSE),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    x.item->>'caption',
    x.item->>'client',
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'featuredVideos','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Gallery.
  INSERT INTO public.gallery_items
    (id,title,image_url,category,caption,client,display_order,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'gallery-' || x.ord::text),
    x.item->>'title',
    COALESCE(x.item->>'image',''),
    x.item->>'category',
    x.item->>'caption',
    x.item->>'client',
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'gallery','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Client logos.
  INSERT INTO public.client_logos
    (id,name,logo_url,website_url,display_order,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'client-' || x.ord::text),
    COALESCE(x.item->>'name',''),
    COALESCE(x.item->>'logoUrl',x.item->>'logo'),
    COALESCE(x.item->>'websiteUrl',x.item->>'website'),
    x.ord::INTEGER,
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'clientLogos','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Workflow.
  INSERT INTO public.workflow_steps
    (id,step_number,title,description,icon,display_order,raw,version,updated_at)
  SELECT
    'workflow-' || x.ord::text,
    x.item->>'number',
    COALESCE(x.item->>'title',''),
    x.item->>'description',
    x.item->>'icon',
    x.ord::INTEGER,
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'workflow','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Experience.
  INSERT INTO public.timeline_items
    (id,item_type,title,organization,start_date,end_date,is_current,description,location,
     display_order,visible,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'experience-' || x.ord::text),
    'experience',
    COALESCE(x.item->>'title',''),
    COALESCE(x.item->>'organization',''),
    x.item->>'startDate',
    x.item->>'endDate',
    COALESCE((x.item->>'isCurrent')::BOOLEAN,FALSE),
    x.item->>'description',
    x.item->>'location',
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'experience','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Education.
  INSERT INTO public.timeline_items
    (id,item_type,title,organization,start_date,end_date,is_current,description,location,
     display_order,visible,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'education-' || x.ord::text),
    'education',
    COALESCE(x.item->>'title',''),
    COALESCE(x.item->>'organization',''),
    x.item->>'startDate',
    x.item->>'endDate',
    COALESCE((x.item->>'isCurrent')::BOOLEAN,FALSE),
    x.item->>'description',
    x.item->>'location',
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'education','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Skills.
  INSERT INTO public.skills
    (id,name,category,proficiency,icon,display_order,visible,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'skill-' || x.ord::text),
    COALESCE(x.item->>'name',''),
    x.item->>'category',
    NULLIF(x.item->>'proficiency','')::INTEGER,
    x.item->>'icon',
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'skills','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Testimonials.
  INSERT INTO public.testimonials
    (id,client_name,position,company,avatar,testimonial_body,rating,display_order,visible,
     raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'testimonial-' || x.ord::text),
    COALESCE(x.item->>'clientName',''),
    x.item->>'position',
    x.item->>'company',
    x.item->>'avatar',
    COALESCE(x.item->>'body',''),
    NULLIF(x.item->>'rating','')::INTEGER,
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'testimonials','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Footer links.
  INSERT INTO public.footer_links
    (id,label,url,target,display_order,visible,raw,version,updated_at)
  SELECT
    COALESCE(NULLIF(x.item->>'id',''), 'footer-link-' || x.ord::text),
    COALESCE(x.item->>'label',''),
    COALESCE(x.item->>'url','#'),
    COALESCE(x.item->>'target','_self'),
    COALESCE((x.item->>'order')::INTEGER,x.ord::INTEGER),
    COALESCE((x.item->>'visible')::BOOLEAN,TRUE),
    x.item,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_array_elements(COALESCE(NEW.data->'footerLinks','[]'::jsonb))
    WITH ORDINALITY AS x(item,ord);

  -- Section headers.
  INSERT INTO public.section_headers
    (section_key,badge,title,description,raw,version,updated_at)
  SELECT
    x.key,
    x.value->>'badge',
    x.value->>'title',
    x.value->>'description',
    x.value,
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_each(COALESCE(NEW.data->'sectionHeaders','{}'::jsonb)) AS x(key,value);

  -- Section visibility.
  INSERT INTO public.section_visibility
    (section_key,visible,version,updated_at)
  SELECT
    x.key,
    COALESCE((x.value #>> '{}')::BOOLEAN,TRUE),
    NEW.version,
    COALESCE(NEW.updated_at,NOW())
  FROM jsonb_each(COALESCE(NEW.data->'sectionVisibility','{}'::jsonb)) AS x(key,value);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_shpixels_site_projections_trigger ON public.site_content;
CREATE TRIGGER sync_shpixels_site_projections_trigger
AFTER INSERT OR UPDATE OF data, version, updated_at
ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.sync_shpixels_site_projections();

-- Backfill all projection tables from the current canonical row.
UPDATE public.site_content SET updated_at = updated_at WHERE id = 'current';

-- ------------------------------------------------------------------------------
-- Security / RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.header_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'site_content','site_sections','site_settings','navigation_items','header_ctas',
        'hero_settings','about_profile','services','project_categories','projects',
        'project_videos','project_gallery','project_links','project_tags','featured_videos','gallery_items',
        'client_logos','workflow_steps','timeline_items','skills','testimonials',
        'footer_links','section_headers','section_visibility','contact_inquiries'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- Public site data is readable by anon/authenticated clients.
GRANT SELECT ON
  public.site_content,
  public.site_sections,
  public.site_settings,
  public.navigation_items,
  public.header_ctas,
  public.hero_settings,
  public.about_profile,
  public.services,
  public.project_categories,
  public.projects,
  public.project_videos,
  public.project_gallery,
  public.project_links,
  public.project_tags,
  public.featured_videos,
  public.gallery_items,
  public.client_logos,
  public.workflow_steps,
  public.timeline_items,
  public.skills,
  public.testimonials,
  public.footer_links,
  public.section_headers,
  public.section_visibility
TO anon, authenticated;

CREATE POLICY "Public read site content" ON public.site_content
  FOR SELECT TO anon, authenticated USING (id = 'current');
CREATE POLICY "Public read site sections" ON public.site_sections
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (id = 'current');
CREATE POLICY "Public read navigation" ON public.navigation_items
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read header ctas" ON public.header_ctas
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read hero" ON public.hero_settings
  FOR SELECT TO anon, authenticated USING (id = 'current');
CREATE POLICY "Public read about" ON public.about_profile
  FOR SELECT TO anon, authenticated USING (id = 'current');
CREATE POLICY "Public read services" ON public.services
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read categories" ON public.project_categories
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read projects" ON public.projects
  FOR SELECT TO anon, authenticated USING (published = TRUE);
CREATE POLICY "Public read project videos" ON public.project_videos
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read project gallery" ON public.project_gallery
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read project links" ON public.project_links
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read project tags" ON public.project_tags
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read featured videos" ON public.featured_videos
  FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Public read gallery" ON public.gallery_items
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read client logos" ON public.client_logos
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read workflow" ON public.workflow_steps
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read timeline" ON public.timeline_items
  FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Public read skills" ON public.skills
  FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Public read footer links" ON public.footer_links
  FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Public read section headers" ON public.section_headers
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read section visibility" ON public.section_visibility
  FOR SELECT TO anon, authenticated USING (TRUE);

-- Projection tables and canonical content are server-write-only.
REVOKE INSERT, UPDATE, DELETE ON
  public.site_content,
  public.site_sections,
  public.site_settings,
  public.navigation_items,
  public.header_ctas,
  public.hero_settings,
  public.about_profile,
  public.services,
  public.project_categories,
  public.projects,
  public.project_videos,
  public.project_gallery,
  public.project_links,
  public.project_tags,
  public.featured_videos,
  public.gallery_items,
  public.client_logos,
  public.workflow_steps,
  public.timeline_items,
  public.skills,
  public.testimonials,
  public.footer_links,
  public.section_headers,
  public.section_visibility
FROM anon, authenticated;

-- Inquiries are private. The server-side API uses the Supabase secret/service key.
REVOKE ALL ON public.contact_inquiries FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- Realtime on the canonical document only. All public clients receive one atomic
-- version change and re-fetch a consistent snapshot.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Optional Supabase Storage bucket used by CMS asset upload endpoint.
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', TRUE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ------------------------------------------------------------------------------
-- Verification queries
-- ------------------------------------------------------------------------------
-- SELECT id, version, published_at, updated_at FROM public.site_content;
-- SELECT * FROM public.site_settings WHERE id='current';
-- SELECT * FROM public.navigation_items ORDER BY display_order;
-- SELECT * FROM public.projects ORDER BY display_order;
-- SELECT * FROM public.project_videos ORDER BY project_id, display_order;
-- SELECT * FROM public.project_links ORDER BY project_id, display_order;
-- SELECT * FROM public.timeline_items ORDER BY item_type, display_order;
-- SELECT * FROM public.skills ORDER BY category, display_order;
-- SELECT * FROM public.testimonials ORDER BY display_order;
-- SELECT * FROM public.contact_inquiries ORDER BY created_at DESC;
-- ==============================================================================
