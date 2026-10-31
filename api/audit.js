// Free website check: fetches one public page and reports basic, factual findings.
const dns = require('dns').promises;
const net = require('net');
const hits = new Map();

function privateIp(ip) {
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    return l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe80') || l.startsWith('::ffff:');
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => isNaN(n))) return true;
  return p[0] === 10 || p[0] === 127 || p[0] === 0 || (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || p[0] >= 224;
}

async function safeHost(host) {
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false;
  if (net.isIP(host)) return !privateIp(host);
  const addrs = await dns.lookup(host, { all: true });
  return addrs.length > 0 && addrs.every((a) => !privateIp(a.address));
}

async function grab(startUrl) {
  let url = startUrl;
  let redirects = 0;
  const started = Date.now();
  for (;;) {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol) || (u.port && !['80', '443'].includes(u.port))) throw new Error('blocked');
    if (!(await safeHost(u.hostname))) throw new Error('blocked');
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'SonySimonSiteCheck/1.0 (+https://sony-simon-business.vercel.app/audit.html)', Accept: 'text/html' } });
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
      if (++redirects > 4) throw new Error('redirects');
      url = new URL(r.headers.get('location'), url).toString();
      continue;
    }
    const reader = r.body.getReader();
    let size = 0;
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      chunks.push(value);
      if (size > 1500000) { reader.cancel(); break; }
    }
    return { status: r.status, finalUrl: url, html: Buffer.concat(chunks).toString('utf8'), size, ms: Date.now() - started, type: r.headers.get('content-type') || '' };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (b.website) { res.status(200).json({ ok: true, checks: [] }); return; }
  let raw = String(b.url || '').trim().slice(0, 300);
  if (!raw) { res.status(400).json({ ok: false, error: 'invalid' }); return; }
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let target;
  try { target = new URL(raw); } catch (e) { res.status(400).json({ ok: false, error: 'invalid' }); return; }
  if (!target.hostname.includes('.')) { res.status(400).json({ ok: false, error: 'invalid' }); return; }

  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= 10) { res.status(429).json({ ok: false, error: 'rate' }); return; }
  recent.push(now); hits.set(ip, recent); if (hits.size > 500) hits.clear();

  let g;
  try { g = await grab(target.toString()); } catch (e) {
    res.status(200).json({ ok: false, error: e.message === 'blocked' ? 'blocked' : 'unreachable' });
    return;
  }
  const h = g.html;
  const checks = [];
  const add = (id, label, level, note) => checks.push({ id, label, level, note });
  const first = (re) => { const m = h.match(re); return m ? m[1].trim() : ''; };
  const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');

  const https = g.finalUrl.startsWith('https://');
  add('https', 'Secure connection (https)', https ? 'good' : 'bad', https ? 'The page loads over https.' : 'The page loads without https. Browsers warn visitors about this and Google ranks it lower.');
  add('status', 'Page loads', g.status === 200 ? 'good' : 'bad', g.status === 200 ? 'The page returned normally.' : 'The page returned status ' + g.status + '.');
  const title = decode(first(/<title[^>]*>([\s\S]*?)<\/title>/i));
  add('title', 'Page title', !title ? 'bad' : (title.length < 15 || title.length > 65 ? 'warn' : 'good'), !title ? 'No page title. This is what shows in Google and in the browser tab.' : 'Title: "' + title.slice(0, 90) + '" (' + title.length + ' characters). ' + (title.length < 15 ? 'A bit short. Say what you do and where.' : title.length > 65 ? 'A bit long. Google may cut it off.' : 'Good length.'));
  const mdm = h.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  const md = mdm ? decode((mdm[0].match(/content=["']([^"']*)["']/i) || [, ''])[1]) : '';
  add('desc', 'Search description', !md ? 'bad' : (md.length < 70 || md.length > 170 ? 'warn' : 'good'), !md ? 'No description. Google will guess one, often badly.' : md.length + ' characters. ' + (md.length < 70 ? 'Short. Add what you offer and who it is for.' : md.length > 170 ? 'Long. Google may cut it off.' : 'Good length.'));
  const vp = /<meta[^>]+name=["']viewport["']/i.test(h);
  add('viewport', 'Works on phones', vp ? 'good' : 'bad', vp ? 'The page is set up for phone screens.' : 'No phone setup found. The page will likely look tiny on a phone, where most visitors are.');
  const h1s = (h.match(/<h1[\s>]/gi) || []).length;
  add('h1', 'Main heading', h1s === 1 ? 'good' : 'warn', h1s === 1 ? 'One main heading, as it should be.' : h1s === 0 ? 'No main heading found. Visitors and Google use it to see what the page is about.' : h1s + ' main headings found. One clear heading works better.');
  const imgs = h.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;
  add('alt', 'Image descriptions', imgs.length === 0 ? 'warn' : noAlt === 0 ? 'good' : 'warn', imgs.length === 0 ? 'No images found in the page. Real photos build trust for most local businesses.' : noAlt === 0 ? 'All ' + imgs.length + ' images have descriptions.' : noAlt + ' of ' + imgs.length + ' images have no description. This hurts accessibility and image search.');
  add('lang', 'Page language set', /<html[^>]+lang=/i.test(h) ? 'good' : 'warn', /<html[^>]+lang=/i.test(h) ? 'Language is declared.' : 'No language declared. Small issue for screen readers and translation.');
  const noindex = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(h);
  add('index', 'Visible to Google', noindex ? 'bad' : 'good', noindex ? 'This page tells Google NOT to list it. If that is not intended, it must be fixed.' : 'Nothing blocks Google from listing the page.');
  const og = /property=["']og:title["']/i.test(h) && /property=["']og:image["']/i.test(h);
  add('share', 'Looks good when shared', og ? 'good' : 'warn', og ? 'Share preview (title and image) is set.' : 'No share preview. Links shared in texts and social apps look plain.');
  const contact = /href=["']tel:/i.test(h) || /href=["']mailto:/i.test(h) || /<form\b/i.test(h);
  add('contact', 'Easy way to contact you', contact ? 'good' : 'warn', contact ? 'A phone link, email link or form was found.' : 'No tap-to-call, email link or form found on this page. Make contacting you one step.');
  add('speed', 'Page weight and response', g.size > 1000000 || g.ms > 3000 ? 'warn' : 'good', 'Page code is ' + Math.round(g.size / 1024) + ' KB and the server answered in about ' + (g.ms / 1000).toFixed(1) + ' s. This check does not measure images or full load time.');

  const score = checks.reduce((s, c) => s + (c.level === 'good' ? 1 : c.level === 'warn' ? 0.5 : 0), 0);
  res.status(200).json({ ok: true, url: g.finalUrl, passed: Math.floor(score), total: checks.length, checks });
};
