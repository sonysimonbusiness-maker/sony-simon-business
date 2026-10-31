// Chat assistant: passes a short conversation to Make (AI) and returns plain text.
// Off by default: works only when MAKE_CHAT_HOOK_URL is set in Vercel.
const HOOK = process.env.MAKE_CHAT_HOOK_URL || '';
const hits = new Map();
let globalHits = [];
let dayHits = [];

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

const SAFE = 'I can only help with questions about what sonai builds and how it works. For anything else, please book a free 15-minute call: /book.html';
const INJECT = /(ignore|disregard|forget|override)\s+(all\s+|any\s+|your\s+|the\s+|previous\s+|prior\s+|above\s+)*(instructions|rules|prompt)|system\s*prompt|developer\s*mode|jailbreak|you\s+are\s+now|act\s+as\s+(if|a|an)\b|pretend\s+(to\s+be|you)|reveal\s+(your|the)\s+(prompt|instructions)/i;
const BADOUT = /https?:\/\/|www\.|\$\s?\d|\d\s?(usd|dollars)|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\bwire\b|crypto|bitcoin|gift\s*card|password|guarantee/i;
const last = new Map();

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!HOOK) { res.status(503).json({ ok: false, error: 'off' }); return; }
  const src = String(req.headers.origin || req.headers.referer || '');
  if (!/^https:\/\/(sony-simon-business\.vercel\.app|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)(\/|$)/.test(src)) { res.status(403).json({ ok: false, error: 'origin' }); return; }
  if (String(req.headers['content-length'] || 0) > 6000) { res.status(413).json({ ok: false, error: 'size' }); return; }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const msg = clean(b.msg, 400);
  if (!msg) { res.status(400).json({ ok: false, error: 'invalid' }); return; }
  if (b.website) { res.status(200).json({ ok: true, reply: 'Thanks.' }); return; }
  const hist = (Array.isArray(b.history) ? b.history : []).slice(-6).map((h) => {
    const who = h && h.r === 'a' ? 'Assistant' : 'Visitor';
    return who + ': ' + clean(h && h.t, 400);
  }).join('\n');

  if (INJECT.test(msg)) { res.status(200).json({ ok: true, reply: SAFE }); return; }
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  if (now - (last.get(ip) || 0) < 3000) { res.status(429).json({ ok: false, error: 'rate' }); return; }
  last.set(ip, now); if (last.size > 500) last.clear();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  globalHits = globalHits.filter((t) => now - t < 3600000);
  dayHits = dayHits.filter((t) => now - t < 86400000);
  if (recent.length >= 15 || globalHits.length >= 150 || dayHits.length >= 500) { res.status(429).json({ ok: false, error: 'rate' }); return; }
  recent.push(now); globalHits.push(now); dayHits.push(now); hits.set(ip, recent); if (hits.size > 500) hits.clear();

  try {
    const r = await fetch(HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ msg, history: hist }),
      signal: AbortSignal.timeout(25000)
    });
    if (!r.ok) throw new Error('make ' + r.status);
    let reply = clean(await r.text(), 700);
    if (!reply) throw new Error('empty');
    if (BADOUT.test(reply) || INJECT.test(reply)) reply = SAFE;
    res.status(200).json({ ok: true, reply });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream' });
  }
};
