import React from "react";
import { C, IN, Line, MONO, SANS, lerp, makeTiming, pop, ramp, useT } from "../../lib/ui";
import words from "./words.json";

// ---------- timing ----------
export const T = makeTiming(words as Line[], 2.4);
export const { LS, LE } = T;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** start time of the nth word in line `li` whose text starts with `prefix` (punctuation ignored) */
export const at = (li: number, prefix: string, nth = 0) => {
  const p = norm(prefix);
  let n = 0;
  for (const w of T.LINES[li].words) {
    if (norm(w.w).startsWith(p)) {
      if (n === nth) return w.s;
      n++;
    }
  }
  throw new Error(`word "${prefix}" (#${nth}) not found in line ${li}`);
};
export const CHAPTERS: { line: number; no: string; title: string; sub: string }[] = [
  { line: 0, no: "", title: "", sub: "" },
  { line: 7, no: "01", title: "Why this number", sub: "32 switches" },
  { line: 17, no: "02", title: "The view counter", sub: "YouTube · 2014" },
  { line: 26, no: "03", title: "The 248-day jet", sub: "Boeing 787 · 2015" },
  { line: 36, no: "04", title: "The lost spacecraft", sub: "NASA Deep Impact · 2013" },
  { line: 45, no: "05", title: "The share price", sub: "Nasdaq · 2021" },
  { line: 50, no: "06", title: "19 January 2038", sub: "the clock" },
  { line: 62, no: "07", title: "The pattern", sub: "" },
];
/** scene boundaries: a chapter's scenes start right after its title card */
export const chStart = (i: number) => LS(CHAPTERS[i].line) - 0.12;
export const chEnd = (i: number) => (i + 1 < CHAPTERS.length ? LE(CHAPTERS[i + 1].line - 1) + 0.3 : T.END + 1);

export const WID = 1920, HEI = 1080;
export const INT_MAX = 2147483647;
export const fmt = (n: number) => {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + s;
};
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- background ----------
export const WideBackground: React.FC<{ space?: number }> = ({ space = 0 }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", inset: 0, background: C.navy, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: -200, opacity: 1 - space * 0.8,
          backgroundImage: "linear-gradient(rgba(74,222,128,.055) 2px, transparent 2px), linear-gradient(90deg, rgba(74,222,128,.055) 2px, transparent 2px)",
          backgroundSize: "96px 96px", translate: `${(t * 9) % 96}px ${(t * 12) % 96}px`,
        }}
      />
      <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", left: -400 + Math.sin(t * 0.3) * 90, top: -300, background: "radial-gradient(circle, rgba(74,222,128,.11), transparent 65%)" }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", right: -400 + Math.cos(t * 0.27) * 80, top: 300, background: "radial-gradient(circle, rgba(251,146,60,.08), transparent 65%)" }} />
      {space > 0 &&
        [...Array(70)].map((_, i) => {
          const tw = 0.5 + 0.5 * Math.sin(t * (1 + rnd(i) * 2) + i);
          return <div key={i} style={{ position: "absolute", left: ((rnd(i + 1) * WID + t * (4 + rnd(i + 9) * 8)) % (WID + 20)) - 10, top: rnd(i + 2) * HEI, width: 2 + rnd(i + 3) * 3, height: 2 + rnd(i + 3) * 3, borderRadius: 3, background: C.white, opacity: space * (0.25 + 0.6 * tw) }} />;
        })}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(3,6,16,.7) 100%)" }} />
    </div>
  );
};

// ---------- scene wrapper with slow drift ----------
export const Sc: React.FC<{ a: number; b: number; enter?: boolean; exit?: boolean; children: React.ReactNode }> = ({ a, b, enter = true, exit = true, children }) => {
  const t = useT();
  const D = 0.34;
  if (t < a - D / 2 || t > b + D / 2) return null;
  const kin = enter ? ramp(t, a - D / 2, D) : 1;
  const kout = exit ? ramp(t, b - D / 2, D, IN) : 0;
  const drift = 1 + 0.025 * ((t - a) / Math.max(1, b - a));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: kin * (1 - kout), scale: `${lerp(0.94, 1, kin) * lerp(1, 1.08, kout) * drift}`, filter: kin < 1 || kout > 0 ? `blur(${(1 - kin) * 12 + kout * 12}px)` : undefined }}>
      {children}
    </div>
  );
};

// ---------- positioned pop-in ----------
/** Centered at (x,y). Appears with a spring at `at`; optional fade at `out`. */
export const At: React.FC<{ x: number; y: number; at?: number; out?: number; k?: number; rot?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x, y, at: a, out, k, rot = 0, style, children }) => {
  const t = useT();
  let kk = k ?? (a === undefined ? 1 : pop(t, a, 12));
  const o = out === undefined ? 1 : 1 - ramp(t, out, 0.25);
  if (kk <= 0.001 || o <= 0.001) return null;
  kk = Math.max(0, kk);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: `${lerp(0.55, 1, kk)}`, opacity: Math.min(1, kk * 1.6) * o, rotate: `${rot}deg`, whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
};

export const Txt: React.FC<{ size?: number; color?: string; mono?: boolean; weight?: number; glow?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 44, color = C.white, mono, weight, glow, style, children }) => (
  <div style={{ fontFamily: mono ? MONO : SANS, fontWeight: weight ?? (mono ? 800 : 800), fontSize: size, color, lineHeight: 1.12, letterSpacing: mono ? 0 : -0.5, textShadow: glow ? `0 0 ${size * 0.5}px ${color}77` : undefined, textAlign: "center", ...style }}>{children}</div>
);

export const Pill: React.FC<{ color?: string; size?: number; fill?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ color = C.white, size = 40, fill, style, children }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color: fill ? C.navy : color, padding: `${size * 0.22}px ${size * 0.55}px`, borderRadius: size * 0.5, background: fill ? color : "rgba(10,18,38,.92)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 44px ${color}33`, whiteSpace: "nowrap", ...style }}>{children}</div>
);

export const Panel: React.FC<{ w: number; h: number; color?: string; glow?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ w, h, color = C.line, glow = 0, style, children }) => (
  <div style={{ width: w, height: h, position: "relative", borderRadius: 30, background: "linear-gradient(180deg, rgba(26,38,72,.97), rgba(14,23,50,.97))", border: `4px solid ${color}`, boxShadow: `0 30px 90px rgba(0,0,0,.5)${glow ? `, 0 0 ${70 * glow}px ${color}` : ""}`, ...style }}>{children}</div>
);

export const Stamp: React.FC<{ x: number; y: number; at: number; color?: string; size?: number; rot?: number; out?: number; children: React.ReactNode }> = ({ x, y, at: a, color = C.orange, size = 84, rot = -7, out, children }) => {
  const t = useT();
  if (t < a) return null;
  const k = ramp(t, a, 0.16);
  const o = out === undefined ? 1 : 1 - ramp(t, out, 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", rotate: `${rot}deg`, scale: `${lerp(2.4, 1, k)}`, opacity: k * o, fontFamily: MONO, fontWeight: 800, fontSize: size, letterSpacing: 4, color, border: `8px solid ${color}`, borderRadius: 22, padding: `${size * 0.12}px ${size * 0.45}px`, background: "rgba(10,18,38,.9)", boxShadow: `0 0 70px ${color}66`, whiteSpace: "nowrap" }}>{children}</div>
  );
};

export const Check: React.FC<{ k: number; ok?: boolean; size?: number }> = ({ k, ok = true, size = 80 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: ok ? C.green : C.orange, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: size * 0.62, display: "flex", alignItems: "center", justifyContent: "center", scale: `${lerp(0.2, 1, Math.max(0, k))}`, opacity: Math.min(1, Math.max(0, k) * 2), boxShadow: `0 0 50px ${ok ? C.green : C.orange}88`, flex: "none" }}>{ok ? "✓" : "✗"}</div>
);

// ---------- the 32-bit row ----------
/** bits: string of '0'/'1' (MSB first). on: per-cell appear progress fn. sign: highlight MSB in orange. */
export const BitRow: React.FC<{ bits: string; x: number; y: number; cell?: number; gap?: number; sign?: number; appear?: (i: number) => number; dimZero?: boolean }> = ({ bits, x, y, cell = 46, gap = 6, sign = 0, appear, dimZero = true }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", gap }}>
    {bits.split("").map((b, i) => {
      const k = appear ? appear(i) : 1;
      const isSign = i === 0 && sign > 0;
      const col = isSign ? C.orange : b === "1" ? C.green : C.white;
      return (
        <div key={i} style={{ width: cell, height: cell * 1.28, borderRadius: cell * 0.2, border: `3px solid ${isSign ? C.orange : b === "1" ? "rgba(74,222,128,.75)" : "rgba(245,241,232,.22)"}`, background: b === "1" ? (isSign ? "rgba(251,146,60,.2)" : "rgba(74,222,128,.16)") : "rgba(10,18,38,.85)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: cell * 0.62, color: col, opacity: Math.min(1, k * 1.5) * (b === "0" && dimZero && !isSign ? 0.6 : 1), scale: `${lerp(0.3, 1, Math.max(0, k))}`, boxShadow: b === "1" ? `0 0 16px ${isSign ? "rgba(251,146,60,.45)" : "rgba(74,222,128,.35)"}` : undefined, marginRight: i % 8 === 7 && i < bits.length - 1 ? gap * 1.5 : 0, flex: "none" }}>{b}</div>
      );
    })}
  </div>
);
/** width of a BitRow in px */
export const bitRowW = (n: number, cell = 46, gap = 6) => n * cell + (n - 1) * gap + (Math.ceil(n / 8) - 1) * gap * 1.5;
export const toBits = (v: number, n = 32) => (v >>> 0).toString(2).padStart(32, "0").slice(32 - n);

// ---------- top bar: brand + chapter progress ----------
export const TopBar: React.FC = () => {
  const t = useT();
  let cur = 0;
  CHAPTERS.forEach((c, i) => { if (t >= LS(c.line) - 1) cur = i; });
  const segs = CHAPTERS.map((c, i) => {
    const a = LS(c.line), b = i + 1 < CHAPTERS.length ? LS(CHAPTERS[i + 1].line) : T.END;
    return Math.max(0, Math.min(1, (t - a) / (b - a)));
  });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 38, height: 44, display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: C.green, opacity: 0.9 }}>bit by bit</div>
      <div style={{ flex: 1, display: "flex", gap: 8 }}>
        {segs.map((p, i) => (
          <div key={i} style={{ flex: i === 0 || i === 7 ? 0.6 : 1, height: 8, borderRadius: 4, background: "rgba(245,241,232,.14)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: i === cur ? C.green : "rgba(74,222,128,.55)" }} />
          </div>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim, minWidth: 330, textAlign: "right" }}>{CHAPTERS[cur].no ? `${CHAPTERS[cur].no} · ${CHAPTERS[cur].title}` : ""}</div>
    </div>
  );
};

// ---------- chapter title card (plays in the pause before each chapter) ----------
export const ChapterCards: React.FC = () => {
  const t = useT();
  return (
    <>
      {CHAPTERS.slice(1).map((c) => {
        const b = LS(c.line) - 0.1, a = b - 1.0;
        if (t < a - 0.2 || t > b + 0.2) return null;
        const k = pop(t, a, 13) * (1 - ramp(t, b - 0.12, 0.2));
        const line = ramp(t, a + 0.1, 0.5);
        return (
          <div key={c.no} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.85, 1, k)}`, paddingBottom: 60 }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.green, textShadow: "0 0 60px rgba(74,222,128,.5)", lineHeight: 1 }}>{c.no}</div>
            <div style={{ width: 560 * line, height: 6, borderRadius: 3, background: C.green }} />
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 96, color: C.white, letterSpacing: -2 }}>{c.title}</div>
            {c.sub && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.orange }}>{c.sub}</div>}
          </div>
        );
      })}
    </>
  );
};

// ---------- small icons (generic line art, no brand marks) ----------
const glow = (c: string) => ({ overflow: "visible" as const, filter: `drop-shadow(0 0 12px ${c})` });
export const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={glow(color)}>
    <rect x={6} y={18} width={88} height={64} rx={14} fill="none" stroke={color} strokeWidth={7} />
    <path d="M42 36 L64 50 L42 64 Z" fill={color} />
  </svg>
);
export const PlaneIcon: React.FC<{ size?: number; color?: string; dark?: number }> = ({ size = 120, color = C.green, dark = 0 }) => (
  <svg width={size * 2.6} height={size} viewBox="0 0 260 100" style={glow(color)}>
    <path d="M14 56 Q14 42 40 40 L196 40 Q236 42 248 56 Q236 68 196 68 L40 68 Q14 68 14 56 Z" fill={C.navy} stroke={color} strokeWidth={6} />
    <path d="M30 42 L12 10 L34 10 L62 40" fill={C.navy} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <path d="M110 62 L78 94 L104 94 L150 64" fill={C.navy} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    {[...Array(9)].map((_, i) => <rect key={i} x={70 + i * 14} y={48} width={8} height={8} rx={2} fill={dark > 0.5 ? "rgba(245,241,232,.15)" : C.white} opacity={0.9} />)}
    <path d="M218 48 L234 50 L228 56 L216 56 Z" fill={dark > 0.5 ? "rgba(245,241,232,.15)" : C.white} />
  </svg>
);
export const CraftIcon: React.FC<{ size?: number; color?: string }> = ({ size = 140, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={glow(color)}>
    <rect x={36} y={34} width={28} height={32} rx={5} fill={C.navy} stroke={color} strokeWidth={5} />
    <rect x={2} y={40} width={28} height={20} rx={3} fill="rgba(74,222,128,.18)" stroke={color} strokeWidth={4} />
    <path d="M30 50 L36 50" stroke={color} strokeWidth={4} />
    <path d="M12 40 L12 60 M21 40 L21 60" stroke={color} strokeWidth={2} />
    <path d="M64 50 L74 50" stroke={color} strokeWidth={4} />
    <path d="M74 30 Q92 50 74 70 Z" fill={C.navy} stroke={color} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={50} cy={50} r={5} fill={color} />
  </svg>
);
export const ClockIcon: React.FC<{ size?: number; color?: string; t?: number }> = ({ size = 120, color = C.green, t = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={glow(color)}>
    <circle cx={50} cy={50} r={42} fill={C.navy} stroke={color} strokeWidth={6} />
    {[...Array(12)].map((_, i) => <rect key={i} x={48.5} y={12} width={3} height={7} fill={color} style={{ transformOrigin: "50px 50px", rotate: `${i * 30}deg` }} />)}
    <rect x={47.5} y={28} width={5} height={24} rx={2} fill={color} style={{ transformOrigin: "50px 50px", rotate: `${95 + t * 0.5}deg` }} />
    <rect x={48.5} y={16} width={3} height={36} rx={1.5} fill={C.orange} style={{ transformOrigin: "50px 50px", rotate: `${Math.floor(t) * 6}deg` }} />
    <circle cx={50} cy={50} r={4} fill={color} />
  </svg>
);
export const ChartIcon: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={glow(color)}>
    <path d="M10 10 L10 90 L92 90" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
    <path d="M18 76 L38 60 L52 66 L86 22" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 20 L88 20 L88 38" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PhoneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 150, color = C.green }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 60 100" style={glow(color)}>
    <rect x={6} y={4} width={48} height={92} rx={10} fill={C.navy} stroke={color} strokeWidth={5} />
    <rect x={22} y={84} width={16} height={4} rx={2} fill={color} />
  </svg>
);
export const LaptopIcon: React.FC<{ size?: number; color?: string }> = ({ size = 150, color = C.green }) => (
  <svg width={size * 1.4} height={size} viewBox="0 0 140 100" style={glow(color)}>
    <rect x={24} y={14} width={92} height={60} rx={8} fill={C.navy} stroke={color} strokeWidth={5} />
    <path d="M8 84 L132 84 L122 92 L18 92 Z" fill={C.navy} stroke={color} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
export const ChipIcon: React.FC<{ size?: number; color?: string; label?: string }> = ({ size = 130, color = C.orange, label = "32" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={glow(color)}>
    {[26, 42, 58, 74].map((p) => (
      <g key={p} stroke={color} strokeWidth={5} strokeLinecap="round">
        <path d={`M${p} 6 L${p} 20`} /><path d={`M${p} 80 L${p} 94`} /><path d={`M6 ${p} L20 ${p}`} /><path d={`M80 ${p} L94 ${p}`} />
      </g>
    ))}
    <rect x={20} y={20} width={60} height={60} rx={10} fill={C.navy} stroke={color} strokeWidth={6} />
    <text x={50} y={61} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill={color}>{label}</text>
  </svg>
);
