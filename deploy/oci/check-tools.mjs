import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const state=JSON.parse(await readFile('/app/data/deployment-check.json','utf8'));
const base='https://145.241.159.235.nip.io';
const auth=await fetch(base+'/api/auth/sign-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:state.email,password:state.password})});
assert(auth.ok);
const cookie=auth.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
async function gql(query,variables){const r=await fetch(base+'/graphql',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({query,variables})});const j=await r.json();assert(!j.errors,JSON.stringify(j.errors));return j.data;}
const msg=await gql('mutation($options:CreateChatMessageInput!){createCopilotMessage(options:$options)}',{options:{sessionId:state.sessionId,content:'You must call the Python sandbox tool to execute print(sum(i*i for i in range(1,101))). Do not calculate mentally. Report the tool output.'}});
const r=await fetch(base+`/api/copilot/chat/${state.sessionId}/stream-object?messageId=${msg.createCopilotMessage}&tools[]=pythonSandbox`,{headers:{Cookie:cookie},signal:AbortSignal.timeout(120000)});
const out=await r.text();
assert(!/event: error/.test(out),out.slice(-1500));
assert(/338350/.test(out)&&/tool-call|tool-result/.test(out),out.slice(-2500));
console.log('public_https_python_tool_call=PASS');
