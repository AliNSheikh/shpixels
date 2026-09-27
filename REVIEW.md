# CMS review and verification

The current design uses the user-requested fixed password, verified against a salted scrypt hash on the server. No email login or recovery is required. Signed HttpOnly cookies expire after eight hours; passwords are masked and absent from the browser bundle. Server login succeeds with the requested password, and a forged session receives HTTP 401.

Supabase public reads and realtime remain connected to the supplied project. Secure publishing requires SUPABASE_SERVICE_ROLE_KEY on the server, which is not yet present in .env. Run supabase-schema.sql to revoke legacy anonymous writes and remove old public password hashes. A fixed-password session does not grant Supabase privileges by itself.

Content changes include component visibility, advanced editing, managed video rendering, dynamic branding/accent/SEO values, secondary hero links, import error reporting, preservation of unsaved drafts and optimistic publication revision checks. Contact inquiries open a mail draft for the visitor to send.

Verification: TypeScript and production build pass; five regression tests cover authentication bypass rejection, session tampering/expiry, content validation and mocked administrator add/edit/delete publishing with stale-revision rejection. Browser login opens the CMS. Live database reads succeed. Live publishing and deployed database-policy verification are blocked by the missing server key and unapplied SQL migration. No live website content was overwritten during tests.

Limits: Some decorative/interface copy remains static; JSON validation checks root structure, not every nested field. Media uses URLs/data URIs rather than dedicated storage uploads. Public JSON includes unpublished records; visibility is not confidentiality. Login attempt limits are per server instance. The production bundle has a size warning.
