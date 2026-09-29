/**
 * Canonical public CMS publish route.
 *
 * Vercel maps files in /api directly to serverless endpoints. The CMS posts to
 * /api/publish, so keep this physical route instead of relying on a rewrite.
 * All write logic remains centralized in publish-site.ts.
 */
export { default } from './publish-site.js';
