function report(req, trustedProxy = false) {
  const h = req.headers;
  const val = k => typeof h[k] === 'string' ? h[k] : null;
  const decode = x => { try { return x ? decodeURIComponent(x) : null; } catch { return x; } };
  const remote = req.socket?.remoteAddress || null;
  const forwarded = trustedProxy ? (val('x-vercel-forwarded-for') || val('x-forwarded-for'))?.split(',')[0].trim() : null;
  return { ip: forwarded || remote, ipSource: forwarded ? 'Hosting proxy' : 'Direct socket',
    country: trustedProxy ? val('x-vercel-ip-country') : null,
    region: trustedProxy ? val('x-vercel-ip-country-region') : null,
    city: trustedProxy ? decode(val('x-vercel-ip-city')) : null,
    postalCode: trustedProxy ? val('x-vercel-ip-postal-code') : null,
    ipTimezone: trustedProxy ? val('x-vercel-ip-timezone') : null,
    headers: Object.fromEntries(['user-agent','accept-language','accept','accept-encoding','sec-ch-ua','sec-ch-ua-mobile','sec-ch-ua-platform','sec-ch-ua-platform-version','sec-ch-ua-arch','sec-ch-ua-bitness','sec-ch-ua-model','sec-fetch-site','sec-fetch-mode','sec-fetch-dest','dnt','sec-gpc','priority'].map(k=>[k,val(k)])),
    protocol: req.httpVersion || null, tls: req.socket?.encrypted ? req.socket.getProtocol?.() || 'TLS' : (trustedProxy ? val('x-forwarded-proto') : null), serverTime: new Date().toISOString() };
}
function handler(req,res) { res.setHeader('Cache-Control','no-store'); res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(report(req,process.env.VERCEL==='1'))); }
module.exports = handler; module.exports.report = report;
