/* Floating chat assistant: a small button on every page that opens a chat panel. */
(function () {
  if (window.__cw || /\/ask\.html$/.test(location.pathname)) return;
  window.__cw = 1;
  var css = '.cw-btn{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:90;display:flex;align-items:center;gap:10px;height:56px;padding:0 20px 0 16px;border:0;border-radius:999px;background:#111216;color:#fff;font:700 16px Geist,Barlow,Arial,sans-serif;cursor:pointer;box-shadow:0 8px 28px rgba(17,18,22,.35)}' +
    '.cw-btn:hover{background:#000000}.cw-btn:focus-visible,.cw-x:focus-visible,.cw-in:focus-visible,.cw-send:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px #FF5B1F}' +
    '.cw-btn svg{flex:none}.cw-tip{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + 66px);z-index:90;max-width:230px;background:#fff;color:#111;border-radius:14px;padding:10px 14px;font:500 15px/1.35 Geist,Barlow,Arial,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.25)}' +
    '.cw-tip[hidden],.cw-p[hidden]{display:none}.cw-p{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:100;width:380px;max-width:calc(100vw - 24px);height:min(560px,calc(100dvh - 32px));display:flex;flex-direction:column;background:#fff;color:#111;border-radius:18px;box-shadow:0 18px 60px rgba(0,0,0,.45);overflow:hidden;font-family:Geist,Barlow,Arial,sans-serif}' +
    '.cw-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;background:#111216;color:#fff}.cw-h b{font-size:17px}.cw-h span{display:block;font-size:13px;opacity:.75;font-weight:500}' +
    '.cw-x{border:0;background:transparent;color:#fff;font-size:26px;line-height:1;width:40px;height:40px;border-radius:50%;cursor:pointer}.cw-x:hover{background:rgba(255,255,255,.15)}' +
    '.cw-l{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#F4F2ED}.cw-m{max-width:88%;padding:10px 14px;border-radius:16px;font-size:16px;line-height:1.45;overflow-wrap:anywhere}.cw-u{align-self:flex-end;background:#111216;color:#fff}.cw-a{align-self:flex-start;background:#fff;color:#111;border:1px solid #DEDAD1}' +
    '.cw-c{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#F4F2ED}.cw-c button{border:1px solid #CBC6BA;background:#fff;color:#111216;border-radius:999px;padding:7px 12px;font:600 14px Geist,Barlow,Arial,sans-serif;cursor:pointer}' +
    '.cw-bk{display:block;text-align:center;padding:10px;background:#F4F2ED;color:#000000;font:700 15px Geist,Barlow,Arial,sans-serif;text-decoration:none;border-top:1px solid #DEDAD1}.cw-bk:hover{background:#FFE3D6}' +
    '.cw-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #DEDAD1;background:#fff}.cw-in{flex:1;min-width:0;border:1px solid #CBC6BA;border-radius:999px;padding:11px 15px;font:500 16px Geist,Barlow,Arial,sans-serif;color:#111;background:#fff}' +
    '.cw-send{border:0;border-radius:999px;background:#111216;color:#fff;padding:0 18px;font:700 15px Geist,Barlow,Arial,sans-serif;cursor:pointer}.cw-send:disabled{opacity:.6}' +
    '.cw-n{padding:6px 14px 10px;font-size:12.5px;color:#5E5F66;background:#fff}.cw-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '@media(max-width:520px){.cw-p{right:0;bottom:0;width:100%;max-width:100%;height:min(86dvh,640px);border-radius:18px 18px 0 0}.cw-btn span{display:none}.cw-btn{padding:0 16px}}' +
    '@media(prefers-reduced-motion:no-preference){.cw-p{animation:cwin .2s ease-out}@keyframes cwin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.className = 'cw-btn'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'cwp');
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.5 7.2L4 20l1-4.5A8 8 0 1121 12z"/></svg><span>Ask me anything</span>';
  btn.setAttribute('aria-label', 'Ask the website assistant');
  var tip = document.createElement('div'); tip.className = 'cw-tip'; tip.hidden = true;
  tip.textContent = 'Questions about what I build? Ask here.';
  var p = document.createElement('div'); p.className = 'cw-p'; p.id = 'cwp'; p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Website assistant');
  p.innerHTML = '<div class="cw-h"><div><b>Ask the assistant</b><span>An AI. No prices. Real person on a free call.</span></div><button class="cw-x" type="button" aria-label="Close chat">&times;</button></div>' +
    '<div class="cw-l" aria-live="polite"><div class="cw-m cw-a">Hi, I am the website assistant. Ask what sonai builds, how working together goes, or which free tool to try.</div></div>' +
    '<div class="cw-c"><button type="button">What do you build?</button><button type="button">Trucking</button><button type="button">Gas stations</button><button type="button">How it works</button></div>' +
    '<a class="cw-bk" href="/book.html">Book a free 15-minute call</a>' +
    '<form class="cw-f" novalidate><input class="cw-in" type="text" maxlength="400" placeholder="Type your question" aria-label="Your question"><div class="cw-hp" aria-hidden="true"><label>Company<input type="text" tabindex="-1" autocomplete="off"></label></div><button class="cw-send" type="submit">Send</button></form>' +
    '<div class="cw-n" role="status">AI answers can be wrong. Do not share passwords or private details. Chats are not saved on this site.</div>';
  document.body.appendChild(tip); document.body.appendChild(btn); document.body.appendChild(p);

  var log = p.querySelector('.cw-l'), form = p.querySelector('.cw-f'), inp = p.querySelector('.cw-in'), hp = p.querySelector('.cw-hp input'),
      send = p.querySelector('.cw-send'), note = p.querySelector('.cw-n'), chips = p.querySelector('.cw-c'), H = [];
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} }
  function open() { p.hidden = false; tip.hidden = true; btn.hidden = true; btn.setAttribute('aria-expanded', 'true'); ss('cwOpen', '1'); setTimeout(function () { inp.focus(); }, 30); }
  function close() { p.hidden = true; btn.hidden = false; btn.setAttribute('aria-expanded', 'false'); ss('cwOpen', '0'); btn.focus(); }
  btn.addEventListener('click', open); p.querySelector('.cw-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) close(); });
  function add(c, t) { var d = document.createElement('div'); d.className = 'cw-m ' + c; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function ask(q) {
    q = q.trim(); if (!q) return;
    add('cw-u', q); inp.value = ''; send.disabled = true; chips.hidden = true; note.textContent = 'Thinking...';
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ msg: q, history: H.slice(-6), website: hp.value }) })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (o) {
        send.disabled = false;
        if (o.j.ok) { H.push({ r: 'u', t: q }, { r: 'a', t: o.j.reply }); add('cw-a', o.j.reply); note.textContent = 'AI answers can be wrong. For anything important, book a free call.'; }
        else { note.textContent = o.s === 429 ? 'Too many questions for now. Please book a call or use the contact form.' : 'The assistant is not available right now. Please book a call or use the contact form.'; }
      })
      .catch(function () { send.disabled = false; note.textContent = 'Could not reach the assistant. Please book a call or use the contact form.'; });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(inp.value); });
  window.__cwAsk = function (q) { open(); if (q) ask(q); };
  chips.addEventListener('click', function (e) { if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });
  if (ss('cwOpen') === '1') open();
  else if (!ss('cwTip')) { setTimeout(function () { if (p.hidden) { tip.hidden = false; ss('cwTip', '1'); setTimeout(function () { tip.hidden = true; }, 9000); } }, 5000); }
  tip.addEventListener('click', open);
})();
