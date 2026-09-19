// Emit an apply_patch patch; do not modify files directly.
const fs=require('fs'),path=require('path'),ts=require('typescript');
const root=path.resolve('packages/frontend/app/src');
const dictSource=fs.readFileSync(path.join(root,'lib/i18n.ts'),'utf8');
const dictFile=ts.createSourceFile('i18n.ts',dictSource,99,true);
const keys=new Set();
function collect(n){if(ts.isPropertyAssignment(n)&&ts.isStringLiteral(n.name))keys.add(n.name.text);ts.forEachChild(n,collect)}collect(dictFile);
const patches=[];
function visitDir(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,ent.name);if(ent.isDirectory()){if(ent.name!=='onboarding')visitDir(file);continue}if(!file.endsWith('.tsx')||['sign-in.tsx','auth-page.tsx','settings.tsx','oauth-callback.tsx'].includes(ent.name))continue;
if(process.argv[2] && !file.endsWith(process.argv[2]))continue;
const old=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');const ast=ts.createSourceFile(file,old,99,true,ts.ScriptKind.TSX),edits=[];
function walk(n){
 if(ts.isJsxText(n)){const key=n.text.replace(/\s+/g,' ').trim();if(keys.has(key))edits.push([n.pos,n.end,`{t(${JSON.stringify(key)})}`]);}
 else if(ts.isStringLiteral(n)&&keys.has(n.text)){
  const parent=n.parent;
  if(ts.isCallExpression(parent)&&parent.expression.getText(ast)==='t')return;
  if(ts.isPropertyAssignment(parent)&&parent.name===n)return;
  // Module-level labels stay as keys and are translated at the rendering site.
  if(ts.isPropertyAssignment(parent)&&parent.name.getText(ast)==='label')return;
  let inFunction=false;for(let p=parent;p;p=p.parent){if(ts.isFunctionLike(p)){inFunction=true;break}}
  if(!inFunction&&!ts.isJsxAttribute(parent))return;
  let text=`t(${JSON.stringify(n.text)})`;if(ts.isJsxAttribute(parent))text=`{${text}}`;
  edits.push([n.getStart(ast),n.end,text]);
 }
 ts.forEachChild(n,walk);
}walk(ast);if(!edits.length)continue;
let next=old;for(const [start,end,text]of edits.sort((a,b)=>b[0]-a[0]))next=next.slice(0,start)+text+next.slice(end);
if(!/import.*\bt\b.*from ['"]@\/lib\/i18n/.test(next))next=`import { t } from '@/lib/i18n';\n`+next;
patches.push(`*** Update File: ${file.replaceAll('\\','/')}\n@@\n${old.trimEnd().split('\n').map(l=>'-'+l).join('\n')}\n${next.trimEnd().split('\n').map(l=>'+'+l).join('\n')}\n`);
}}visitDir(root);process.stdout.write('*** Begin Patch\n'+patches.join('')+'*** End Patch');
