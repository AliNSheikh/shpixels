import { getServerSupabase } from './_supabase.js';

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeCategorySlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^p{L}p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
}

function collectCategories(data: any): string[] {
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
  (Array.isArray(data?.featuredVideos) ? data.featuredVideos : [])
    .filter((video: any) => video?.visible !== false)
    .forEach((video: any) => add(video?.category));

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

    const categories = collectCategories(data);
    const baseUrl = String(data?.seo?.canonicalUrl || 'https://shpixels.vercel.app').replace(//$/, '');
    const lastModified = String(row?.updated_at || row?.published_at || new Date().toISOString()).slice(0, 10);

    const categoryUrls = categories.map((category) => {
      const slug = normalizeCategorySlug(category) || 'category';
      return `  <url>
    <loc>${xmlEscape(`${baseUrl}/categories/${encodeURIComponent(slug)}`)}</loc>
    <lastmod>${xmlEscape(lastModified)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
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
${categoryUrls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('[api/sitemap] Failed to generate sitemap:', error);
    return res.status(500).send('Unable to generate sitemap.');
  }
}
