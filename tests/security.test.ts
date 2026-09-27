import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyAdminAuthorization, validateContentPayload } from '../api/_supabase.ts';
import handler from '../api/publish-site.ts';

test('rejects missing, forged legacy, and development bypass credentials', async () => {
  for (const headers of [{}, {authorization:'Bearer shpix_1790000000000_forged'}, {'x-local-dev-sync':'true'}, {'x-admin-session':'shpix_1790000000000_forged'}]) {
    assert.equal(await verifyAdminAuthorization({headers}),false);
  }
});

test('publishing rejects unauthorized callers before accessing data', async () => {
  let status=0; let body:any;
  const res={setHeader(){},status(code:number){status=code;return this;},json(value:any){body=value;return this;}};
  await handler({method:'POST',headers:{},body:{data:{}}},res);
  assert.equal(status,401); assert.equal(body.success,false);
});

test('incomplete content is rejected',()=>{
  assert.equal(validateContentPayload(null).isValid,false);
  assert.equal(validateContentPayload({projects:[]}).isValid,false);
});

import loginHandler from '../api/admin-login.ts';

import { createSession, hasAdminSession } from '../api/_admin-auth.ts';

test('signed admin sessions are bound to the configured email, reject tampering, and expire', () => {
  process.env.ADMIN_SESSION_SECRET='test-secret-with-at-least-thirty-two-characters';
  process.env.ADMIN_EMAIL='admin@example.com';
  const token=createSession('admin@example.com');
  assert.equal(hasAdminSession({headers:{cookie:`cms_admin=${token}`}}),true);
  assert.equal(hasAdminSession({headers:{cookie:`cms_admin=${token}x`}}),false);

  process.env.ADMIN_EMAIL='different@example.com';
  assert.equal(hasAdminSession({headers:{cookie:`cms_admin=${token}`}}),false);
  process.env.ADMIN_EMAIL='admin@example.com';

  const original=Date.now;
  Date.now=()=>original()+9*60*60*1000;
  assert.equal(hasAdminSession({headers:{cookie:`cms_admin=${token}`}}),false);
  Date.now=original;

  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_SESSION_SECRET;
});

import { initialContent } from '../src/data/initialContent.ts';

test('admin publishing persists additions, edits and deletions and rejects stale drafts', async () => {
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  let saved:any = {id:'current',version:6,data:structuredClone(initialContent)};
  try {
    globalThis.fetch = async (input, options) => {
      const url = String(input);
      if (url.includes('/auth/v1/user')) return new Response(JSON.stringify({id:'admin',app_metadata:{role:'admin'}}),{status:200,headers:{'Content-Type':'application/json'}});
      if (options?.method === 'PATCH') {
        assert.equal((options.headers as any).get('authorization'),'Bearer test-service-key');
        saved = JSON.parse(String(options.body));
        return new Response(JSON.stringify([{id:saved.id,version:saved.version}]),{status:200,headers:{'Content-Type':'application/json'}});
      }
      return new Response(JSON.stringify([{version:saved.version}]),{status:200,headers:{'Content-Type':'application/json'}});
    };
    const publish = async (content:any, version:number) => {
      let status=0; let body:any;
      const res={setHeader(){},status(code:number){status=code;return this;},json(value:any){body=value;return this;}};
      await handler({method:'POST',headers:{cookie:`cms_admin=${createSession('admin@example.com')}`},body:{data:content,expectedVersion:version}},res);
      return {status,body};
    };
    const draft=structuredClone(initialContent);
    draft.projects.push({...draft.projects[0],id:'test-added',title:'Added project'});
    draft.projects[0].title='Edited project';
    draft.gallery=[];
    let result=await publish(draft,6);
    assert.equal(result.status,200);
    assert.equal(saved.data.projects.at(-1).id,'test-added');
    assert.equal(saved.data.projects[0].title,'Edited project');
    assert.deepEqual(saved.data.gallery,[]);
    result=await publish(draft,6);
    assert.equal(result.status,409);
    assert.equal(saved.version,7);
  } finally {
    globalThis.fetch=previousFetch;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_SESSION_SECRET;
  }
});
