export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
      const resp = await fetch(`${cleanUrl}/rest/v1/site_content?id=eq.current&select=id,version,published_at,updated_at`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      });
      if (resp.ok) {
        const rows: any = await resp.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const item = rows[0];
          return res.status(200).json({
            version: item.version || 1,
            lastPublished: item.published_at || item.updated_at || new Date().toISOString(),
            serverTime: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.warn("Vercel API Supabase version read warning:", err.message);
    }
  }

  return res.status(200).json({
    version: 1,
    lastPublished: new Date().toISOString(),
    serverTime: new Date().toISOString()
  });
}
