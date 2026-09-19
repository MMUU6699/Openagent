const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root='packages/backend/server/src/plugins/oauth/providers/';
function provider(file, responses){
 const source=fs.readFileSync(root+file+'.ts','utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}}).outputText;
 const exports={};const calls=[];
 vm.runInNewContext(js,{exports,require:id=>{
  if(id==='@nestjs/common')return {Injectable:()=>target=>target};
  if(id.endsWith('/base'))return {InvalidOauthCallbackCode:class extends Error{},URLHelper:class{}};
  if(id==='../config')return {OAuthProviderName:{Google:'google',GitHub:'github'}};
  if(id==='./def')return {OAuthProvider:class{}};
  throw new Error(id);
 },fetch:async(url,options)=>{calls.push({url,options});const value=responses.shift();assert(value,'unexpected request');return {ok:true,status:200,json:async()=>value};},Date,Error});
 const Class=exports.GoogleOAuthProvider||exports.GithubOAuthProvider;
 return {instance:new Class({link:p=>'https://example.com'+p,stringify:obj=>new URLSearchParams(obj).toString()}),calls};
}
(async()=>{
 let p=provider('google',[{id:'g1',email:'verified@example.com',verified_email:true}]);
 assert.equal((await p.instance.getUser({accessToken:'test'})).email,'verified@example.com');
 p=provider('google',[{id:'g1',email:'unverified@example.com',verified_email:false}]);
 await assert.rejects(()=>p.instance.getUser({accessToken:'test'}));
 console.log('google_verified_email=PASS');
 p=provider('github',[{login:'test',email:null},[{email:'private@example.com',primary:true,verified:true}]]);
 assert.equal((await p.instance.getUser({accessToken:'test'})).email,'private@example.com');
 p=provider('github',[{login:'test'},[{email:'bad@example.com',primary:true,verified:false}]]);
 await assert.rejects(()=>p.instance.getUser({accessToken:'test'}));
 console.log('github_private_verified_email=PASS');
 p=provider('github',[{error:'bad_verification_code'}]);
 p.instance.config={clientId:'test',clientSecret:'test'};
 await assert.rejects(()=>p.instance.getToken('invalid'));
 console.log('invalid_github_token=PASS');
 console.log('Mocked provider tests only; real OAuth credentials and consent are still required.');
})().catch(error=>{console.error(error);process.exitCode=1});
