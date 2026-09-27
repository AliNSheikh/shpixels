# MOGRAFIX — Cinematography Portfolio & CMS

A high-performance cinematic portfolio and dynamic content management portal built for filmmaker & director **Mohammad Abdallah**. Built with React 19, TypeScript, Vite, Tailwind CSS, and optimized for instant 4K media playback.

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
  - Rename the site in one place under **Settings → Site Name** — it updates the header, footer, and copyright line everywhere those aren't individually overridden.
  - Customize all section texts, pipeline steps, and client logos.
  - Toggle between English and Arabic.
  - Configure Google Analytics (GA4) and Google Search Console verification.
  - Export your complete content snapshot as JSON for backups.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
