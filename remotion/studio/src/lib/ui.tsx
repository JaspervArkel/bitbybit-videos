import React from "react";
import { Easing, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

// ---------- brand ----------
export const C = {
  navy: "#101B35",
  navyDeep: "#0A1226",
  panel: "#0D1630",
  green: "#4ADE80",
  orange: "#FB923C",
  white: "#F5F1E8",
  dim: "rgba(245,241,232,.5)",
  line: "rgba(245,241,232,.12)",
};
export const SANS = "Inter";
export const MONO = "JetBrains Mono";
for (const [w, file] of [["500", "Inter-Medium.otf"], ["600", "Inter-SemiBold.otf"], ["700", "Inter-Bold.otf"], ["800", "Inter-ExtraBold.otf"], ["900", "Inter-Black.otf"]]) {
  loadFont({ family: SANS, url: staticFile(`fonts/${file}`), weight: w });
}
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-800-normal.woff2"), weight: "800" });

// ---------- timing ----------
export const FPS = 30;
export type Word = { w: string; st: string; s: number; e: number };
export type Line = { s: number; e: number; words: Word[] };
/** Per-video timing helpers built from that video's words.json */
export const makeTiming = (lines: Line[], tail = 1.1) => {
  const END = lines[lines.length - 1].e + tail;
  return {
    LINES: lines,
    W: (li: number, wi: number) => lines[li].words[wi].s, // word start (s)
    WE: (li: number, wi: number) => lines[li].words[wi].e,
    LS: (li: number) => lines[li].s,
    LE: (li: number) => lines[li].e,
    END,
    TOTAL_FRAMES: Math.ceil(END * FPS),
  };
};
export const useT = () => useCurrentFrame() / FPS;

// ---------- motion helpers ----------
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);
export const ramp = (t: number, a: number, d: number, ease = OUT) =>
  interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pop = (t: number, at: number, damping = 11, stiffness = 170) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
export const shake = (t: number, at: number, amp = 16, d = 0.45) =>
  t < at || t > at + d ? 0 : Math.sin((t - at) * 75) * amp * (1 - (t - at) / d);

// ---------- background ----------
export const Background: React.FC<{ retro: number }> = ({ retro }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", inset: 0, background: C.navy, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: -200,
          backgroundImage: `linear-gradient(rgba(74,222,128,${0.05 + retro * 0.03}) 2px, transparent 2px), linear-gradient(90deg, rgba(74,222,128,${0.05 + retro * 0.03}) 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
          translate: `0px ${(t * 14) % 90}px`,
        }}
      />
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", left: -300 + Math.sin(t * 0.4) * 80, top: 200, background: `radial-gradient(circle, rgba(74,222,128,${0.1 + retro * 0.08}), transparent 65%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", right: -350 + Math.cos(t * 0.35) * 70, top: 1000, background: `radial-gradient(circle, rgba(251,146,60,${0.09 * (1 - retro)}), transparent 65%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(3,6,16,.75) 100%)" }} />
    </div>
  );
};

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const x = (f * 137) % 512, y = (f * 251) % 512;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "overlay", backgroundImage: `url(${staticFile("grain.png")})`, backgroundPosition: `${x}px ${y}px`, pointerEvents: "none" }} />
  );
};

export const Bug: React.FC = () => (
  <div style={{ position: "absolute", top: 118, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: C.green, opacity: 0.8 }}>
    bit by bit
  </div>
);

// ---------- scene wrapper: soft zoom/blur crossfades ----------
export const Scene: React.FC<{ a: number; b: number; enter?: boolean; exit?: boolean; children: React.ReactNode }> = ({ a, b, enter = true, exit = true, children }) => {
  const t = useT();
  const D = 0.32;
  if (t < a - D / 2 || t > b + D / 2) return null;
  const kin = enter ? ramp(t, a - D / 2, D) : 1;
  const kout = exit ? ramp(t, b - D / 2, D, IN) : 0;
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        opacity: kin * (1 - kout),
        scale: `${lerp(0.9, 1, kin) * lerp(1, 1.14, kout)}`,
        filter: kin < 1 || kout > 0 ? `blur(${(1 - kin) * 14 + kout * 14}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

// ---------- era tag (lower-third style, top-left) ----------
export const EraTag: React.FC<{ text: string; at: number; until: number }> = ({ text, at, until }) => {
  const t = useT();
  const k = pop(t, at, 14) * (1 - ramp(t, until - 0.2, 0.25));
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k, translate: `0px ${(1 - k) * -30}px` }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.navy, background: C.green, padding: "12px 30px", borderRadius: 999, letterSpacing: 2, boxShadow: "0 0 60px rgba(74,222,128,.35)" }}>
        {text}
      </div>
    </div>
  );
};

// ---------- icons ----------
export const FolderIcon: React.FC<{ w?: number; slash?: number; glow?: number; tint?: string }> = ({ w = 170, slash = 0, glow = 0, tint }) => {
  const h = w * 0.74;
  return (
    <div style={{ width: w, height: h, position: "relative", filter: glow ? `drop-shadow(0 0 ${30 * glow}px rgba(251,191,36,${0.6 * glow}))` : undefined }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w * 0.45, height: h * 0.3, borderRadius: `${w * 0.06}px ${w * 0.06}px 0 0`, background: tint ?? "#D9890A" }} />
      <div style={{ position: "absolute", left: 0, top: h * 0.14, width: w, height: h * 0.86, borderRadius: w * 0.07, background: tint ?? "linear-gradient(#F7B733,#E89A0C)" }} />
      <div style={{ position: "absolute", left: 0, top: h * 0.3, width: w, height: h * 0.7, borderRadius: w * 0.07, background: tint ? "rgba(255,255,255,.15)" : "linear-gradient(#FFD45C,#FBBF24)" }} />
      {slash > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "55%", width: w * 1.15 * slash, height: 14, marginLeft: -(w * 1.15 * slash) / 2, background: C.orange, borderRadius: 7, rotate: "-32deg", boxShadow: "0 0 30px rgba(251,146,60,.7)" }} />
      )}
    </div>
  );
};

export const Cursor: React.FC<{ x: number; y: number; down?: number; opacity?: number }> = ({ x, y, down = 0, opacity = 1 }) => (
  <svg width={64} height={80} viewBox="0 0 32 40" style={{ position: "absolute", left: x, top: y, scale: `${1 - down * 0.15}`, opacity, transformOrigin: "0 0", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
    <path d="M2 2 L2 30 L9.5 23.5 L14.5 35 L19 33 L14 21.5 L24 21.5 Z" fill="#fff" stroke="#0A1226" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

// Line-art device icons (stroke = green), drawn on a 200x200 box
const S: React.CSSProperties = { overflow: "visible" };
export const Monitor: React.FC<{ size?: number; on?: number; color?: string }> = ({ size = 220, on = 1, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ ...S, filter: `drop-shadow(0 0 ${14 * on}px ${color})` }}>
    <rect x={20} y={20} width={160} height={120} rx={18} fill="none" stroke={color} strokeWidth={8} />
    <rect x={38} y={38} width={124} height={84} rx={8} fill={color} opacity={0.12 + 0.18 * on} />
    <text x={48} y={92} fontFamily={MONO} fontWeight={800} fontSize={30} fill={color} opacity={on}>A&gt;_</text>
    <path d="M80 140 L72 172 L128 172 L120 140" fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);
export const Keyboard: React.FC<{ size?: number; color?: string; press?: number }> = ({ size = 220, color = C.green, press = 0 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100" style={{ ...S, filter: `drop-shadow(0 0 10px ${color})` }}>
    <rect x={6} y={10} width={188} height={80} rx={14} fill="none" stroke={color} strokeWidth={7} />
    {[0, 1, 2].map((r) =>
      [...Array(8 - r)].map((_, c) => (
        <rect key={`${r}-${c}`} x={22 + r * 10 + c * 20} y={24 + r * 20} width={14} height={12} rx={3} fill={color} opacity={(r * 8 + c) % 5 === Math.floor(press * 10) % 5 ? 0.9 : 0.35} />
      ))
    )}
  </svg>
);
export const Printer: React.FC<{ size?: number; paper?: number; color?: string }> = ({ size = 220, paper = 0, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ ...S, filter: `drop-shadow(0 0 12px ${color})` }}>
    {/* paper coming out of the top */}
    <g opacity={paper > 0 ? 1 : 0}>
      <rect x={52} y={70 - 70 * paper} width={96} height={70 * paper + 10} fill="#F5F1E8" rx={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={64} y={84 - 70 * paper + i * 14} width={i % 2 ? 50 : 72} height={5} rx={2} fill="#101B35" opacity={paper > 0.2 + i * 0.18 ? 0.7 : 0} />
      ))}
    </g>
    <rect x={20} y={70} width={160} height={78} rx={16} fill={C.navy} stroke={color} strokeWidth={8} />
    <rect x={44} y={148} width={112} height={30} rx={6} fill="none" stroke={color} strokeWidth={8} />
    <circle cx={152} cy={96} r={7} fill={color} />
    <rect x={44} y={80} width={70} height={6} rx={3} fill={color} opacity={0.5} />
  </svg>
);
export const Vortex: React.FC<{ size?: number; k?: number }> = ({ size = 220, k = 1 }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ ...S, scale: `${k}`, filter: "drop-shadow(0 0 18px rgba(251,146,60,.6))" }}>
      <circle cx={100} cy={100} r={92} fill="rgba(2,4,10,.55)" />
      {[88, 70, 52, 34].map((r, i) => (
        <circle key={r} cx={100} cy={100} r={r} fill="none" stroke={C.orange} strokeWidth={6 - i} strokeDasharray={`${r * 1.2} ${r * 0.6}`} opacity={0.35 + i * 0.18}
          style={{ transformOrigin: "100px 100px", rotate: `${t * (90 + i * 70) * (i % 2 ? -1 : 1)}deg` }} />
      ))}
      <circle cx={100} cy={100} r={20} fill="#02040A" stroke={C.orange} strokeWidth={4} />
    </svg>
  );
};
export const DocIcon: React.FC<{ label?: string; w?: number }> = ({ label = "LETTER.TXT", w = 130 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <svg width={w} height={w * 1.25} viewBox="0 0 100 125">
      <path d="M6 4 H66 L94 32 V121 H6 Z" fill="#F5F1E8" />
      <path d="M66 4 V32 H94" fill="#C9C3B5" />
      {[48, 62, 76, 90, 104].map((y, i) => <rect key={y} x={18} y={y} width={i % 2 ? 50 : 64} height={6} rx={3} fill="#101B35" opacity={0.55} />)}
    </svg>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.white, background: "rgba(16,27,53,.85)", padding: "4px 12px", borderRadius: 8 }}>{label}</div>
  </div>
);

// glowing cable drawn with progress p (0..1) + travelling pulse
export const Cable: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; color?: string; bend?: number; pulse?: boolean }> = ({ x1, y1, x2, y2, p, color = C.green, bend = 0.5, pulse = true }) => {
  const t = useT();
  if (p <= 0) return null;
  const mx = lerp(x1, x2, bend);
  const d = `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.35 + 40;
  const q = (t * 0.9) % 1;
  // approximate pulse position along cubic
  const bez = (k: number) => {
    const u = 1 - k;
    return [u * u * u * x1 + 3 * u * u * k * mx + 3 * u * k * k * mx + k * k * k * x2, u * u * u * y1 + 3 * u * u * k * y1 + 3 * u * k * k * y2 + k * k * k * y2];
  };
  const [px, py] = bez(q);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
      <path d={d} fill="none" stroke={color} strokeWidth={14} opacity={0.18} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      {pulse && p >= 1 && <circle cx={px} cy={py} r={9} fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${color})` }} />}
    </svg>
  );
};

export const Chip: React.FC<{ text: string; color?: string; size?: number; k?: number; style?: React.CSSProperties }> = ({ text, color = C.green, size = 64, k = 1, style }) => (
  <div style={{
    fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.4}px`, borderRadius: size * 0.32,
    border: `4px solid ${color}`, background: "rgba(10,18,38,.85)", boxShadow: `0 0 ${40 * k}px ${color}55, inset 0 0 30px ${color}22`,
    scale: `${lerp(0.4, 1, k)}`, opacity: Math.min(1, k * 1.5), letterSpacing: 2, ...style,
  }}>
    {text}
  </div>
);

