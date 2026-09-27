import { createSession, hasAdminSession, passwordMatches, sessionCookie } from './_admin-auth';
const attempts = new Map<string, { count: number; until: number }>();
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(hasAdminSession(req) ? 200 : 401).json({ authenticated: hasAdminSession(req) });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', sessionCookie(req, '')); return res.status(200).json({success:true}); }
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const password = req.body?.password;
  if (typeof password !== 'string' || !password || password.length > 1024) return res.status(400).json({error:'Enter your password.'});
  const ip = req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const record = attempts.get(ip) || {count:0,until:now + 15 * 60 * 1000};
  if (record.count >= 10) return res.status(429).json({error:'Too many attempts. Try again in 15 minutes.'});
  if (!passwordMatches(password)) { record.count++; attempts.set(ip,record); return res.status(401).json({error:'Incorrect password.'}); }
  try {
    res.setHeader('Set-Cookie', sessionCookie(req, createSession()));
    attempts.delete(ip);
    return res.status(200).json({success:true});
  } catch { return res.status(503).json({error:'Server session configuration is missing.'}); }
}
