// Chat assistant: passes a short conversation to Make (AI) and returns plain text.
// Off by default: works only when MAKE_CHAT_HOOK_URL is set in Vercel.
const HOOK = process.env.MAKE_CHAT_HOOK_URL || '';
const hits = new Map();
let globalHits = [];
let dayHits = [];

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!HOOK) { res.status(503).json({ ok: false, error: 'off' }); return; }
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

  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  globalHits = globalHits.filter((t) => now - t < 3600000);
  dayHits = dayHits.filter((t) => now - t < 86400000);
  if (recent.length >= 20 || globalHits.length >= 300 || dayHits.length >= 1000) { res.status(429).json({ ok: false, error: 'rate' }); return; }
  recent.push(now); globalHits.push(now); dayHits.push(now); hits.set(ip, recent); if (hits.size > 500) hits.clear();

  try {
    const r = await fetch(HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ msg, history: hist }),
      signal: AbortSignal.timeout(25000)
    });
    if (!r.ok) throw new Error('make ' + r.status);
    const reply = clean(await r.text(), 700);
    if (!reply) throw new Error('empty');
    res.status(200).json({ ok: true, reply });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream' });
  }
};
