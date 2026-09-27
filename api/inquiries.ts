import { getServerSupabase, verifyAdminAuthorization } from './_supabase.js';

const attempts = new Map<string, { count: number; until: number }>();

function clean(value: unknown, max = 2000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'Server-side Supabase secret is required for inquiry storage.' });
  }

  const { client, error: clientError } = getServerSupabase();
  if (!client) {
    return res.status(503).json({ error: clientError || 'Supabase is not configured.' });
  }

  if (req.method === 'POST') {
    const forwardedFor = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwardedFor || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    for (const [key, value] of attempts) {
      if (value.until <= now) attempts.delete(key);
    }

    const record = attempts.get(ip) || { count: 0, until: now + 60 * 60 * 1000 };
    if (record.count >= 8) {
      return res.status(429).json({ error: 'Too many inquiries. Please try again later.' });
    }

    const name = clean(req.body?.name, 150);
    const email = clean(req.body?.email, 320).toLowerCase();
    const phone = clean(req.body?.phone, 80);
    const service = clean(req.body?.service, 180);
    const budget = clean(req.body?.budget, 120);
    const message = clean(req.body?.message, 5000);
    const sourcePage = clean(req.body?.sourcePage, 500);

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid name and email address.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Please enter a message.' });
    }

    const { data, error } = await client
      .from('contact_inquiries')
      .insert({
        name,
        email,
        phone: phone || null,
        service: service || null,
        budget: budget || null,
        message,
        source_page: sourcePage || null,
        status: 'new'
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[api/inquiries] insert failed:', error);
      return res.status(500).json({ error: 'Unable to save your inquiry right now.' });
    }

    record.count += 1;
    attempts.set(ip, record);
    return res.status(201).json({ success: true, inquiry: data });
  }

  if (!(await verifyAdminAuthorization(req))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const limit = Math.min(Math.max(Number(req.query?.limit || 100), 1), 250);
    const { data, error } = await client
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, inquiries: data || [] });
  }

  if (req.method === 'PATCH') {
    const id = clean(req.body?.id, 80);
    const status = clean(req.body?.status, 30);
    const adminNotes = clean(req.body?.adminNotes, 5000);

    if (!id || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'A valid inquiry id and status are required.' });
    }

    const { data, error } = await client
      .from('contact_inquiries')
      .update({
        status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, inquiry: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
