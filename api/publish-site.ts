export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid content payload' });
  }

  const publishedAt = new Date().toISOString();
  const version = (data.publicationInfo?.version || 1) + 1;

  const finalPayload = {
    ...data,
    lastPublished: publishedAt,
    publicationInfo: {
      publishedAt,
      version,
      publishedBy: data.publicationInfo?.publishedBy || 'Admin'
    }
  };

  if (supabaseUrl && supabaseKey) {
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const resp = await fetch(`${cleanUrl}/rest/v1/site_content`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: 'current',
          data: finalPayload,
          content: finalPayload,
          version,
          published_at: publishedAt,
          updated_at: publishedAt
        })
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error('Supabase write error on Vercel:', txt);
        return res.status(500).json({ success: false, error: `Supabase save failed: ${txt.slice(0, 150)}` });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully saved and published to Supabase database',
        publishedAt,
        version,
        data: finalPayload
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Published locally (Configure Supabase tokens to enable permanent database sync on Vercel)',
    publishedAt,
    version,
    data: finalPayload
  });
}
