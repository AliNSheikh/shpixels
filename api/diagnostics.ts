import { getServerSupabase, verifyAdminAuthorization } from './_supabase.js';

const EXPECTED_CMS_SECTIONS = [
  'seo',
  'branding',
  'navigation',
  'hero',
  'about',
  'services',
  'projects',
  'featuredVideos',
  'gallery',
  'workflow',
  'contact',
  'footer',
  'headerCtas',
  'experience',
  'education',
  'skills',
  'testimonials',
  'footerLinks',
  'sectionVisibility',
  'showreel',
  'categories',
  'categoryDetails',
  'clientLogos',
  'sectionHeaders'
] as const;

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';

  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';

  const anonKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const checks = {
    supabaseUrlConfigured: Boolean(supabaseUrl && supabaseUrl.trim()),
    serviceRoleKeyConfigured: Boolean(serviceRoleKey && serviceRoleKey.trim()),
    anonKeyConfigured: Boolean(anonKey && anonKey.trim()),
    databaseConnected: false,

    tableExists: false,
    rowCurrentExists: false,
    dataJsonbValid: false,

    sectionProjectionTableExists: false,
    settingsProjectionTableExists: false,
    sectionProjectionCount: 0,
    missingSectionKeys: [] as string[],

    brandingLogoStored: false,
    contactEmailStored: false,
    contactPhoneStored: false,
    contactLinksStored: false,
    settingsProjectionMatchesCanonical: false,

    currentVersion: 0,
    publishedAt: null as string | null,
    updatedAt: null as string | null,
    serverWritable: false,
    error: null as string | null
  };

  const { client, error: clientErr } = getServerSupabase();
  if (!client) {
    checks.error = clientErr || 'Server-side Supabase client could not be initialized.';
    return res.status(503).json({ success: false, checks });
  }

  try {
    const { data: rows, error: selectErr } = await client
      .from('site_content')
      .select('id, data, version, published_at, updated_at')
      .eq('id', 'current')
      .limit(1);

    if (selectErr) {
      checks.databaseConnected = true;
      if (selectErr.code === '42P01') {
        checks.tableExists = false;
        checks.error = 'Supabase table public.site_content does not exist. Run the latest supabase-schema.sql in Supabase SQL Editor.';
      } else {
        checks.tableExists = true;
        checks.error = `Supabase query error: ${selectErr.message}`;
      }
      return res.status(200).json({ success: false, checks });
    }

    checks.databaseConnected = true;
    checks.tableExists = true;

    if (!rows || rows.length === 0) {
      checks.error = 'Table site_content exists, but row with id=current is missing.';
      return res.status(200).json({ success: false, checks });
    }

    const row = rows[0];
    const canonical = row.data || {};

    checks.rowCurrentExists = true;
    checks.currentVersion = Number(row.version || 1);
    checks.publishedAt = row.published_at;
    checks.updatedAt = row.updated_at;
    checks.dataJsonbValid = Boolean(
      canonical &&
      typeof canonical === 'object' &&
      canonical.branding &&
      canonical.contact &&
      canonical.projects
    );

    const { data: sectionRows, error: sectionsErr } = await client
      .from('site_sections')
      .select('section_key, version');

    if (!sectionsErr) {
      checks.sectionProjectionTableExists = true;
      checks.sectionProjectionCount = sectionRows?.length || 0;
      const storedKeys = new Set((sectionRows || []).map((item: any) => String(item.section_key)));
      checks.missingSectionKeys = EXPECTED_CMS_SECTIONS.filter((key) => !storedKeys.has(key));
    } else if (sectionsErr.code === '42P01') {
      checks.missingSectionKeys = [...EXPECTED_CMS_SECTIONS];
    } else {
      checks.error = `site_sections audit failed: ${sectionsErr.message}`;
    }

    const { data: settingsRows, error: settingsErr } = await client
      .from('site_settings')
      .select('id, site_name, logo_image, favicon, email, phone, whatsapp, instagram, youtube, tiktok, linkedin, behance, version')
      .eq('id', 'current')
      .limit(1);

    if (!settingsErr) {
      checks.settingsProjectionTableExists = true;
      const settings = settingsRows?.[0];

      if (settings) {
        const canonicalLogo = String(canonical?.branding?.logoImage || '');
        const canonicalEmail = String(canonical?.contact?.email || '');
        const canonicalPhone = String(canonical?.contact?.phone || '');

        checks.brandingLogoStored = String(settings.logo_image || '') === canonicalLogo;
        checks.contactEmailStored = String(settings.email || '') === canonicalEmail;
        checks.contactPhoneStored = String(settings.phone || '') === canonicalPhone;

        const linkKeys = ['whatsapp', 'instagram', 'youtube', 'tiktok', 'linkedin', 'behance'] as const;
        checks.contactLinksStored = linkKeys.every(
          (key) => String(settings[key] || '') === String(canonical?.contact?.[key] || '')
        );

        checks.settingsProjectionMatchesCanonical =
          checks.brandingLogoStored &&
          checks.contactEmailStored &&
          checks.contactPhoneStored &&
          checks.contactLinksStored &&
          Number(settings.version || 0) === checks.currentVersion;
      }
    } else if (settingsErr.code !== '42P01') {
      checks.error = checks.error || `site_settings audit failed: ${settingsErr.message}`;
    }

    const isAdmin = await verifyAdminAuthorization(req);
    checks.serverWritable = Boolean(isAdmin && serviceRoleKey);

    if (!checks.dataJsonbValid) {
      checks.error = checks.error || 'The canonical site_content.data JSON is missing required CMS sections.';
    } else if (!checks.sectionProjectionTableExists || !checks.settingsProjectionTableExists) {
      checks.error = checks.error || 'Database projection tables are missing. Run the latest supabase-schema.sql.';
    } else if (checks.missingSectionKeys.length > 0) {
      checks.error = checks.error || `Some CMS sections are not projected yet: ${checks.missingSectionKeys.join(', ')}. Publish the site once after running the latest schema.`;
    } else if (!checks.settingsProjectionMatchesCanonical) {
      checks.error = checks.error || 'Branding/contact projection does not match the canonical site content. Publish the site again to resync.';
    }

    return res.status(200).json({
      success: !checks.error,
      expectedSections: EXPECTED_CMS_SECTIONS,
      checks
    });
  } catch (err: any) {
    checks.error = err.message || 'Diagnostic exception';
    return res.status(500).json({ success: false, checks });
  }
}
