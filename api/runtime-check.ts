export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    platform: 'vercel',
    node: process.version,
    adminSessionSecretConfigured: Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32),
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim()),
    supabaseUrlConfigured: Boolean(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL
    ),
    supabaseServerKeyConfigured: Boolean(
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    supabaseAuthPublicKeyConfigured: Boolean(
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY
    )
  });
}
