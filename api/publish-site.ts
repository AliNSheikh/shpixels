import { getServerSupabase, validateContentPayload, verifyAdminAuthorization } from './_supabase.js';

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Verify admin authorization
  if (!(await verifyAdminAuthorization(req))) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token or session required for publishing.'
    });
  }

  // 2. Validate payload
  const rawPayload = { ...(req.body?.data || req.body) };
  delete rawPayload.adminAuth;
  delete rawPayload.supabaseConfig;
  const validation = validateContentPayload(rawPayload);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({
      success: false,
      error: 'Secure publishing needs SUPABASE_SECRET_KEY (Vercel Supabase integration) or legacy SUPABASE_SERVICE_ROLE_KEY.'
    });
  }
  // 3. Connect to Supabase
  const { client, error: clientErr } = getServerSupabase();
  if (!client) {
    return res.status(503).json({
      success: false,
      error: clientErr || 'Server-side Supabase client could not be initialized.'
    });
  }

  try {
    // 4. Fetch current version to increment atomically
    const { data: currentRows, error: readError } = await client
      .from('site_content')
      .select('version')
      .eq('id', 'current')
      .limit(1);

    if (readError) return res.status(503).json({ success: false, error: 'Unable to read the current revision.' });
    const currentVersion = Number(currentRows?.[0]?.version || 0);
    if (currentRows?.length && req.body?.expectedVersion !== currentVersion) {
      return res.status(409).json({ success: false, error: 'The website changed since this draft was loaded. Export your draft, reload the latest content, then apply your edits.' });
    }
    const nextVersion = currentVersion + 1;
    const now = new Date().toISOString();

    const note = req.body?.note || 'Published from SHPIXELS Admin CMS';

    // Make every CMS-managed section explicit in the canonical JSON document.
    // This protects older clients/imports that may not yet contain newer optional
    // sections and guarantees that the database projection trigger sees them.
    const completePayload = {
      sectionVisibility: {},
      showreel: { caption: '', specs: [] },
      headerCtas: [],
      experience: [],
      education: [],
      skills: [],
      testimonials: [],
      footerLinks: [],
      categories: [],
      categoryDetails: {},
      clientLogos: [],
      sectionHeaders: {},
      ...rawPayload
    };

    // Build mutated payload with authoritative version and history
    const finalContent = {
      ...completePayload,
      lastPublished: now,
      publicationInfo: {
        publishedAt: now,
        version: nextVersion,
        publishedBy: 'Admin'
      },
      publicationHistory: [
        {
          id: `pub-${Date.now()}`,
          publishedAt: now,
          version: nextVersion,
          publishedBy: 'Admin',
          note
        },
        ...(completePayload.publicationHistory || []).slice(0, 19)
      ]
    };

    // 5. Canonical UPSERT on conflict (id)
    // Only standard columns (id, data, version, published_at, updated_at) - updated_by is recorded inside data JSONB
    const upsertPayload: Record<string, any> = {
      id: 'current',
      data: finalContent,
      version: nextVersion,
      published_at: now,
      updated_at: now,
      updated_by: 'Admin'
    };

    const query = currentRows?.length
      ? client.from('site_content').update(upsertPayload).eq('id', 'current').eq('version', currentVersion)
      : client.from('site_content').insert(upsertPayload);
    const { data: savedRow, error: upsertError } = await query.select('id, version').maybeSingle();
    if (!upsertError && !savedRow) {
      return res.status(409).json({ success: false, error: 'Another administrator published first. Reload before publishing again.' });
    }

    if (upsertError) {
      console.error('[API/publish] Supabase upsert failed:', upsertError);

      const rawMessage = String(upsertError.message || 'Unknown database error');
      const looksLikeProjectionFailure =
        /sync_shpixels_site_projections|project_categories|site_sections|projection|column .* does not exist|duplicate key/i.test(rawMessage);

      return res.status(500).json({
        success: false,
        error: looksLikeProjectionFailure
          ? `Database projection schema is out of date or the projection trigger failed: ${rawMessage}. Run the latest supabase-schema.sql, then publish again.`
          : `Supabase database error: ${rawMessage}`,
        code: upsertError.code || null
      });
    }

    // The canonical document is now saved. The projection trigger is designed
    // not to block this write; report its status separately so the CMS can tell
    // the administrator whether normalized tables also synchronized.
    let projectionWarning: string | null = null;
    let projectionOk = true;

    const { data: projectionRows, error: projectionReadError } = await client
      .from('cms_projection_status')
      .select('version, ok, error')
      .eq('id', 'current')
      .limit(1);

    if (projectionReadError) {
      projectionOk = false;
      projectionWarning =
        'Canonical content was saved, but projection status is unavailable. Run the latest supabase-schema.sql to install the complete database migration.';
    } else {
      const projection = projectionRows?.[0];
      projectionOk = Boolean(
        projection &&
        projection.ok &&
        Number(projection.version || 0) === nextVersion
      );

      if (!projectionOk) {
        projectionWarning =
          projection?.error ||
          `Canonical content was saved, but normalized database tables have not synchronized to version ${nextVersion}.`;
      }
    }

    return res.status(200).json({
      success: true,
      message: projectionOk
        ? 'Successfully published to Supabase database and synchronized all CMS tables'
        : 'Canonical site content was saved to Supabase',
      warning: projectionWarning,
      projectionOk,
      version: nextVersion,
      published_at: now,
      updated_at: now,
      data: finalContent
    });
  } catch (err: any) {
    console.error('[API/publish] Unexpected exception:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
