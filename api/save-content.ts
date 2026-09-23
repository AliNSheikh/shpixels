import { getServerSupabase, validateContentPayload, verifyAdminAuthorization } from './_supabase';

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Verify admin authorization
  if (!verifyAdminAuthorization(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token or session required.'
    });
  }

  // 2. Validate payload
  const rawPayload = req.body?.data || req.body;
  const validation = validateContentPayload(rawPayload);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, error: validation.error });
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
    const { data: currentRows } = await client
      .from('site_content')
      .select('version, published_at')
      .eq('id', 'current')
      .limit(1);

    const currentVersion = Number(currentRows?.[0]?.version || 0);
    const nextVersion = currentVersion + 1;
    const now = new Date().toISOString();

    const finalContent = {
      ...rawPayload,
      publicationInfo: {
        ...(rawPayload.publicationInfo || {}),
        version: nextVersion,
        publishedAt: rawPayload.publicationInfo?.publishedAt || now
      }
    };

    // Canonical UPSERT
    const { data: upsertData, error: upsertError } = await client
      .from('site_content')
      .upsert(
        {
          id: 'current',
          data: finalContent,
          version: nextVersion,
          updated_at: now,
          updated_by: 'Admin'
        },
        { onConflict: 'id' }
      )
      .select('id, version, published_at, updated_at')
      .single();

    if (upsertError) {
      console.error('[API/save-content] Supabase error:', upsertError);
      return res.status(500).json({
        success: false,
        error: `Supabase write failed: ${upsertError.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Draft saved to Supabase',
      version: nextVersion,
      updated_at: now,
      data: finalContent
    });
  } catch (err: any) {
    console.error('[API/save-content] Unhandled exception:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
