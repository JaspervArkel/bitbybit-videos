/* Bit by Bit brand kit runtime.
   loadVideo(spec) builds scenes; render(t) draws time t (seconds) deterministically.
   Text markup: *word* = green, !word! = orange.  */
const clamp = (t, a = 0, b = 1) => Math.min(b, Math.max(a, t));
const E = {
  out: t => 1 - Math.pow(1 - clamp(t), 3),
  inout: t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  back: t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
/* split text into words, carrying *green* / !orange! spans across spaces: [{w, c}] */
const tokens = text => { let st = null; return text.split(/\s+/).map(raw => { let w = raw, c = st;
  const open = w.match(/^([*!])/); if (!st && open) { st = open[1]; c = st; w = w.slice(1); }
  if (st && w.endsWith(st)) { w = w.slice(0, -1); st = null; } else if (st && w.length > 1 && w.slice(0, -1).endsWith(st)) { w = w.replace(st, ''); st = null; }
  return { w, c: c === '*' ? 'g' : c === '!' ? 'o' : '' }; }); };
const mark = s => String(s).replace(/\*([^*]+)\*/g, '<span class="g">$1</span>').replace(/!([^!]+)!/g, '<span class="o">$1</span>');
const pad = n => String(n).padStart(2, '0');
const fmtInt = n => Math.round(n).toLocaleString('en-US');
const int32 = x => { x = Math.floor(x); x = ((x % 4294967296) + 4294967296) % 4294967296; return x >= 2147483648 ? x - 4294967296 : x; };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const utc = s => { const d = new Date(s * 1000); return { date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`, pretty: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}` }; };
const pop = (lt, delay = 0, d = .35) => E.back((lt - delay) / d);

/* Words that pop in one by one. */
function words(parent, text, cls, lt0 = 0, stagger = .07, instant = false) {
  const spans = tokens(text).map(({ w, c }) => { const s = mk('span', 'w ' + c, w); parent.appendChild(s); return s; });
  return lt => spans.forEach((s, i) => { const k = instant ? 1 : pop(lt, lt0 + i * stagger, .3); s.style.opacity = clamp(k * 1.5); s.style.transform = `translateY(${(1 - k) * 40}px) scale(${.9 + .1 * k})`; });
}

const C = {};

/* title: {text, y=420, size=88} */
C.title = (root, p) => {
  const t = mk('div', 'title'); t.style.top = (p.y ?? 420) + 'px'; t.style.fontSize = (p.size ?? 88) + 'px'; root.appendChild(t);
  return words(t, p.text, null, p.delay ?? 0, .07, p.instant);
};

/* clock: {from (unix s), rate=1, wrap32=true, y=760, label, title} */
C.clock = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 330, size: p.titleSize ?? 80, instant: p.instant }) : null;
  const tt2 = p.titleAfter ? (() => { const d = mk('div', 'title'); d.style.top = (p.titleY ?? 330) + 'px'; d.style.fontSize = (p.titleSize ?? 80) + 'px'; d.style.opacity = 0; d.innerHTML = mark(p.titleAfter); root.appendChild(d); return d; })() : null;
  const card = mk('div', 'card'); card.style.top = (p.y ?? 760) + 'px';
  card.innerHTML = `<div class="label">${p.label ?? 'system clock'}</div><div class="mono" style="font-size:92px;margin-top:20px" data-d></div><div class="mono" style="font-size:132px" data-t></div>`;
  root.appendChild(card);
  const D = card.querySelector('[data-d]'), T = card.querySelector('[data-t]');
  const rate = p.rate ?? 1;
  const wrapAt = p.wrap32 === false ? Infinity : (2147483648 - p.from) / rate; // local time of overflow
  return lt => {
    if (tt) tt(lt);
    const raw = p.from + Math.floor(lt * rate);
    const s = p.wrap32 === false ? raw : int32(raw);
    const u = utc(s); D.textContent = u.date; T.textContent = u.time;
    const broke = lt >= wrapAt;
    card.classList.toggle('alert', broke);
    D.style.color = T.style.color = broke ? 'var(--orange)' : 'var(--green)';
    const sh = broke ? Math.sin(lt * 80) * 16 * clamp(1 - (lt - wrapAt) / .6) : 0;
    const k = p.instant ? 1 : pop(lt, .05);
    card.style.opacity = clamp(k * 1.5);
    card.style.transform = `translateX(${sh}px) scale(${.92 + .08 * k})`;
    if (tt2) { const kk = E.out((lt - wrapAt) / .3); tt2.style.opacity = broke ? kk : 0; if (tt) root.querySelector('.title').style.opacity = broke ? 1 - kk : 1; }
  };
};

/* bitrow: {bits=32, from, rate=0, signed=true, y=640, label, showDec=true, decY} */
C.bitrow = (root, p) => {
  const n = p.bits ?? 32, per = 8;
  const lab = mk('div', 'label'); lab.style.cssText = `position:absolute;left:0;right:0;text-align:center;top:${(p.y ?? 640) - 90}px`; lab.innerHTML = mark(p.label ?? `${p.signed === false ? 'unsigned' : 'signed'} ${n}-bit integer`); root.appendChild(lab);
  const wrap = mk('div', 'bits' + (n > 16 ? ' small' : '')); wrap.style.top = (p.y ?? 640) + 'px'; root.appendChild(wrap);
  const cells = [];
  for (let r = 0; r < n / per; r++) { const row = mk('div', 'row'); for (let c = 0; c < per; c++) { const b = mk('div', 'bit', '0'); if (r === 0 && c === 0 && p.signed !== false) b.classList.add('sign'); row.appendChild(b); cells.push(b); } wrap.appendChild(row); }
  const dec = p.showDec === false ? null : mk('div', 'dec'); if (dec) { dec.style.cssText += `;position:absolute;left:0;right:0;top:${p.decY ?? ((p.y ?? 640) + (n / per) * 128 + 50)}px`; root.appendChild(dec); }
  return lt => {
    let raw = p.from + Math.floor(lt * (p.rate ?? 0));
    if (p.stop != null) raw = Math.min(raw, p.stop);
    const mod = 2 ** n; const u = ((raw % mod) + mod) % mod;
    const v = p.signed === false ? u : (u >= mod / 2 ? u - mod : u);
    const bin = u.toString(2).padStart(n, '0');
    cells.forEach((b, i) => { const on = bin[i] === '1'; b.textContent = bin[i]; b.classList.toggle('on', on); b.classList.toggle('neg', v < 0); const k = pop(lt, .02 * i, .3); b.style.opacity = clamp(k * 1.5); b.style.transform = `scale(${.6 + .4 * k})`; });
    if (dec) { dec.textContent = fmtInt(v); dec.style.color = v < 0 ? 'var(--orange)' : 'var(--white)'; dec.style.opacity = clamp(pop(lt, .3)); }
    lab.style.opacity = clamp(pop(lt, 0));
  };
};

/* counter: {from, to, dur, y=760, label, prefix, suffix, decimals=0, color, title} */
C.counter = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 380, size: p.titleSize ?? 76 }) : null;
  const card = mk('div', 'card'); card.style.top = (p.y ?? 760) + 'px';
  card.innerHTML = `<div class="label">${mark(p.label ?? '')}</div><div class="mono" style="font-size:${p.size ?? 112}px;margin-top:20px" data-v></div>`;
  root.appendChild(card); const V = card.querySelector('[data-v]');
  return lt => {
    if (tt) tt(lt);
    const k = E.inout((lt - (p.delay ?? .2)) / (p.dur ?? 1.5));
    const v = p.from + (p.to - p.from) * k;
    V.textContent = (p.prefix ?? '') + (p.decimals ? v.toFixed(p.decimals) : fmtInt(v)) + (p.suffix ?? '');
    V.style.color = p.color === 'o' ? 'var(--orange)' : 'var(--green)';
    const kk = pop(lt, 0); card.style.opacity = clamp(kk * 1.5); card.style.transform = `scale(${.92 + .08 * kk})`;
  };
};

/* tokens: {word, pieces:[{t, id}], split=0.8, y=700} */
C.tokens = (root, p) => {
  const cols = ['#4ADE80', '#FB923C', '#60A5FA', '#F472B6', '#FACC15'];
  const whole = mk('div', 'title'); whole.style.top = (p.y ?? 700) + 'px'; whole.style.fontSize = '120px'; whole.innerHTML = `<span class="mono">${p.word}</span>`; root.appendChild(whole);
  const box = mk('div', 'chips'); box.style.top = (p.y ?? 700) - 20 + 'px'; root.appendChild(box);
  const chips = p.pieces.map((pc, i) => { const c = mk('div', 'chip', `${pc.t}<small>${pc.id ?? ''}</small>`); c.style.background = cols[i % cols.length] + '26'; c.style.border = `4px solid ${cols[i % cols.length]}`; c.style.color = cols[i % cols.length]; box.appendChild(c); return c; });
  return lt => {
    const s = p.split ?? .8; const k = E.out((lt - s) / .45);
    whole.style.opacity = lt < s ? clamp(pop(lt, 0) * 1.5) : 1 - k;
    chips.forEach((c, i) => { const kk = E.back((lt - s - i * .12) / .4); c.style.opacity = clamp(kk * 1.4); c.style.transform = `translateY(${(1 - kk) * 60}px) rotate(${(1 - kk) * (i % 2 ? 6 : -6)}deg)`; });
  };
};

/* code: {lines:[], cps=28, y=560, output, outputColor='o', outputAt} */
C.code = (root, p) => {
  const box = mk('div', 'code'); box.style.top = (p.y ?? 560) + 'px'; box.innerHTML = '<div class="dots"><i></i><i></i><i></i></div><div data-c></div>'; root.appendChild(box);
  const body = box.querySelector('[data-c]'); const src = p.lines.join('\n');
  return lt => {
    const n = Math.floor(clamp(lt - .2, 0, 99) * (p.cps ?? 28));
    let html = src.slice(0, n).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    if (p.output && lt >= (p.outputAt ?? (src.length / (p.cps ?? 28) + .6))) html += `\n<span class="${p.outputColor ?? 'o'}">${p.output}</span>`;
    else if (Math.floor(lt * 2.5) % 2 === 0) html += '<span class="cursor"></span>';
    body.innerHTML = html;
    const k = pop(lt, 0); box.style.opacity = clamp(k * 1.5); box.style.transform = `translateY(${(1 - k) * 50}px)`;
  };
};

/* bar: {segments:[{w, d, slow}], y=760} — w = share of the bar, d = seconds it takes */
C.bar = (root, p) => {
  const w = mk('div', 'barwrap'); w.style.top = (p.y ?? 760) + 'px'; w.innerHTML = '<div class="pct mono" data-p>0%</div><div class="bar"></div>'; root.appendChild(w);
  const bar = w.querySelector('.bar'), P = w.querySelector('[data-p]');
  const segs = p.segments.map(s => { const e = mk('div', 'seg' + (s.slow ? ' slow' : '')); e.style.flex = s.w; e.innerHTML = '<i></i>'; bar.appendChild(e); return e; });
  const total = p.segments.reduce((a, s) => a + s.w, 0);
  return lt => {
    let t = lt - .3, done = 0;
    p.segments.forEach((s, i) => { const f = clamp(t / s.d); segs[i].firstChild.style.width = f * 100 + '%'; done += s.w * f; t -= s.d; });
    P.textContent = Math.floor(done / total * 100) + '%';
    const k = pop(lt, 0); w.style.opacity = clamp(k * 1.5);
  };
};

/* list: {items:[{label, value, c:'g'|'o'}], y=560, stagger=.45} */
C.list = (root, p) => {
  const l = mk('div', 'list'); l.style.top = (p.y ?? 560) + 'px'; root.appendChild(l);
  const its = p.items.map(it => { const e = mk('div', 'item ' + (it.c ?? ''), `<span>${mark(it.label)}</span><span class="v ${it.c ?? ''}">${mark(it.value)}</span>`); l.appendChild(e); return e; });
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 330, size: p.titleSize ?? 76 }) : null;
  return lt => { if (tt) tt(lt); its.forEach((e, i) => { const k = pop(lt, (p.delay ?? .1) + i * (p.stagger ?? .45), .4); e.style.opacity = clamp(k * 1.5); e.style.transform = `translateX(${(1 - k) * -120}px)`; }); };
};

/* endcard: {text, sub} */
C.endcard = (root, p) => {
  const tt = C.title(root, { text: p.text, y: p.y ?? 600, size: p.size ?? 92 });
  const s = mk('div', 'title mono'); s.style.cssText += `;top:${(p.y ?? 600) + 360}px;font-size:40px;color:var(--green);font-weight:700`; s.textContent = p.sub ?? 'bit by bit'; root.appendChild(s);
  return lt => { tt(lt); s.style.opacity = clamp(pop(lt, .8)); };
};

/* runtime */
let SPEC = null, SC = [], CAP = [];
window.loadVideo = spec => {
  SPEC = spec; const host = document.getElementById('scenes'); host.innerHTML = '';
  SC = spec.scenes.map(s => {
    const root = mk('div', 'scene'); host.appendChild(root);
    const fn = C[s.type](root, s); return { s, root, fn };
  });
  CAP = (spec.captions ?? []).map(c => ({ ...c, words: tokens(c.text) }));
  render(0);
};
window.render = t => {
  document.querySelector('#bg .grid').style.transform = `translate(${-t * 12}px,${-t * 28}px)`;
  SC.forEach(({ s, root, fn }) => {
    const on = t >= s.start && t < s.end;
    root.style.display = on ? 'block' : 'none'; if (!on) return;
    const lt = t - s.start, out = s.end - t;
    const kin = (s.cutIn || s.start === 0) ? 1 : E.out(lt / .3), kout = s.cutOut ? 1 : E.out(out / .25);
    root.style.opacity = Math.min(kin, kout);
    root.style.transform = `translateY(${(1 - kin) * 50 - (1 - kout) * 40}px)`;
    fn(lt);
  });
  const cap = document.getElementById('caption');
  const c = CAP.find(c => t >= c.s && t < c.e);
  if (!c || c.hide || SPEC.captionsOff) { cap.innerHTML = ''; return; }
  const n = c.words.length, i = Math.min(n - 1, Math.floor((t - c.s) / (c.e - c.s) * n));
  cap.innerHTML = c.words.map(({ w, c: k }, j) => `<span class="w ${j === i ? 'now' : k}">${w}</span>`).join(' ');
};
