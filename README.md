# SHPIXELS — Portfolio & Full-Site CMS

A high-performance portfolio and full-site content management system built with React 19, TypeScript, Vite, Tailwind CSS, Supabase, and Vercel. The CMS controls the public website, normalized database projections, Supabase Storage assets, YouTube embeds, and inbound inquiry records.

---

## Supabase email/password administrator setup

The CMS login at `/admin` uses **Supabase Authentication** with an email address and password. The browser sends the credentials only to the server-side `/api/admin-login` endpoint; the server verifies them with Supabase Auth and then creates an eight-hour signed HttpOnly CMS session cookie.

### One-time setup

1. In **Supabase → Authentication → Users**, create the administrator user with the email and password you want to use for the CMS.
2. In **Vercel → Project → Settings → Environment Variables**, add:
   - `ADMIN_EMAIL` — exactly the same email as the Supabase Authentication user.
   - `ADMIN_SESSION_SECRET` — a private random string of at least 32 characters.
3. The Vercel Supabase integration should provide the Supabase URL and publishable/secret keys automatically. This code supports `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and the compatible legacy aliases.
4. Redeploy after changing Vercel environment variables.

Only the account matching `ADMIN_EMAIL` can receive a CMS session, even if other Supabase Authentication users exist. Password changes are managed in Supabase Authentication; there is no hardcoded CMS password in the repository.

Run `supabase-schema.sql` in Supabase SQL Editor for the content table and write policies. Secure publishing continues to require the server-side Supabase secret/service-role credential and a valid CMS session.

Run `npm install`, `npm run dev` (development), or `npm run build` then `npm start` with NODE_ENV=production. Checks: `npm run lint` and `npm test`.

The dashboard supports website content CRUD, component visibility, advanced JSON editing, and revision-aware publishing.

---

## Database persistence architecture

Every CMS edit automatically persists to Supabase after a short debounce. `public.site_content` remains the atomic source of truth, and a PostgreSQL trigger projects the same version into normalized tables so every part of the site can be inspected/queryed independently.

The schema includes global settings and sections plus dedicated tables for navigation, header CTAs, hero data, about/profile data, services, project categories, projects, project YouTube videos, project galleries, project links, project tech tags, featured videos, gallery items, client logos, workflow, experience/education, skills, testimonials, footer links, section headers, visibility settings, and the private contact inquiry log. CMS image/PDF uploads are stored in the public `site-media` Supabase Storage bucket; only authenticated CMS server routes can upload.

### Required database migration

For a normal schema update:

1. Open **Supabase → SQL Editor → New query**.
2. Run the complete latest `supabase-schema.sql` from this repository.
3. Open the CMS and make one save/publish action. This backfills all normalized projection tables from `site_content`.
4. Run `supabase-verify.sql` and use **Site Settings → Test Database** or `/api/diagnostics` to verify the schema and projections.

### Repairing an older/stale Supabase trigger

If Supabase reports `21000: DELETE requires a WHERE clause`, `42702: column reference "ord" is ambiguous`, or the CMS opens but publishing does not reach the database, the live project is still running an older database trigger. Use this exact order:

1. Run `supabase-repair-before-schema.sql`.
2. Immediately run the complete latest `supabase-schema.sql`.
3. Run `supabase-verify.sql`.
4. Publish the current site once from the CMS.
5. Run **Test Database** again.

The repair preflight removes stale `site_content` projection triggers/functions but does not delete the canonical website data. Do not use the CMS between the repair preflight and the full schema installation.

See `SUPABASE_UPDATE.md` for the complete recovery procedure, Vercel environment checklist, verification queries, and Storage/Realtime checks.

Do not manually edit projection tables as the normal CMS workflow. The canonical `site_content` publication is intentionally the single mutation path so all tables stay on the same version.

## 🚀 Quick Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

This project includes pre-configured `vercel.json` and serverless API handlers for zero-config Vercel deployment:

1. **Push to GitHub** (see instructions below).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository (`shpixels` or similar).
5. Vercel will automatically detect:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live on a `*.vercel.app` domain with instant global CDN caching and SSL.

---

### Option 2: Upload to GitHub

Follow these steps to initialize and push this codebase to your GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "feat: complete SHPIXELS portfolio with dedicated CMS dashboard"

# 4. Set main branch
git branch -M main

# 5. Link to your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript linter
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The application runs on `http://localhost:3000`.

---

## 📂 Project Structure

```
├── public/                 # Static assets, logos, and pre-seeded content.json
├── api/                    # Vercel serverless API handlers
├── src/
│   ├── components/
│   │   ├── admin/          # Comprehensive CMS Admin Dashboard
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── ProjectManager.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── SectionManager.tsx
│   │   │   ├── VideoManager.tsx
│   │   │   ├── MediaManager.tsx
│   │   │   ├── SiteSettings.tsx
│   │   │   ├── NavigationManager.tsx
│   │   │   ├── LinkManager.tsx
│   │   │   ├── SEOManager.tsx
│   │   │   ├── SiteDataManager.tsx
│   │   │   ├── InquiryManager.tsx
│   │   │   ├── BrandLogoManager.tsx
│   │   │   └── ExportManager.tsx
│   │   ├── common/         # Shared UI, uploaders, YouTube, social/theme utilities
│   │   └── public/         # Production-grade public portfolio components
│   │       ├── Header.tsx
│   │       ├── Hero.tsx
│   │       ├── Showreel.tsx
│   │       ├── ClientLogos.tsx
│   │       ├── About.tsx
│   │       ├── Services.tsx
│   │       ├── Portfolio.tsx
│   │       ├── ProjectPage.tsx
│   │       ├── Process.tsx
│   │       ├── Gallery.tsx
│   │       ├── Experience.tsx
│   │       ├── Skills.tsx
│   │       ├── Testimonials.tsx
│   │       ├── Contact.tsx
│   │       └── Footer.tsx
│   ├── context/
│   │   ├── ContentContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── data/
│   │   └── initialContent.ts
│   ├── types/
│   │   └── content.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase-schema.sql                 # Complete current database schema
├── supabase-repair-before-schema.sql   # Preflight repair for stale triggers
├── supabase-verify.sql                 # Read-only installation verification
├── SUPABASE_UPDATE.md                  # Full Supabase recovery/update guide
├── server.ts
├── vercel.json
└── package.json
```

---

## 🔐 Director Portal Access

- Access the administrative CMS at `/admin` or `/#admin`.
- The CMS allows you to:
  - Add, edit, reorder, categorize, feature, publish, and delete projects with YouTube embeds, galleries, slugs, live/GitHub URLs and tech tags.
  - Upload site images, logos, testimonial avatars, category covers and resume assets into Supabase Storage.
  - Manage experience, education, skills, testimonials, navigation/CTA targets, footer/legal links and contact details.
  - Manage the scrolling brand-logo marquee and upload logos from the device.
  - Review inbound contact inquiries and maintain their status/internal notes.
  - Rename the site in one place under **Settings → Site Name**.
  - Customize section texts, pipeline steps, SEO and analytics settings.
  - Export the complete content snapshot as JSON for backups.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
