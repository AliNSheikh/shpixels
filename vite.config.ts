import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '');

  const readEnv = (name: string) => process.env[name] || fileEnv[name] || '';

  // Vercel's Supabase Marketplace integration uses SUPABASE_URL /
  // SUPABASE_PUBLISHABLE_KEY (plus NEXT_PUBLIC_* aliases). Vite only exposes
  // VITE_* variables to browser code, so map PUBLIC values at build time.
  // Never expose SUPABASE_SECRET_KEY here.
  const supabaseUrl =
    readEnv('VITE_SUPABASE_URL') ||
    readEnv('NEXT_PUBLIC_SUPABASE_URL') ||
    readEnv('SUPABASE_URL');

  const supabasePublicKey =
    readEnv('VITE_SUPABASE_ANON_KEY') ||
    readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    readEnv('SUPABASE_PUBLISHABLE_KEY') ||
    readEnv('SUPABASE_ANON_KEY');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabasePublicKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
