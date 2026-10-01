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

### 3. Verify the database installation

Run the complete `supabase-verify.sql` file.

Expected results:

- `site_content` has one row with `id = current`.
- `has_legacy_delete_without_where = false`.
- `has_legacy_ambiguous_ord = false`.
- every expected table reports `exists = true`.
- the `site-media` Storage bucket exists.
- `site_content` is present in `supabase_realtime`.
- after the next CMS publish, `cms_projection_status.ok = true` and its version equals `site_content.version`.

### 4. Check Vercel environment variables

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

### 5. Publish the current CMS snapshot once

Open `/admin`, log in, then use **Site Settings → Publish Content to Supabase** (or **Save Site & Publish**) once.

This writes the current canonical document and triggers a complete rebuild of the normalized tables.

### 6. Run Test Database

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

## Important notes

- Do not manually maintain the projection tables. Edit content in the CMS; `site_content` is the authoritative document.
- Do not run the default seed unless you intentionally want to replace an empty database with the template content.
- Uploaded logos/images/PDFs are stored in Supabase Storage (`site-media`); their public URLs are stored in the database.
- YouTube videos are stored as links/video IDs, not uploaded video files.
- If publishing still fails after this sequence, copy the exact result from **Test Database**, the row from `cms_projection_status`, and the error returned by the publish action. Those values identify whether the remaining issue is schema, Vercel environment configuration, authentication, or RLS/Storage.
