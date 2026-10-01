import { getServerSupabase, validateContentPayload, verifyAdminAuthorization } from './_supabase.js';

const SAFE_UPDATE_ERROR = /delete requires a where clause|safe.?update/i;
const PROJECTION_ERROR = /sync_shpixels_site_projections|project_categories|site_sections|projection|column .* does not exist|duplicate key/i;

function migrationErrorMessage(rawMessage: string, code?: string | null): string | null {
  const isSafeUpdateFailure = code === '21000' || SAFE_UPDATE_ERROR.test(rawMessage);
  if (isSafeUpdateFailure) {
    return [
      'The live Supabase project is still running an outdated projection trigger that performs an unsafe DELETE.',
      'Run supabase-repair-before-schema.sql in Supabase SQL Editor, then immediately run the complete latest supabase-schema.sql, and publish again.',
      `Database detail: ${rawMessage}`
    ].join(' ');
  }

  if (PROJECTION_ERROR.test(rawMessage)) {
    return `Database projection schema is out of date or the projection trigger failed: ${rawMessage}. Run the latest supabase-schema.sql, then publish again.`;
  }

  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!(await verifyAdminAuthorization(req))) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token or session required for publishing.'
    });
  }

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

  const { client, error: clientErr } = getServerSupabase();
  if (!client) {
    return res.status(503).json({
      success: false,
      error: clientErr || 'Server-side Supabase client could not be initialized.'
    });
  }

  try {
    const { data: currentRows, error: readError } = await client
      .from('site_content')
      .select('version')
      .eq('id', 'current')
      .limit(1);

    if (readError) {
      return res.status(503).json({
        success: false,
        error: `Unable to read the current Supabase revision: ${readError.message}`,
        code: readError.code || null
      });
    }

    const currentVersion = Number(currentRows?.[0]?.version || 0);
    if (currentRows?.length && req.body?.expectedVersion !== currentVersion) {
      return res.status(409).json({
        success: false,
        error: 'The website changed since this draft was loaded. Export your draft, reload the latest content, then apply your edits.'
      });
    }

    const nextVersion = currentVersion + 1;
    const now = new Date().toISOString();
    const note = req.body?.note || 'Published from SHPIXELS Admin CMS';

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
      return res.status(409).json({
        success: false,
        error: 'Another administrator published first. Reload before publishing again.'
      });
    }

    if (upsertError) {
      console.error('[API/publish] Supabase upsert failed:', upsertError);

      const rawMessage = String(upsertError.message || 'Unknown database error');
      const migrationError = migrationErrorMessage(rawMessage, upsertError.code || null);

      return res.status(500).json({
        success: false,
        error: migrationError || `Supabase database error: ${rawMessage}`,
        code: upsertError.code || null,
        repairRequired: Boolean(migrationError),
        repairFiles: migrationError
          ? ['supabase-repair-before-schema.sql', 'supabase-schema.sql', 'supabase-verify.sql']
          : []
      });
    }

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
        'Canonical content was saved, but projection status is unavailable. Run the complete latest supabase-schema.sql to install the database projection system.';
    } else {
      const projection = projectionRows?.[0];
      projectionOk = Boolean(
        projection &&
        projection.ok &&
        Number(projection.version || 0) === nextVersion
      );

      if (!projectionOk) {
        const projectionDetail = String(projection?.error || '');
        projectionWarning =
          migrationErrorMessage(projectionDetail, projectionDetail.startsWith('21000') ? '21000' : null) ||
          projectionDetail ||
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
      repairRequired: Boolean(projectionWarning && SAFE_UPDATE_ERROR.test(projectionWarning)),
      version: nextVersion,
      published_at: now,
      updated_at: now,
      data: finalContent
    });
  } catch (err: any) {
    console.error('[API/publish] Unexpected exception:', err);
    const rawMessage = String(err?.message || 'Internal server error');
    const migrationError = migrationErrorMessage(rawMessage, err?.code || null);
    return res.status(500).json({
      success: false,
      error: migrationError || rawMessage,
      code: err?.code || null,
      repairRequired: Boolean(migrationError)
    });
  }
}
