const {isIP}=require('node:net');const {report}=require('./visit');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
 const send=(code,obj)=>{res.statusCode=code;res.end(JSON.stringify(obj));};
 if(req.method!=='POST'||req.headers['x-parallax-consent']!=='ip-lookup'||req.headers['sec-fetch-site']!=='same-origin')return send(403,{error:'Explicit same-origin lookup required'});
 if(process.env.VERCEL!=='1')return send(503,{error:'Available on hosted deployment only'});
 const ip=report(req,true).ip;
 if(!ip||!isIP(ip))return send(400,{error:'No valid connection IP available'});
 try{const r=await fetch('https://api.ipapi.is/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:ip}),signal:AbortSignal.timeout(5000),redirect:'error'});if(!r.ok)throw Error();const j=await r.json();if(j.error)throw Error();const str=v=>typeof v==='string'?v.slice(0,250):null,flag=v=>typeof v==='boolean'?v:null;return send(200,{organisation:str(j.asn?.org),networkOwner:str(j.company?.name),asn:Number.isInteger(j.asn?.asn)?j.asn.asn:null,type:str(j.asn?.type),vpn:flag(j.is_vpn),proxy:flag(j.is_proxy),tor:flag(j.is_tor),hosting:flag(j.is_datacenter),mobile:flag(j.is_mobile),source:'ipapi.is'});}catch{return send(503,{error:'Network lookup unavailable or quota reached'});}
};