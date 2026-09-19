const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('packages/frontend/app/src/lib/i18n.ts','utf8');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject,require:id=>id==='zustand/middleware'?{persist:init=>init}:require(id)});
const {t,useLanguage,arabic}=exportsObject;
assert.equal(t('Settings'),'الإعدادات');assert.equal(t('Library'),'المكتبة');
useLanguage.getState().setLanguage('en');assert.equal(t('Settings'),'Settings');
useLanguage.getState().setLanguage('ar');assert.equal(t('Ling 3.0 Flash VL'),'Ling 3.0 Flash VL');
console.log('arabic_english_dictionary=PASS ('+Object.keys(arabic).length+' entries)');
const auth=fs.readFileSync('packages/frontend/app/src/pages/auth-page.tsx','utf8');
const ast=ts.createSourceFile('auth.tsx',auth,99,true,4);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text==='safeReturnPath');
const exp={};vm.runInNewContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exp});
for(const bad of ['https://evil.example','//evil.example','/\\evil.example','/oauth/callback','/sign-up',null])assert.equal(exp.safeReturnPath(bad),'/chats');
assert.equal(exp.safeReturnPath('/library?type=docs'),'/library?type=docs');
console.log('safe_oauth_return_paths=PASS');
let errors=0;const path=require('path');
function check(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())check(file);else if(/\.tsx?$/.test(file)){const parsed=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),99,true,file.endsWith('.tsx')?4:3);errors+=parsed.parseDiagnostics.length;}}}
check('packages/frontend/app/src');assert.equal(errors,0);console.log('frontend_syntax=PASS');
