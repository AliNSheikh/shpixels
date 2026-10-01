# SHPIXELS — Complete Supabase Update / Recovery

Use this procedure when the CMS can open but publishing fails, normalized tables do not update, the public site shows incomplete content, or Supabase reports errors such as:

- `21000: DELETE requires a WHERE clause`
- `42702: column reference "ord" is ambiguous`
- projection tables missing / out of sync
- `cms_projection_status` reports an older error

The repository code expects `public.site_content` to be the canonical source of truth. A database trigger projects the same version into normalized tables. The live Supabase database must therefore use the same schema revision as the deployed application.

## Before changing the database

In Supabase SQL Editor, make a backup copy of the canonical row:

```sql
SELECT id, data, version, published_at, updated_at
FROM public.site_content
WHERE id = 'current';
```

You can also export `site_content` from the Supabase Table Editor. Do not delete the `site_content` row.

## Required update sequence

### 1. Repair stale projection triggers

Open `supabase-repair-before-schema.sql` from this repository, copy the entire file, paste it into **Supabase → SQL Editor → New query**, and run it.

This removes historical `site_content` projection triggers/functions that can block the schema migration. It does **not** delete the website content stored in `site_content`.

Do not use the CMS between step 1 and step 2.

### 2. Install the complete current schema

Open the latest `supabase-schema.sql` from the `main` branch, copy the **entire** file, and run it in a new Supabase SQL Editor query.

The schema is designed to be rerunnable and upgrades older tables using `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. It recreates the current projection function/trigger, RLS policies, Realtime publication configuration, and the `site-media` Storage bucket/policies.

### 3. Apply the BRANDS + typography migration

Run the complete file:

`supabase-migration-2026-10-01-brands-font.sql`

This additive migration is safe to re-run. It performs the database changes required by the current public-site design and CMS:

- adds `google_font_url` and `font_family` to `public.site_settings`
- stores the Google Fonts URL and font-family values in canonical `site_content.data.branding`
- keeps those typography values synchronized into `site_settings`
- migrates the legacy `sectionVisibility.clientlogos` key to the dedicated `sectionVisibility.brands` key
- adds a `#brands` Navigation Menu item when one does not already exist, while preserving existing menu items and shifting their display order safely

No new BRANDS table is required: brand records continue to use the existing `public.client_logos` projection table.

### 4. Apply the category-video migration

Run the complete file:

`supabase-migration-2026-10-02-category-videos.sql`

This migration changes the active portfolio model from **Category → Projects → Videos** to **Category → YouTube Videos**:

- category pages read directly from the category video collection
- the existing `public.featured_videos` table remains the physical storage table for backward compatibility
- a semantic read view named `public.category_videos` is created
- an index is added for `category + display_order`
- YouTube videos nested inside legacy projects are copied into the canonical `featuredVideos` collection when they are not already present
- legacy project JSON and project tables are preserved as an archive so the migration is non-destructive

The CMS no longer requires the Projects tab or project records to publish videos. Add a YouTube URL, select a category, and publish.

### 5. Verify the database installation

Run the complete `supabase-verify.sql` file.

Expected results:

- `site_content` has one row with `id = current`.
- `has_legacy_delete_without_where = false`.
- `has_legacy_ambiguous_ord = false`.
- every expected table/view reports `exists = true`, including `category_videos`.
- `site_settings.google_font_url` and `site_settings.font_family` are readable.
- the Navigation projection contains the `#brands` entry when BRANDS is enabled in the menu.
- the `site-media` Storage bucket exists.
- `site_content` is present in `supabase_realtime`.
- after the next CMS publish, `cms_projection_status.ok = true` and its version equals `site_content.version`.

### 6. Check Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, confirm the production deployment has values for the Supabase project currently being updated:

- `SUPABASE_URL` (or the supported project URL alias)
- `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ADMIN_EMAIL`
- `ADMIN_SESSION_SECRET`

The `VITE_*` values are used by the browser for public reads/Realtime. The secret/service-role key is used only by Vercel server functions for authenticated CMS writes. Never put the secret/service-role key in a `VITE_*` variable.

If any environment variable is changed, redeploy the latest `main` branch in Vercel.

### 7. Publish the current CMS snapshot once

Open `/admin`, log in, then use **Site Settings → Publish Content to Supabase** (or **Save Site & Publish**) once.

This writes the current canonical document and triggers a complete rebuild of the normalized tables.

### 8. Run Test Database

Use **Site Settings → Test Database**. The current diagnostics detect:

- missing server/public Supabase configuration
- missing canonical row
- missing projection tables
- missing CMS sections
- branding/contact mismatches
- projection version mismatches
- stale safe-update trigger errors (`21000`)
- whether the authenticated Vercel server can write

A healthy installation reports the canonical content and projection tables synchronized.

## Search Console sitemap

The production sitemap is generated dynamically from the homepage and current public video-category routes. Individual legacy project URLs are no longer added to the sitemap. Submit this URL in Google Search Console:

`https://shpixels.vercel.app/sitemap.xml`

If you later change the canonical domain in the SEO manager, use the same `/sitemap.xml` path on the new canonical domain.

## Important notes

- Do not manually maintain the projection tables. Edit content in the CMS; `site_content` is the authoritative document.
- Do not run the default seed unless you intentionally want to replace an empty database with the template content.
- Uploaded logos/images/PDFs are stored in Supabase Storage (`site-media`); their public URLs are stored in the database.
- YouTube videos are stored as links/video IDs, not uploaded video files.
- If publishing still fails after this sequence, copy the exact result from **Test Database**, the row from `cms_projection_status`, and the error returned by the publish action. Those values identify whether the remaining issue is schema, Vercel environment configuration, authentication, or RLS/Storage.
