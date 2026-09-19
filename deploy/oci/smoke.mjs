import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3010';
const cookies = new Map();
const email = `deploy-check-${Date.now()}@example.com`;
const password = randomBytes(24).toString('base64url');
async function req(path, body, anonymous = false) {
  const response = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(!anonymous ? { Cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; ') } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(90000),
  });
  for (const item of response.headers.getSetCookie()) {
    const [key, ...value] = item.split(';')[0].split('=');
    cookies.set(key, value.join('='));
  }
  return response;
}
async function gql(query, variables) {
  const res = await req('/graphql', {query, variables});
  const data = await res.json();
  assert(!data.errors, JSON.stringify(data.errors));
  return data.data;
}
assert.equal((await req('/')).status, 200);
console.log('frontend=PASS');
const signup = await req('/api/auth/register', {email,password});
assert.equal(signup.status, 201, await signup.clone().text());
const user = await signup.json();
assert(signup.headers.getSetCookie().some(c => /HttpOnly/i.test(c) && /Secure/i.test(c)));
console.log('signup_secure_cookie=PASS');
const current = await gql('query { currentUser { id email } }');
assert.equal(current.currentUser.email, email);
console.log('authenticated_graphql=PASS');
const unauthorized = await req('/graphql', {query:'query { currentUser { id } }'}, true);
const unauthorizedData = await unauthorized.json();
assert(!unauthorizedData.data?.currentUser);
console.log('unauthorized_access_blocked=PASS');
await req('/api/auth/sign-out');
cookies.clear();
const signin = await req('/api/auth/sign-in', {email,password});
assert(signin.ok, await signin.text());
console.log('signin=PASS');
const session = await gql('mutation($options:CreateChatSessionInput!){createCopilotSession(options:$options)}', {options:{promptName:'Chat With Open-Agent'}});
const sessionId = session.createCopilotSession;
const context = await gql('mutation($sessionId:String!){createCopilotContext(sessionId:$sessionId)}', {sessionId});
console.log('chat_context=PASS');
const message = await gql('mutation($options:CreateChatMessageInput!){createCopilotMessage(options:$options)}', {options:{sessionId,content:'Reply with exactly: Oracle deployment works.'}});
const stream = await req(`/api/copilot/chat/${sessionId}/stream?messageId=${message.createCopilotMessage}`);
const reply = await stream.text();
assert(stream.ok && !/event: error|provider_side_error|no_copilot_provider/i.test(reply), reply.slice(-1500));
assert(/deployment|Oracle|works/.test(reply), reply.slice(-1500));
console.log('chat_stream=PASS');
const doc = await gql('mutation($sessionId:String!,$title:String!,$content:String!){addUserDocs(sessionId:$sessionId,title:$title,content:$content){docId content}}', {sessionId,title:'Deployment verification',content:'Oracle persistent storage verification.'});
assert(doc.addUserDocs.docId);
console.log('document_storage=PASS');
await writeFile('/app/data/deployment-check.json', JSON.stringify({email,password,userId:user.id,sessionId,contextId:context.createCopilotContext,docId:doc.addUserDocs.docId}), {mode:0o600});
console.log('verification_state_saved=PASS');
