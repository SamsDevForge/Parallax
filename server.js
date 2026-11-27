const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const api=require('./api/visit');
const root=path.join(__dirname,'public');
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/mirror.js':'mirror.js','/style.css':'style.css','/device-catalog.json':'device-catalog.json'};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
 res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), display-capture=(), usb=(), serial=(), bluetooth=()');
 const route=new URL(req.url,'http://localhost').pathname;
 if(route==='/api/visit') return api(req,res);
 if(!files[route]){res.writeHead(404);return res.end('Not found');}
 const file=path.join(root,files[route]);res.setHeader('Content-Type',mime[path.extname(file)]);fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT||3000,()=>console.log('Parallax: http://localhost:'+(process.env.PORT||3000)));
