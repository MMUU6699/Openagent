// Local visual-test fixture ONLY. No database, real login, or OAuth tokens.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('packages/frontend/app/dist');
const authenticated=process.env.PREVIEW_SIGNED_IN==='1';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:8082');
 res.setHeader('Cache-Control','no-store');
 if(url.pathname.startsWith('/api/')||url.pathname==='/graphql'){
  res.setHeader('Content-Type','application/json');
  if(url.pathname==='/api/auth/session')return res.end(JSON.stringify({user:authenticated?{id:'visual-test',email:'visual-test@example.com',name:'اختبار الواجهة'}:null}));
  if(url.pathname==='/api/oauth/providers')return res.end(JSON.stringify({providers:[]}));
  if(url.pathname==='/graphql')return res.end(JSON.stringify({data:{currentUser:null}}));
  res.statusCode=503;return res.end(JSON.stringify({message:'Local visual fixture; authentication is not implemented here'}));
 }
 let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.statusCode=403;return res.end();}
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
 const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png'};
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
server.listen(8082,'127.0.0.1',()=>console.log('UI fixture http://127.0.0.1:8082; signed-in='+authenticated));
