import { getServerSupabase, verifyAdminAuthorization } from './_supabase.js';

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'application/pdf'
]);

function safeName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'asset';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!(await verifyAdminAuthorization(req))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'Server-side Supabase secret is required for media uploads.' });
  }

  const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
  const fileName = safeName(String(req.body?.fileName || 'asset'));
  const folder = safeName(String(req.body?.folder || 'uploads'));

  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    return res.status(400).json({ error: 'Invalid base64 data URL.' });
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return res.status(400).json({ error: 'Unsupported file type.' });
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 15 * 1024 * 1024) {
    return res.status(413).json({ error: 'File exceeds the 15MB upload limit.' });
  }

  const { client, error: clientError } = getServerSupabase();
  if (!client) {
    return res.status(503).json({ error: clientError || 'Supabase is not configured.' });
  }

  const timestamp = Date.now();
  const path = `${folder}/${timestamp}-${fileName}`;

  const { error } = await client.storage
    .from('site-media')
    .upload(path, buffer, {
      contentType: mime,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('[api/upload-asset] upload failed:', error);
    return res.status(500).json({ error: error.message });
  }

  const { data } = client.storage.from('site-media').getPublicUrl(path);
  return res.status(200).json({ success: true, url: data.publicUrl, path, mime, size: buffer.length });
}
