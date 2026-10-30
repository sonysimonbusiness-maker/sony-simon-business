// Receives the free-download sign-up, checks it, and passes it to Make.
// Like the contact form, it tells the page whether Make really accepted it.
const HOOK = process.env.MAKE_SUBSCRIBE_HOOK_URL || 'https://hook.us2.make.com/vg4znhfg21ofxoebwtht3fhyhtgxnt6n';
const RESOURCES = ['load-tracker-template', 'automation-quiz'];
const hits = new Map();

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\u0000/g, '').trim().slice(0, max);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const email = clean(b.email, 120).toLowerCase();
  const resource = clean(b.resource, 60);
  const consent = clean(b.consent, 400);
  const page = clean(b.page, 120);
  const answers = clean(b.answers, 800);
  const trap = clean(b.website, 200);

  if (!/^\S+@\S+\.\S+$/.test(email) || !RESOURCES.includes(resource) || !consent) {
    res.status(400).json({ ok: false, error: 'invalid' });
    return;
  }
  // Bots: a filled hidden field or an instant submit. Pretend it worked, save nothing.
  if (trap || (b.t !== undefined && Number(b.t) < 1500)) {
    res.status(200).json({ ok: true });
    return;
  }
  // Light rate limit: 6 per hour per visitor (best effort).
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= 6) {
    res.status(429).json({ ok: false, error: 'rate' });
    return;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();

  try {
    const r = await fetch(HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, resource, consent, page, answers }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error('make ' + r.status);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream' });
  }
};
