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
  if (st) { const m = w.match(st === '*' ? /^(.*?)\*([^\w*!]*)$/ : /^(.*?)!([^\w*!]*)$/); if (m) { w = m[1] + m[2]; st = null; } }
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
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 380, size: p.titleSize ?? 76, instant: p.instant }) : null;
  const card = mk('div', 'card'); card.style.top = (p.y ?? 760) + 'px';
  card.innerHTML = `<div class="label">${mark(p.label ?? '')}</div><div class="mono" style="font-size:${p.size ?? 112}px;margin-top:20px" data-v></div>`;
  root.appendChild(card); const V = card.querySelector('[data-v]');
  return lt => {
    if (tt) tt(lt);
    const k = E.inout((lt - (p.delay ?? .2)) / (p.dur ?? 1.5));
    const v = p.from + (p.to - p.from) * k;
    V.textContent = (p.prefix ?? '') + (p.decimals ? v.toFixed(p.decimals) : p.raw ? String(Math.round(v)) : fmtInt(v)) + (p.suffix ?? '');
    V.style.color = p.color === 'o' ? 'var(--orange)' : 'var(--green)';
    const kk = p.instant ? 1 : pop(lt, 0); card.style.opacity = clamp(kk * 1.5); card.style.transform = `scale(${.92 + .08 * kk})`;
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

/* endcard: {text, sub, subSize=40} */
C.endcard = (root, p) => {
  const tt = C.title(root, { text: p.text, y: p.y ?? 600, size: p.size ?? 92 });
  const s = mk('div', 'title mono'); s.style.cssText += `;top:${(p.y ?? 600) + 360}px;font-size:${p.subSize ?? 40}px;color:var(--green);font-weight:700`; s.textContent = p.sub ?? 'bit by bit'; root.appendChild(s);
  return lt => { tt(lt); s.style.opacity = clamp(pop(lt, .8)); };
};

/* runtime */
let SPEC = null, SC = [], CAP = [];
window.loadVideo = spec => {
  SPEC = spec;
  if (spec.format === 'landscape') document.documentElement.classList.add('landscape'); const host = document.getElementById('scenes'); host.innerHTML = '';
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
  // highlight runs slightly ahead of the voice: words are weighted by length and spread over the
  // spoken part only (c.se), shifted earlier by captionLead seconds (default 0.18)
  const lead = SPEC.captionLead ?? .18, spoken = Math.max(.2, (c.se ?? c.e) - c.s);
  const wts = c.words.map(({ w }) => w.replace(/[^\w]/g, '').length + 2), tot = wts.reduce((a, b) => a + b, 0);
  const pos = clamp((t - c.s + lead) / spoken) * tot; let acc = 0, i = 0;
  for (; i < wts.length - 1; i++) { acc += wts[i]; if (acc > pos) break; }
  cap.innerHTML = c.words.map(({ w, c: k }, j) => `<span class="w ${j === i ? 'now' : k}">${w}</span>`).join(' ');
};

/* ---------- long-form components (designed for 1920x1080) ---------- */

/* chapter: {num, name} */
C.chapter = (root, p) => {
  const c = mk('div', 'chapter', `<div class="num">CHAPTER ${p.num}</div><div class="name">${mark(p.name)}</div><div class="rule"></div>`);
  root.appendChild(c); const [n, t, r] = c.children;
  return lt => { const a = E.out(lt / .5), b = E.out((lt - .25) / .5), k = E.inout((lt - .4) / .8);
    n.style.opacity = a; t.style.opacity = b; t.style.transform = `translateY(${(1 - b) * 40}px)`; r.style.width = k * 420 + 'px'; };
};

/* diagram: {nodes:[{id,label,sub,x,y,c,at}], edges:[{from,to,at,dash}], packets:[{route:[ids], start, dur, labels:[..], c}], title}
   x,y are pixel centres. Nodes pop in at `at` (default staggered), edges draw at `at`, packets travel along the route. */
C.diagram = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 110, size: p.titleSize ?? 64 }) : null;
  const d = mk('div', 'dia'); root.appendChild(d);
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%'); d.appendChild(svg);
  const pos = {}; (p.nodes || []).forEach(n => pos[n.id] = n);
  const edges = (p.edges || []).map((e, i) => {
    const a = pos[e.from], b = pos[e.to], l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
    l.setAttribute('stroke', e.c === 'o' ? '#FB923C' : e.c === 'g' ? '#4ADE80' : 'rgba(245,241,232,.35)'); l.setAttribute('stroke-width', 5); l.setAttribute('stroke-linecap', 'round');
    const len = Math.hypot(b.x - a.x, b.y - a.y); l.setAttribute('stroke-dasharray', len); svg.appendChild(l);
    return { l, len, at: e.at ?? .3 + i * .2 };
  });
  const nodes = (p.nodes || []).map((n, i) => { const e = mk('div', 'node ' + (n.c || ''), `${mark(n.label)}${n.sub ? `<small>${mark(n.sub)}</small>` : ''}`); e.style.left = n.x + 'px'; e.style.top = n.y + 'px'; d.appendChild(e); return { e, at: n.at ?? i * .18 }; });
  const pk = (p.packets || []).map(k => { const e = mk('div', 'packet ' + (k.c || '')); d.appendChild(e); return { e, k }; });
  return lt => {
    if (tt) tt(lt);
    edges.forEach(({ l, len, at }) => l.setAttribute('stroke-dashoffset', len * (1 - E.inout((lt - at) / .6))));
    nodes.forEach(({ e, at }) => { const k = pop(lt, at, .4); e.style.opacity = clamp(k * 1.5); e.style.transform = `translate(-50%,-50%) scale(${.7 + .3 * k})`; });
    pk.forEach(({ e, k }) => {
      const segs = k.route.length - 1, f = (lt - k.start) / k.dur;
      if (f < 0 || f > 1.15) { e.style.opacity = 0; return; }
      const s = Math.min(segs - 1, Math.floor(clamp(f) * segs)), g = E.inout(clamp(f) * segs - s);
      const a = pos[k.route[s]], b = pos[k.route[s + 1]];
      e.style.left = a.x + (b.x - a.x) * g + 'px'; e.style.top = a.y + (b.y - a.y) * g + 'px';
      e.style.opacity = f > .88 ? clamp((1 - f) / .12) : 1;
      e.innerHTML = (k.labels && (k.labels[s] ?? k.labels[k.labels.length - 1])) || '';
    });
  };
};

/* timeline: {items:[{label, sub, c}], y=520, stagger=.6, title} */
C.timeline = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 180, size: p.titleSize ?? 64 }) : null;
  const w = mk('div', 'tl'); w.style.top = (p.y ?? 520) + 'px'; w.innerHTML = '<div class="line"></div><div class="fill"></div>'; root.appendChild(w);
  const fill = w.querySelector('.fill'), n = p.items.length, st = p.stagger ?? .6;
  const pts = p.items.map((it, i) => { const e = mk('div', 'pt ' + (it.c || ''), `<div class="dot"></div><div class="lab">${mark(it.label)}</div><div class="sub">${mark(it.sub || '')}</div>`); e.style.left = (n === 1 ? 50 : 4 + i * 92 / (n - 1)) + '%'; w.appendChild(e); return e; });
  return lt => { if (tt) tt(lt);
    const t = (lt - .2) / (st * (n - 1) + .001); fill.style.width = clamp(t) * 100 + '%';
    pts.forEach((e, i) => { const k = pop(lt, .2 + i * st, .4); e.style.opacity = clamp(k * 1.5); e.style.transform = `translateX(-50%) translateY(${(1 - k) * 30}px)`; }); };
};

/* linechart: {points:[[x,y]...], xLabels:[..], yMax, unit, x=260,y=220,w=1400,h=560, dur=2.5, end:{label}, note, title} */
C.linechart = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 90, size: p.titleSize ?? 60 }) : null;
  const X = p.x ?? 260, Y = p.y ?? 230, W = p.w ?? 1400, H = p.h ?? 560, NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'chart'); svg.style.left = X + 'px'; svg.style.top = Y + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H + 60); svg.style.overflow = 'visible'; root.appendChild(svg);
  const xs = p.points.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), ym = p.yMax ?? Math.max(...p.points.map(q => q[1]));
  const sx = v => (v - x0) / (x1 - x0) * W, sy = v => H - v / ym * H;
  let html = '';
  [0, .25, .5, .75, 1].forEach(f => { const yy = sy(ym * f); html += `<line x1="0" x2="${W}" y1="${yy}" y2="${yy}" stroke="rgba(245,241,232,.08)" stroke-width="2"/><text class="ax" x="-18" y="${yy + 8}" text-anchor="end">${Math.round(ym * f)}${p.unit ?? ''}</text>`; });
  (p.xLabels || []).forEach(v => html += `<text class="ax" x="${sx(v)}" y="${H + 44}" text-anchor="middle">${v}</text>`);
  const d = p.points.map((q, i) => `${i ? 'L' : 'M'}${sx(q[0])},${sy(q[1])}`).join(' ');
  html += `<path d="${d}" fill="none" stroke="#4ADE80" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" data-p/>`;
  const last = p.points[p.points.length - 1];
  html += `<circle cx="${sx(last[0])}" cy="${sy(last[1])}" r="14" fill="#4ADE80" data-dot/>`;
  if (p.endLabel) html += `<text x="${sx(last[0]) - 24}" y="${sy(last[1]) - 34}" text-anchor="end" font-size="40" font-weight="800" fill="#F5F1E8" data-end>${p.endLabel}</text>`;
  if (p.note) html += `<text class="note" x="${W}" y="${H + 90}" text-anchor="end">${p.note}</text>`;
  svg.innerHTML = html;
  const path = svg.querySelector('[data-p]'), dot = svg.querySelector('[data-dot]'), endT = svg.querySelector('[data-end]'), L = path.getTotalLength();
  path.style.strokeDasharray = L;
  return lt => { if (tt) tt(lt); const k = E.inout((lt - .3) / (p.dur ?? 2.5)); path.style.strokeDashoffset = L * (1 - k);
    const kk = pop(lt, .3 + (p.dur ?? 2.5), .4); dot.style.opacity = clamp(kk * 1.5); if (endT) endT.style.opacity = clamp(kk * 1.5); };
};

/* tunnel: a bullet that moves in discrete per-frame jumps toward a wall (collision / tunnelling demos).
   {pos:[x centres], step=.5, t0=.2, loop, y=820, wall=true, wallX=600, wallW=70, wallH=340, bullet:'o'|'g',
    ghosts=true, frames=true, checks=false, stopOnHit=true, sweep=false, sweepAt=.2, sweepDur=.9, snap=false,
    label, badge, badgeAt=.6, badgeC='g'|'o', title, titleY, titleSize, instant} */
C.tunnel = (root, p) => {
  const tt = p.title ? C.title(root, { text: p.title, y: p.titleY ?? 330, size: p.titleSize ?? 84, instant: p.instant }) : null;
  const Y = p.y ?? 820, WX = p.wallX ?? 600, WW = p.wallW ?? 70, WH = p.wallH ?? 340, BW = 110, BH = 44;
  const box = mk('div', 'tun'); root.appendChild(box);
  if (p.label) { const l = mk('div', 'label', mark(p.label)); l.style.cssText = `position:absolute;left:0;right:0;text-align:center;top:${Y - WH / 2 - 150}px`; box.appendChild(l); }
  const track = mk('div', 'track'); track.style.top = Y + 'px'; box.appendChild(track);
  const wall = p.wall === false ? null : mk('div', 'wall');
  if (wall) { wall.style.cssText = `left:${WX - WW / 2}px;top:${Y - WH / 2}px;width:${WW}px;height:${WH}px`; box.appendChild(wall); }
  const face = WX - WW / 2, hits = x => wall && Math.abs(x - WX) < WW / 2 + BW / 2;
  const pos = p.pos.slice(); let last = pos.length - 1;
  if (p.stopOnHit !== false) { const h = pos.findIndex(hits); if (h >= 0) last = h; }
  const band = p.sweep ? mk('div', 'sweep') : null;
  if (band) { band.style.cssText = `left:${pos[0] - BW / 2}px;top:${Y - BH / 2 - 10}px;height:${BH + 20}px;width:0`; box.appendChild(band); }
  const ghosts = pos.map((x, i) => { const g = mk('div', 'blt ghost ' + (p.bullet ?? 'o')); g.style.cssText = `left:${x - BW / 2}px;top:${Y - BH / 2}px`; box.appendChild(g);
    const f = mk('div', 'flab mono', `frame ${i + 1}`); f.style.cssText = `left:${x - 100}px;top:${Y + 50}px`; box.appendChild(f);
    const c = mk('div', 'chk mono'); c.style.cssText = `left:${x - 130}px;top:${Y - BH / 2 - 70}px`; box.appendChild(c); return { g, f, c }; });
  const b = mk('div', 'blt ' + (p.bullet ?? 'o')); b.style.top = (Y - BH / 2) + 'px'; box.appendChild(b);
  const mark2 = p.sweep ? mk('div', 'hitmk') : null; if (mark2) { mark2.style.cssText = `left:${face - 40}px;top:${Y - 40}px`; box.appendChild(mark2); }
  const hitLab = p.sweep ? mk('div', 'chk mono g', 'HIT') : null; if (hitLab) { hitLab.style.cssText = `left:${face - 130}px;top:${Y - WH / 2 - 62}px;color:var(--green)`; box.appendChild(hitLab); }
  const badge = p.badge ? mk('div', 'badge ' + (p.badgeC ?? 'g'), mark(p.badge)) : null; if (badge) { badge.style.top = (Y + WH / 2 + 90) + 'px'; box.appendChild(badge); }
  const step = p.step ?? .5, t0 = p.t0 ?? .2;
  return lt => {
    if (tt) tt(lt);
    const k0 = p.instant ? 1 : pop(lt, 0); box.style.opacity = clamp(k0 * 1.5);
    const t = p.loop ? lt % p.loop : lt;
    const i = Math.max(0, Math.min(last, lt < 0 ? 0 : Math.floor((t - t0) / step) + 1));
    const since = t - (t0 + (i - 1) * step); // time since landing on i
    let x = pos[i], col = p.bullet ?? 'o';
    ghosts.forEach(({ g, f, c }, j) => {
      const seen = j < i && p.ghosts !== false; g.style.opacity = seen ? .28 : 0;
      f.style.opacity = (j <= i && p.frames !== false && (!p.onlyCur || j === i)) ? 1 : 0; f.classList.toggle('cur', j === i);
      const h = hits(pos[j]); c.textContent = h ? 'HIT' : 'no overlap'; c.style.color = h ? 'var(--green)' : (p.missC === 'dim' ? 'var(--dim)' : 'var(--orange)');
      c.style.opacity = (p.checks && j <= i && (!p.onlyCur || j === i) && (j < i || since > .08 || i === 0)) ? 1 : 0;
    });
    const hitNow = hits(pos[i]) && i === last;
    let wallHit = hitNow && since > 0;
    if (band) {
      const sk = p.sweepAt < 0 ? 1 : E.inout((lt - (p.sweepAt ?? .2)) / (p.sweepDur ?? .9));
      const full = pos[last] - pos[0]; const reach = pos[0] - BW / 2 + sk * (full + BW);
      const front = Math.min(reach, face); band.style.width = Math.max(0, front - (pos[0] - BW / 2)) + 'px';
      const got = reach >= face; wallHit = wallHit || got;
      const tg = p.sweepAt < 0 ? lt : lt - (p.sweepAt ?? .2) - (p.sweepDur ?? .9) * .5;
      mark2.style.opacity = got ? 1 : 0; mark2.style.transform = `scale(${got ? .9 + .25 * Math.abs(Math.sin(lt * 5)) : .5})`;
      hitLab.style.opacity = got ? 1 : 0; band.classList.toggle('done', got);
      if (got) ghosts.forEach(({ c }) => c.style.opacity = 0);
      if (got && p.snap) { const s = E.inout((tg - .1) / .5); x = pos[last] + ((face - BW / 2) - pos[last]) * clamp(s); col = 'g'; }
    }
    b.style.left = (x - BW / 2) + 'px'; b.className = 'blt ' + col;
    const fl = since >= 0 && since < .12 && i > 0 ? 1 - since / .12 : 0; b.style.boxShadow = `0 0 ${30 + 60 * fl}px ${col === 'g' ? 'rgba(74,222,128,.7)' : 'rgba(251,146,60,.7)'}`;
    if (wall) wall.classList.toggle('hit', wallHit);
    if (badge) { const kb = pop(lt, p.badgeAt ?? .6, .4); badge.style.opacity = clamp(kb * 1.5); badge.style.transform = `translateX(-50%) scale(${.85 + .15 * kb})`; }
  };
};
