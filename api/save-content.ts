/**
 * This route is kept only for backwards compatibility with older client
 * builds or bookmarked URLs. It intentionally contains no logic of its own -
 * previously this file duplicated the same upsert code as api/publish-site.ts
 * with slight differences (no version-history tracking, different retry
 * behavior), and the two implementations had already drifted apart, which is
 * exactly the kind of bug that can make "some" edits fail to save while
 * others succeed. Re-exporting the canonical handler means there is now only
 * ONE implementation of "write site content to Supabase" in the whole project.
 */
export { default } from './publish-site';
