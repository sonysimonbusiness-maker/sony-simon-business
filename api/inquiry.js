// Receives the contact form, checks it, and passes it to Make.
// Unlike posting straight from the browser, this tells the page whether Make really accepted it.
const HOOK = process.env.MAKE_HOOK_URL || 'https://hook.us2.make.com/oe24qeoj05tg1b5bgqatd0vugcatnpmh';
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
  const name = clean(b.name, 80);
  const email = clean(b.email, 120);
  const goal = clean(b.goal, 2000);
  const page = clean(b.page, 120);
  const trap = clean(b.website, 200);

  if (!name || !goal || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ ok: false, error: 'invalid' });
    return;
  }
  // Bots: a filled hidden field or an instant submit. Pretend it worked, send nothing.
  if (trap || (b.t !== undefined && Number(b.t) < 2000)) {
    res.status(200).json({ ok: true });
    return;
  }
  // Light rate limit: 5 per hour per visitor (best effort).
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= 5) {
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
      body: new URLSearchParams({ name, email, goal, page, website: '' }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error('make ' + r.status);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream' });
  }
};
