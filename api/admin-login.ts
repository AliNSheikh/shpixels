import { createSession, hasAdminSession, sessionCookie } from './_admin-auth.js';
import { getServerSupabaseAuth } from './_supabase.js';

const attempts = new Map<string, { count: number; until: number }>();

function normalizedEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const authenticated = hasAdminSession(req);
      return res.status(authenticated ? 200 : 401).json({ authenticated });
    }

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', sessionCookie(req, ''));
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const email = normalizedEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== 'string' || !password || password.length > 1024) {
      return res.status(400).json({ error: 'Enter your email and password.' });
    }

    const adminEmail = normalizedEmail(process.env.ADMIN_EMAIL);
    if (!adminEmail) {
      return res.status(503).json({
        error: 'ADMIN_EMAIL is not configured in Vercel. Add the Supabase admin user email and redeploy.'
      });
    }

    const forwardedFor = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwardedFor || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    for (const [key, value] of attempts) {
      if (value.until <= now) attempts.delete(key);
    }

    const record = attempts.get(ip) || { count: 0, until: now + 15 * 60 * 1000 };
    if (record.count >= 10) {
      return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    }

    // Keep the failure generic so the endpoint does not reveal the configured admin email.
    if (email !== adminEmail) {
      record.count++;
      attempts.set(ip, record);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { client, error: clientError } = getServerSupabaseAuth();
    if (!client) {
      return res.status(503).json({ error: clientError || 'Supabase Auth is not configured.' });
    }

    const { data, error: authError } = await client.auth.signInWithPassword({ email, password });

    if (authError || !data.user || normalizedEmail(data.user.email) !== adminEmail) {
      record.count++;
      attempts.set(ip, record);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSession(adminEmail);
    res.setHeader('Set-Cookie', sessionCookie(req, token));
    attempts.delete(ip);

    return res.status(200).json({
      success: true,
      user: { email: adminEmail }
    });
  } catch (error) {
    console.error('[api/admin-login] Unhandled login error:', error);
    return res.status(500).json({
      error: 'Admin login endpoint failed. Check the Vercel Function logs and environment variables.'
    });
  }
}
