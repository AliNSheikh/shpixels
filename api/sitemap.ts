import { getServerSupabase } from './_supabase.js';

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeSlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
}

function normalizeCategorySlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
}

function idSuffix(id: unknown): string {
  const normalized = normalizeSlug(id).replace(/^proj-/, '');
  const parts = normalized.split('-').filter(Boolean);
  return parts.slice(-2).join('-').slice(-18) || normalized.slice(-12) || 'work';
}

function projectSlugs(projects: any[]): Map<string, string> {
  const baseById = new Map<string, string>();
  const counts = new Map<string, number>();

  for (const project of projects) {
    const id = String(project.id || '');
    const base =
      normalizeSlug(project.slug) ||
      normalizeSlug(project.title) ||
      `project-${idSuffix(id)}`;

    baseById.set(id, base);
    counts.set(base, (counts.get(base) || 0) + 1);
  }

  const result = new Map<string, string>();
  const used = new Set<string>();

  for (const project of projects) {
    const id = String(project.id || '');
    const base = baseById.get(id) || `project-${idSuffix(id)}`;
    let slug = (counts.get(base) || 0) > 1 ? `${base}-${idSuffix(id)}` : base;
    let attempt = 2;

    while (used.has(slug)) {
      slug = `${base}-${idSuffix(id)}-${attempt}`;
      attempt += 1;
    }

    used.add(slug);
    result.set(id, slug);
  }

  return result;
}

function collectCategories(data: any, projects: any[]): string[] {
  const categories: string[] = [];
  const seen = new Set<string>();
  const add = (value: unknown) => {
    const name = String(value || '').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    categories.push(name);
  };

  (Array.isArray(data?.categories) ? data.categories : []).forEach(add);
  projects.forEach((project) => add(project?.category));
  return categories;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const { client, error: clientError } = getServerSupabase();
  if (!client) {
    return res.status(503).send(clientError || 'Supabase is not configured.');
  }

  try {
    const { data: rows, error } = await client
      .from('site_content')
      .select('data, updated_at, published_at')
      .eq('id', 'current')
      .limit(1);

    if (error) throw error;

    const row = rows?.[0];
    const data = row?.data || {};

    if (data?.seo?.sitemapEnabled === false) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).send('Sitemap is disabled in CMS SEO settings.');
    }

    const projects = (Array.isArray(data.projects) ? data.projects : [])
      .filter((project: any) => project?.published !== false);
    const categories = collectCategories(data, projects);

    const baseUrl = String(data?.seo?.canonicalUrl || 'https://shpixels.vercel.app')
      .replace(/\/$/, '');
    const lastModified = String(row?.updated_at || row?.published_at || new Date().toISOString())
      .slice(0, 10);
    const slugs = projectSlugs(projects);

    const categoryUrls = categories.map((category) => {
      const slug = normalizeCategorySlug(category) || 'category';
      return `  <url>
    <loc>${xmlEscape(`${baseUrl}/categories/${encodeURIComponent(slug)}`)}</loc>
    <lastmod>${xmlEscape(lastModified)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    const projectUrls = projects.map((project: any) => {
      const slug = slugs.get(String(project.id || '')) || normalizeSlug(project.title);
      return `  <url>
    <loc>${xmlEscape(`${baseUrl}/projects/${encodeURIComponent(slug)}`)}</loc>
    <lastmod>${xmlEscape(lastModified)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${project.featured ? '0.9' : '0.8'}</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(`${baseUrl}/`)}</loc>
    <lastmod>${xmlEscape(lastModified)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${[...categoryUrls, ...projectUrls].join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('[api/sitemap] Failed to generate sitemap:', error);
    return res.status(500).send('Unable to generate sitemap.');
  }
}
