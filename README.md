# MOGRAFIX — Cinematography Portfolio & CMS

A high-performance cinematic portfolio and dynamic content management portal built for filmmaker & director **Mohammad Abdallah**. Built with React 19, TypeScript, Vite, Tailwind CSS, and optimized for instant 4K media playback.

---

<<<<<<< HEAD
=======
## 🗄️ Database Setup (Required — do this first)

The CMS stores the *entire* site in a single Supabase table (`public.site_content`,
one row, `id = 'current'`, a `data` JSONB column holding everything: hero,
about, projects, videos, gallery, branding/site name, SEO, contact info, nav,
footer, etc). Every admin "Save & Publish" writes the whole object here, and
every visitor's browser reads it back — plus a live Realtime subscription so
edits reflect instantly without a page refresh.

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. Open **SQL Editor → New Query**, paste the entire contents of
   [`supabase-schema.sql`](./supabase-schema.sql) from this repo, and click **Run**.
   This is the only SQL file the project needs — it's safe to re-run at any time.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — used by the browser (public reads + Realtime).
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY` — used by the serverless `/api/*` routes.
   - `SUPABASE_SERVICE_ROLE_KEY` *(recommended)* — lets the server write even if you later tighten Row Level Security.
5. Add the same variables in **Vercel → Project Settings → Environment Variables** before deploying, and redeploy after adding/changing them (Vercel only reads env vars at build/deploy time).
6. Open the site, log in to `/#admin`, go to **Settings → Database**, and click **Test Connection** to confirm it's reachable, then **Publish Content to Supabase** once to seed the row.

> ⚠️ Don't skip step 4/5. Without real credentials configured, the admin dashboard
> will clearly show "Not Configured" instead of silently failing — earlier
> versions of this project shipped with a hardcoded fallback project URL/key,
> which has been removed.

---

>>>>>>> 85bd45e (claude commit)
## 🚀 Quick Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

This project includes pre-configured `vercel.json` and serverless API handlers for zero-config Vercel deployment:

1. **Push to GitHub** (see instructions below).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository (`mografix` or similar).
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
git commit -m "feat: complete MOGRAFIX portfolio with dedicated CMS dashboard"

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
├── api/                    # Vercel serverless API handlers (content, health, save)
├── src/
│   ├── components/
│   │   ├── admin/          # Comprehensive Director CMS Admin Dashboard
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
│   │   │   └── ExportManager.tsx
│   │   ├── common/         # OptimizedImage, YouTubeEmbed, IconPicker
│   │   └── public/         # Production-grade public portfolio components
│   │       ├── Header.tsx
│   │       ├── Hero.tsx
│   │       ├── Showreel.tsx
│   │       ├── ClientLogos.tsx
│   │       ├── About.tsx
│   │       ├── Services.tsx
│   │       ├── Portfolio.tsx
│   │       ├── ProjectModal.tsx
│   │       ├── Process.tsx
│   │       ├── Gallery.tsx
│   │       ├── Contact.tsx
│   │       └── Footer.tsx
│   ├── context/
│   │   ├── ContentContext.tsx  # Centralized content store with local & server sync
│   │   └── LanguageContext.tsx # English / Arabic RTL toggle
│   ├── data/
│   │   ├── initialContent.ts   # Default project data and editorial copy
│   │   └── content.json
│   ├── types/
│   │   └── content.ts          # Strictly-typed TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── server.ts               # Express full-stack backend with Vite middleware
├── vercel.json             # Vercel configuration for SPA routing & API rewrites
└── package.json
```

---

## 🔐 Director Portal Access

- Access the administrative CMS at `/#admin` or click **"Director Portal"** in the website footer.
- The CMS allows you to:
  - Add, edit, reorder, and delete 4K video projects.
  - Upload custom media and camera stills directly.
<<<<<<< HEAD
=======
  - Rename the site in one place under **Settings → Site Name** — it updates the header, footer, and copyright line everywhere those aren't individually overridden.
>>>>>>> 85bd45e (claude commit)
  - Customize all section texts, pipeline steps, and client logos.
  - Toggle between English and Arabic.
  - Configure Google Analytics (GA4) and Google Search Console verification.
  - Export your complete content snapshot as JSON for backups.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
