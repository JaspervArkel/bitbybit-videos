/*
 * STORYBOARD — "Your microwave jams your Wi-Fi". One kitchen world: a microwave, a Wi-Fi router, a video call,
 * plus a radio spectrum panel (2.4 GHz band, later split to show the 5 GHz band). Real values: microwave ovens run
 * near 2.45 GHz (wavelength ≈ 12 cm); Wi-Fi 2.4 GHz channels 1/6/11 at 2.412/2.437/2.462 GHz (20 MHz wide);
 * typical powers ≈1,000 W (oven) vs ≈0.1 W (router, EU 2.4 GHz limit 100 mW) — labelled "typical".
 *  L0  "Your microwave is jamming your Wi-Fi."  Frame 0: headline "Your microwave / JAMS WI-FI" + microwave running
 *                       (timer counting, plate turning, orange rings), router (green rings), call window frozen
 *                       "Reconnecting…" with orange static. Call shakes + ✕ on "jamming".
 *  L1  "Start it, and the video call freezes."  Rewind: oven off, call live (avatar talks, 4 bars). START lights on
 *                       "Start", oven hums, rings spread on "video"; call freezes + static on "freezes".
 *  L2  "A microwave oven heats food"           New scene: cut-away of the oven; soup bowl; turns hot + steam on "heats".
 *  L3  "with a very powerful radio signal"     ≈1,000 W chip on "powerful"; wave train from the source into the bowl on "radio".
 *  L4  "in the 2.4 gigahertz band."            Spectrum panel rises on "2.4": axis 2.40–2.50 GHz; orange oven hump grows.
 *  L5  "Lots of Wi-Fi uses that same band."    Green channel humps 1/6/11 rise on "Wi-Fi"; overlap flashes + "same band" on "same".
 *  L6  "The metal box and the mesh in the door" New scene: oven front, big. Box outline glows on "metal box"; rings
 *                       bounce inside; magnifier on the door mesh on "mesh" (holes vs a 12 cm wave).
 *  L7  "hold almost all of it in."             Wave bounces back off the mesh; "contained" ticks on "almost all".
 *  L8  "But almost isn't everything."          A tiny orange arc slips out of the door seam on "almost"; glows on "everything".
 *  L9  "A tiny leak from that much power"      Router slides in right; leak rings spread to it; ≈1,000 W vs ≈0.1 W chips on "much power".
 *  L10 "can drown out your router nearby."     Orange static floods the router's green rings on "drown"; bars drop; call freezes on "router".
 *  L11 "Switch to 5 gigahertz Wi-Fi,"           New scene: spectrum + call. Band toggle flips to 5 GHz on "5"; axis splits;
 *                       green humps fly to the 5 GHz band on "Wi-Fi".
 *  L12 "and the microwave can't touch it."     Oven hump pulses on "microwave" (still on); call unfreezes on "can't touch";
 *                       implication ending: takeaway "Oven on. / 5 GHz: clear". Slow push-in.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, WE, LS } = T;
export const MICROWAVE_WIFI_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/microwave-wifi/${p}`);
const HOT = "#FBBF24";

// deterministic pseudo-random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- pieces ----------
/** Microwave oven (design box 520x330). on: 0..1, press: START button glow */
const Microwave: React.FC<{ x: number; y: number; w: number; on: number; press?: number; outline?: number; meshGlow?: number; timer?: number }> = ({ x, y, w, on, press = 0, outline = 0, meshGlow = 0, timer = 90 }) => {
  const t = useT();
  const s = w / 520;
  const sec = Math.max(0, Math.ceil(timer - t));
  const disp = on > 0.5 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}` : "12:00";
  const hum = on > 0.5 ? Math.sin(t * 40) * 0.6 : 0;
  const plateX = Math.sin(t * 2.2) * 70 * on;
  const plateScale = 1 - Math.abs(Math.cos(t * 2.2)) * 0.12 * on;
  return (
    <svg style={{ position: "absolute", left: x, top: y + hum, overflow: "visible", filter: outline ? `drop-shadow(0 0 ${30 * outline}px ${C.green})` : "drop-shadow(0 20px 40px rgba(0,0,0,.5))" }} width={w} height={330 * s} viewBox="0 0 520 330">
      <defs>
        <pattern id="mesh" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2.1" fill="#0A1226" /></pattern>
        <radialGradient id="glowIn" cx="50%" cy="60%" r="70%"><stop offset="0%" stopColor="#FFE7A8" /><stop offset="100%" stopColor="#B4691C" /></radialGradient>
      </defs>
      <rect x={4} y={4} width={512} height={300} rx={26} fill="#1C2A4D" stroke={outline ? C.green : "rgba(245,241,232,.35)"} strokeWidth={outline ? 6 : 4} />
      <rect x={30} y={304} width={40} height={18} rx={6} fill="#1C2A4D" /><rect x={450} y={304} width={40} height={18} rx={6} fill="#1C2A4D" />
      {/* window */}
      <rect x={30} y={30} width={320} height={248} rx={16} fill={on > 0.01 ? "url(#glowIn)" : "#0A1226"} opacity={lerp(1, 0.95, on)} />
      <rect x={30} y={30} width={320} height={248} rx={16} fill="#0A1226" opacity={1 - on} />
      {/* plate + bowl */}
      <g transform={`translate(${190 + plateX} 236) scale(${plateScale} 1)`}>
        <ellipse cx={0} cy={14} rx={110} ry={16} fill="rgba(245,241,232,.35)" />
        <path d="M-62 -30 Q-58 18 0 18 Q58 18 62 -30 Z" fill="#E9E2D0" />
        <ellipse cx={0} cy={-30} rx={62} ry={11} fill={on > 0.5 ? "#F59E0B" : "#C2410C"} />
      </g>
      <rect x={30} y={30} width={320} height={248} rx={16} fill="url(#mesh)" opacity={0.55} />
      <rect x={30} y={30} width={320} height={248} rx={16} fill="none" stroke={meshGlow ? C.green : "rgba(245,241,232,.25)"} strokeWidth={meshGlow ? 6 : 3} opacity={meshGlow ? lerp(0.4, 1, meshGlow) : 1} />
      {/* door handle */}
      <rect x={360} y={40} width={10} height={228} rx={5} fill="rgba(245,241,232,.4)" />
      {/* control panel */}
      <rect x={390} y={34} width={104} height={50} rx={10} fill="#050A18" />
      <text x={442} y={70} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill={on > 0.5 ? C.green : "rgba(74,222,128,.55)"}>{disp}</text>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={394 + c * 34} y={104 + r * 34} width={26} height={24} rx={6} fill="rgba(245,241,232,.18)" />))}
      <rect x={394} y={214} width={96} height={52} rx={12} fill={press > 0.01 ? C.green : "rgba(74,222,128,.25)"} style={{ filter: press ? `drop-shadow(0 0 ${20 * press}px ${C.green})` : undefined }} />
      <text x={442} y={248} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={22} fill={press > 0.01 ? C.navy : C.green}>START</text>
    </svg>
  );
};

/** Wi-Fi router (design box 240x190) */
const Router: React.FC<{ x: number; y: number; w?: number; k?: number; weak?: number }> = ({ x, y, w = 240, k = 1, weak = 0 }) => {
  const t = useT();
  const s = w / 240;
  const blink = (i: number) => (Math.sin(t * (9 + i * 3) + i) > 0 ? 1 : 0.3);
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, Math.min(1, k))}` }} width={w} height={190 * s} viewBox="0 0 240 190">
      <rect x={46} y={20} width={14} height={100} rx={7} fill="rgba(245,241,232,.75)" transform="rotate(-12 53 120)" />
      <rect x={180} y={20} width={14} height={100} rx={7} fill="rgba(245,241,232,.75)" transform="rotate(12 187 120)" />
      <rect x={14} y={108} width={212} height={66} rx={20} fill="#1C2A4D" stroke={weak > 0.5 ? C.orange : C.green} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={58 + i * 40} cy={141} r={9} fill={weak > 0.5 && i > 0 ? C.orange : C.green} opacity={blink(i)} />)}
    </svg>
  );
};

/** expanding rings from a point */
const Rings: React.FC<{ cx: number; cy: number; color: string; k: number; maxR?: number; speed?: number; n?: number; w?: number; clip?: string; arc?: [number, number] }> = ({ cx, cy, color, k, maxR = 420, speed = 0.7, n = 4, w = 6, clip, arc }) => {
  const t = useT();
  if (k <= 0) return null;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1080} height={1920}>
      <g clipPath={clip}>
        {[...Array(Math.round(n))].map((_, i) => {
          const f = ((t * speed + i / Math.round(n)) % 1 + 1) % 1;
          const r = 30 + f * maxR;
          const op = (1 - f) * k;
          if (arc) {
            const [a0, a1] = arc.map((d) => (d * Math.PI) / 180);
            const p = (a: number) => `${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
            return <path key={i} d={`M${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={op} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
          }
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={w} opacity={op * 0.8} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
        })}
      </g>
    </svg>
  );
};

/** orange radio static in a box */
const Static: React.FC<{ x: number; y: number; w: number; h: number; k: number; n?: number; seed?: number }> = ({ x, y, w, h, k, n = 70, seed = 1 }) => {
  const t = useT();
  if (k <= 0) return null;
  const fr = Math.floor(t * 15);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", opacity: k, pointerEvents: "none" }}>
      {[...Array(Math.round(n))].map((_, i) => {
        const r1 = rnd(i * 7 + fr * 131 + seed), r2 = rnd(i * 13 + fr * 71 + seed), r3 = rnd(i * 3 + fr * 17 + seed);
        return <div key={i} style={{ position: "absolute", left: r1 * w, top: r2 * h, width: 14 + r3 * 60, height: 5 + r3 * 6, borderRadius: 3, background: i % 3 ? C.orange : HOT, opacity: 0.35 + r3 * 0.5 }} />;
      })}
    </div>
  );
};

const Bars: React.FC<{ level: number; color: string; size?: number }> = ({ level, color, size = 46 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.12, height: size }}>
    {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: size * 0.18, height: size * (0.3 + i * 0.23), borderRadius: 4, background: i < level ? color : "rgba(245,241,232,.18)" }} />)}
  </div>
);

/** Video call window. frozen 0..1 */
const Call: React.FC<{ x: number; y: number; w: number; h: number; frozen: number; shakeAt?: number; x2?: number }> = ({ x, y, w, h, frozen, shakeAt = -9, x2 = 0 }) => {
  const t = useT();
  const live = frozen < 0.5;
  const talk = live ? Math.abs(Math.sin(t * 11)) * 14 : 4;
  const bob = live ? Math.sin(t * 3) * 6 : 0;
  const sx = shake(t, shakeAt, 18, 0.5);
  const level = Math.round(lerp(4, 1, frozen));
  const avH = h - 64;
  const cx = w / 2;
  return (
    <div style={{ position: "absolute", left: x + sx, top: y, width: w, height: h, borderRadius: 30, background: "rgba(13,22,48,.97)", border: `3px solid ${frozen > 0.5 ? C.orange : "rgba(245,241,232,.2)"}`, boxShadow: frozen > 0.5 ? `0 0 40px rgba(251,146,60,.35)` : "0 20px 60px rgba(0,0,0,.5)", overflow: "hidden" }}>
      <div style={{ height: 64, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: live ? "#EF4444" : C.dim }} />
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim, flex: 1 }}>video call</div>
        <Bars level={level} color={frozen > 0.5 ? C.orange : C.green} size={40} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 64, bottom: 0, background: "linear-gradient(#22345E,#16244A)", filter: frozen > 0.5 ? "saturate(.3) brightness(.7)" : undefined }}>
        {/* generic avatar */}
        <svg style={{ position: "absolute", left: cx - 140, top: avH * 0.12 + bob }} width={280} height={avH} viewBox={`0 0 280 ${avH}`}>
          <circle cx={140} cy={92} r={70} fill="#E7C9A5" />
          <path d={`M140 ${92 - 72} a72 60 0 0 1 72 56 l-144 0 a72 60 0 0 1 72 -56`} fill="#3B2A20" />
          <circle cx={116} cy={96} r={7} fill="#1A1A1A" /><circle cx={164} cy={96} r={7} fill="#1A1A1A" />
          <ellipse cx={140} cy={128} rx={18} ry={talk / 2 + 2} fill="#7A2E2E" />
          <path d={`M20 ${avH} Q20 190 140 186 Q260 190 260 ${avH} Z`} fill={C.green} opacity={0.75} />
        </svg>
        {/* frozen pixel blocks */}
        {frozen > 0.5 && [...Array(24)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i % 6) * (w / 6), top: Math.floor(i / 6) * (avH / 4), width: w / 6, height: avH / 4, background: `rgba(${rnd(i) > 0.5 ? "231,201,165" : "34,52,94"},${0.25 + rnd(i * 3) * 0.3})` }} />
        ))}
      </div>
      {frozen > 0.5 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 64 + avH / 2 - 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, border: `7px solid rgba(251,146,60,.3)`, borderTopColor: C.orange, rotate: `${t * 400}deg` }} />
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.orange, background: "rgba(10,18,38,.85)", padding: "6px 18px", borderRadius: 14 }}>Reconnecting…</div>
        </div>
      )}
      {x2 > 0 && (
        <div style={{ position: "absolute", right: 24, top: 84, width: 76, height: 76, borderRadius: 38, background: C.orange, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", scale: `${lerp(0.3, 1, x2)}`, opacity: Math.min(1, x2 * 1.5), boxShadow: `0 0 30px ${C.orange}` }}>✕</div>
      )}
    </div>
  );
};

const Tag: React.FC<{ k: number; text: React.ReactNode; color?: string; size?: number; x?: number; y: number; w?: number }> = ({ k, text, color = C.green, size = 54, x = 0, y, w = 1080 }) => (
  k <= 0.001 ? null :
  <div style={{ position: "absolute", top: y, left: x, width: w, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.5) }}>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.16}px ${size * 0.42}px`, borderRadius: size * 0.34, border: `4px solid ${color}`, background: "rgba(10,18,38,.9)", boxShadow: `0 0 40px ${color}55`, scale: `${lerp(0.4, 1, k)}`, whiteSpace: "nowrap", letterSpacing: 1 }}>{text}</div>
  </div>
);

// ---------- spectrum ----------
/** split 0: only the 2.4 GHz band, full width; 1: both bands. wifiPos 0: channels in 2.4, 1: in 5 GHz */
const Spectrum: React.FC<{ x: number; y: number; w: number; h: number; k: number; mw: number; wifi: number; wifiPos?: number; split?: number; same?: number; mwPulse?: number }> = ({ x, y, w, h, k, mw, wifi, wifiPos = 0, split = 0, same = 0, mwPulse = 0 }) => {
  const t = useT();
  const L = 40, R = w - 40, base = h - 70;
  const aR = lerp(R, w * 0.47, split);
  const bL = w * 0.55;
  const fa = (f: number) => lerp(L, aR, (f - 2.4) / 0.1);
  const fb = (f: number) => lerp(bL, R, (f - 5.15) / 0.7);
  const hA = (f: number) => (fa(2.41) - fa(2.4)); // px per 10 MHz in band A
  // oven hump (gaussian, centered 2.45 GHz)
  const mh = (base - 110) * mw * (1 + mwPulse * 0.08 * Math.sin(t * 14));
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const f = 2.4 + (i / 60) * 0.1;
    const g = Math.exp(-Math.pow((f - 2.45) / 0.018, 2) / 2);
    pts.push(`${fa(f)} ${base - g * mh}`);
  }
  const mwPath = `M${fa(2.4)} ${base} L${pts.join(" L")} L${fa(2.5)} ${base} Z`;
  // Wi-Fi channels: 2.4 GHz ch 1/6/11 (20 MHz) -> 5 GHz (80 MHz)
  const chA = [2.412, 2.437, 2.462], chB = [5.21, 5.53, 5.775];
  const wh = (base - 80) * 0.62 * wifi;
  const chans = chA.map((fA, i) => {
    const cx = lerp(fa(fA), fb(chB[i]), wifiPos);
    const hw = lerp(hA(0) * 1, (fb(5.25) - fb(5.21)), wifiPos);
    const hop = Math.sin(wifiPos * Math.PI) * 120;
    const by = base - hop;
    return `M${cx - hw} ${by} L${cx - hw * 0.72} ${by - wh} L${cx + hw * 0.72} ${by - wh} L${cx + hw} ${by} Z`;
  });
  const flash = same * (0.6 + 0.4 * Math.sin(t * 12));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30, background: "rgba(13,22,48,.96)", border: `3px solid rgba(245,241,232,.18)`, overflow: "hidden", opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - Math.min(1, k)) * 80}px` }}>
      <div style={{ position: "absolute", left: 30, top: 16, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim }}>radio spectrum</div>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={w} height={h}>
        {/* overlap flash */}
        {same > 0 && <rect x={fa(2.4)} y={60} width={fa(2.5) - fa(2.4)} height={base - 60} fill={`rgba(251,146,60,${0.18 * flash})`} stroke={`rgba(251,146,60,${0.8 * flash})`} strokeWidth={3} strokeDasharray="12 10" rx={10} />}
        <path d={mwPath} fill="rgba(251,146,60,.35)" stroke={C.orange} strokeWidth={5} style={{ filter: `drop-shadow(0 0 12px ${C.orange})` }} opacity={mw > 0 ? 1 : 0} />
        {wifi > 0 && chans.map((d, i) => <path key={i} d={d} fill="rgba(74,222,128,.28)" stroke={C.green} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${C.green})` }} />)}
        {/* axes */}
        <line x1={L} y1={base} x2={aR} y2={base} stroke="rgba(245,241,232,.6)" strokeWidth={4} />
        {split > 0 && <line x1={bL} y1={base} x2={R} y2={base} stroke="rgba(245,241,232,.6)" strokeWidth={4} opacity={split} />}
        {split > 0 && <text x={(aR + bL) / 2} y={base + 10} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={40} fill={C.dim} opacity={split}>//</text>}
      </svg>
      {/* axis labels */}
      <div style={{ position: "absolute", left: fa(2.4) - 60, width: (fa(2.5) - fa(2.4)) + 120, top: base + 12, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white }}>2.4 GHz</div>
      {split < 0.5 && ["2.40", "2.50"].map((s, i) => <div key={s} style={{ position: "absolute", left: (i ? fa(2.5) - 80 : fa(2.4)), width: 80, textAlign: i ? "right" : "left", top: base + 14, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim, opacity: 1 - split * 2 }}>{s}</div>)}
      {split > 0 && <div style={{ position: "absolute", left: bL, width: R - bL, top: base + 12, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green, opacity: split }}>5 GHz</div>}
      {/* legends */}
      <div style={{ position: "absolute", left: fa(2.45) - 120, width: 240, top: Math.max(56, base - mh - 52), textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.orange, opacity: Math.min(1, mw * 2) }}>oven</div>
    </div>
  );
};

// ---------- scene 1: kitchen (hook + demo) ----------
const MW = { x: 50, y: 560, w: 560 };
const MWC = { x: MW.x + 205, y: MW.y + 170 };
const RT = { x: 780, y: 600 };
const RTC = { x: RT.x + 120, y: RT.y + 120 };
const CALL = { x: 150, y: 960, w: 780, h: 380 };

const Kitchen: React.FC = () => {
  const t = useT();
  const b = LS(2);
  const offA = WE(0, 5) + 0.15, onAt = W(1, 0) + 0.12;
  const off = t >= offA && t < onAt;
  const on = off ? 0 : t < offA ? 1 : ramp(t, onAt, 0.25);
  const press = t >= onAt - 0.05 && t < onAt + 0.6 ? 1 - ramp(t, onAt + 0.2, 0.4) : 0;
  const freezeAt = W(1, 6);
  const frozen = t < offA ? 1 : t < freezeAt ? 0 : 1;
  const jam = t < offA ? 1 : ramp(t, freezeAt - 0.1, 0.25);
  const xk = pop(t, W(0, 3), 9) * (1 - ramp(t, offA - 0.1, 0.2)) + pop(t, freezeAt, 9);
  const ovenRings = t < offA ? 1 : ramp(t, W(1, 4), 0.4);
  const words = pop(t, 0, 12);
  return (
    <Scene a={0} b={b} enter={false}>
      <div style={{ position: "absolute", top: 172, left: 0, right: 0, textAlign: "center", scale: `${lerp(1, 1, words)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 82, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>Your microwave</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 132, lineHeight: 1.12, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 3), 10, 0.4)}px 0px` }}>JAMS WI-FI</div>
      </div>
      <Rings cx={RTC.x} cy={RTC.y} color={C.green} k={1 - jam * 0.6} maxR={300} speed={0.8} n={3} />
      <Rings cx={MWC.x} cy={MWC.y} color={C.orange} k={on * ovenRings} maxR={620} speed={0.9} n={5} w={8} />
      <Microwave x={MW.x} y={MW.y} w={MW.w} on={on} press={press} timer={92} />
      <Router x={RT.x} y={RT.y} weak={jam} />
      <Call x={CALL.x} y={CALL.y} w={CALL.w} h={CALL.h} frozen={frozen} shakeAt={t < offA ? W(0, 3) : freezeAt} x2={xk} />
      <Static x={CALL.x} y={CALL.y + 64} w={CALL.w} h={CALL.h - 64} k={jam * 0.55} />
      <Tag k={press > 0 ? pop(t, onAt, 11) * (1 - ramp(t, W(1, 4), 0.2)) : 0} text="START" y={880} size={44} x={MW.x} w={MW.w} />
    </Scene>
  );
};

// ---------- scene 2: inside the oven + spectrum ----------
const Inside: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(6);
  const heat = ramp(t, W(2, 3), 0.8, INOUT);
  const waveK = ramp(t, W(3, 4), 0.3);
  const powerK = pop(t, W(3, 3), 10);
  const specK = ramp(t, W(4, 2) - 0.1, 0.4);
  const mw = ramp(t, W(4, 2), 0.7, INOUT);
  const wifi = ramp(t, W(5, 2), 0.5);
  const routerK = pop(t, W(5, 2) - 0.05, 11);
  const same = ramp(t, W(5, 5), 0.25);
  const ox = 60, oy = 470, ow = 960, oh = 440;
  const src = { x: ox + ow - 150, y: oy + 150 };
  const bowl = { x: ox + 380, y: oy + 320 };
  // wave train from source to bowl
  const wavePath = () => {
    const pts: string[] = [];
    const x0 = src.x - 105, x1 = bowl.x + 110;
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const xx = lerp(x0, x1, u);
      const yy = lerp(src.y + 10, bowl.y - 80, u) + Math.sin(u * 22 + t * 14) * 26;
      pts.push(`${xx} ${yy}`);
    }
    return "M" + pts.join(" L");
  };
  const steam = heat;
  return (
    <Scene a={a} b={b}>
      {/* oven cut-away */}
      <div style={{ position: "absolute", left: ox, top: oy, width: ow, height: oh, borderRadius: 34, background: "linear-gradient(#24365F,#182748)", border: `6px solid rgba(245,241,232,.35)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 20, top: 16, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim }}>inside the oven</div>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 40% 70%, rgba(251,191,36,${0.35 * heat}), transparent 60%)` }} />
        {/* radio source */}
        <div style={{ position: "absolute", left: ow - 250, top: 90, width: 200, height: 130, borderRadius: 18, background: "#0A1226", border: `4px solid ${C.orange}`, boxShadow: waveK ? `0 0 ${30 + Math.sin(t * 20) * 10}px ${C.orange}` : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.orange, textAlign: "center", lineHeight: 1.2 }}>radio<br />source</div>
        {/* plate */}
        <div style={{ position: "absolute", left: 160, top: oh - 70, width: 440, height: 40, borderRadius: "50%", background: "rgba(245,241,232,.3)" }} />
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
        {waveK > 0 && <path d={wavePath()} fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" opacity={waveK} strokeDasharray={1400} strokeDashoffset={1400 * (1 - waveK)} style={{ filter: `drop-shadow(0 0 12px ${C.orange})` }} />}
        {/* bowl */}
        <g transform={`translate(${bowl.x} ${bowl.y})`}>
          {[0, 1, 2].map((i) => {
            const f = ((t * 0.8 + i / 3) % 1);
            return <path key={i} d={`M${-50 + i * 50} -40 q-18 -30 0 -60 q18 -30 0 -60`} fill="none" stroke="rgba(245,241,232,.8)" strokeWidth={7} strokeLinecap="round" opacity={steam * (1 - f)} transform={`translate(0 ${-f * 50})`} />;
          })}
          <path d="M-130 -40 Q-122 70 0 70 Q122 70 130 -40 Z" fill="#E9E2D0" />
          <ellipse cx={0} cy={-40} rx={130} ry={24} fill={heat > 0.5 ? "#F59E0B" : "#9A3412"} style={{ filter: heat > 0.5 ? `drop-shadow(0 0 ${20 * heat}px ${HOT})` : undefined }} />
          <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={34} fill={C.navy}>soup</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: ox + 610, top: oy + 250 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.orange, padding: "6px 22px", borderRadius: 18, border: `4px solid ${C.orange}`, background: "rgba(10,18,38,.9)", opacity: Math.min(1, powerK * 1.5), scale: `${lerp(0.4, 1, powerK)}`, boxShadow: `0 0 40px rgba(251,146,60,.5)` }}>≈1,000 W</div>
        <div style={{ textAlign: "center", marginTop: 4, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.dim, opacity: powerK }}>typical oven</div>
      </div>
      <Spectrum x={60} y={950} w={960} h={380} k={specK} mw={mw} wifi={wifi} same={same} />
      <div style={{ position: "absolute", left: 820, top: 1000, opacity: Math.min(1, routerK * 1.5) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green, padding: "4px 16px", borderRadius: 12, border: `3px solid ${C.green}`, background: "rgba(10,18,38,.9)", scale: `${lerp(0.4, 1, routerK)}` }}>Wi-Fi</div>
      </div>
      <Tag k={pop(t, W(5, 5), 10)} text="same band" color={C.orange} y={915} size={44} />
    </Scene>
  );
};

// ---------- scene 3: the box, the mesh, the leak ----------
const Leak: React.FC = () => {
  const t = useT();
  const a = LS(6), b = LS(11);
  const pan = ramp(t, LS(9) - 0.1, 0.7, INOUT);
  const mwW = lerp(760, 560, pan), mwX = lerp(160, 40, pan), mwY = lerp(500, 600, pan);
  const sc = mwW / 520;
  const box = ramp(t, W(6, 1), 0.3) * (1 - ramp(t, W(6, 5), 0.3) * 0.6);
  const meshG = ramp(t, W(6, 5), 0.3);
  const mag = pop(t, W(6, 5) + 0.05, 12) * (1 - ramp(t, W(8, 1) - 0.2, 0.3));
  const bounce = ramp(t, W(7, 0), 0.4);
  const contained = pop(t, W(7, 1), 11) * (1 - ramp(t, W(8, 0) - 0.2, 0.25));
  const leakAt = W(8, 1);
  const leak1 = ramp(t, leakAt, 0.3);
  const leakBig = ramp(t, W(9, 1), 0.6);
  const routerK = ramp(t, LS(9) + 0.2, 0.5);
  const powerK = pop(t, W(9, 5), 11);
  const drown = ramp(t, W(10, 1), 0.4);
  const frozen = t >= W(10, 4) ? 1 : 0;
  const callK = ramp(t, W(10, 3), 0.4);
  // positions
  const seam = { x: mwX + 352 * sc, y: mwY + 70 * sc };
  const rt = { x: 800, y: 640 };
  const rtc = { x: rt.x + 110, y: rt.y + 110 };
  const clipId = "ovenClip";
  return (
    <Scene a={a} b={b}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs><clipPath id={clipId}><rect x={mwX + 30 * sc} y={mwY + 30 * sc} width={320 * sc} height={248 * sc} rx={16} /></clipPath></defs>
      </svg>
      <Microwave x={mwX} y={mwY} w={mwW} on={1} outline={box} meshGlow={meshG} timer={LS(6) + 75} />
      {/* rings bouncing inside the box */}
      <Rings cx={mwX + 190 * sc} cy={mwY + 150 * sc} color={HOT} k={0.9} maxR={260 * sc} speed={1.1} n={4} w={6} clip={`url(#${clipId})`} />
      <Tag k={box * (1 - meshG)} text="metal box" y={mwY - 110} size={48} x={mwX} w={mwW} />
      {/* magnifier on the mesh */}
      {mag > 0.01 && (
        <div style={{ position: "absolute", left: lerp(560, 640, pan), top: 1010, width: 380, height: 300, opacity: Math.min(1, mag * 1.5), scale: `${lerp(0.4, 1, mag)}`, transformOrigin: "30% 0%" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 30, background: "#0A1226", border: `5px solid ${C.green}`, boxShadow: `0 0 40px rgba(74,222,128,.4)`, overflow: "hidden" }}>
            {[...Array(7)].map((_, r) => [...Array(9)].map((_, c) => <div key={`${r}${c}`} style={{ position: "absolute", left: 20 + c * 40, top: 20 + r * 40, width: 18, height: 18, borderRadius: 9, background: "rgba(245,241,232,.75)" }} />))}
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={380} height={300}>
              {(() => {
                const u = ((t - W(6, 5)) * 0.9) % 2; // wave comes in, bounces back
                const xEnd = u < 1 ? lerp(-40, 300, u) : lerp(300, -40, u - 1);
                const pts: string[] = [];
                for (let i = 0; i <= 40; i++) { const xx = lerp(-200, xEnd, i / 40); pts.push(`${xx} ${150 + Math.sin(xx / 45) * 60}`); }
                return <path d={"M" + pts.join(" L")} fill="none" stroke={C.orange} strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.orange})` }} />;
              })()}
            </svg>
          </div>
          <div style={{ position: "absolute", left: -120, right: -20, top: 308, textAlign: "center", whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.white }}>
            <span style={{ color: C.green }}>holes: few mm</span> · <span style={{ color: C.orange }}>wave: 12 cm</span>
          </div>
        </div>
      )}
      {/* bounce arrows */}
      {bounce > 0 && mag > 0.01 && <Tag k={contained} text="✓ almost all stays in" y={mwY - 110} size={46} x={0} w={1080} />}
      {/* the leak */}
      {leak1 > 0 && (
        <>
          <Rings cx={seam.x} cy={seam.y} color={C.orange} k={leak1 * lerp(0.9, 1, leakBig)} maxR={lerp(90, 420, leakBig)} speed={1} n={lerp(2, 5, leakBig)} w={lerp(5, 8, leakBig)} arc={[-70, 70]} />
          <div style={{ position: "absolute", left: seam.x - 22, top: seam.y - 22, width: 44, height: 44, borderRadius: 22, background: C.orange, opacity: 0.6 + Math.sin(t * 12) * 0.3, boxShadow: `0 0 40px ${C.orange}`, scale: `${lerp(0.3, 1, pop(t, leakAt, 9))}` }} />
          <Tag k={pop(t, W(8, 3), 11) * (1 - ramp(t, W(9, 1) - 0.2, 0.25))} text="tiny leak" color={C.orange} y={mwY - 110} size={48} />
        </>
      )}
      {/* router + powers */}
      <Rings cx={rtc.x} cy={rtc.y} color={C.green} k={routerK * (1 - drown * 0.75)} maxR={220} speed={0.8} n={3} />
      <Router x={rt.x} y={rt.y} w={220} k={routerK} weak={drown} />
      <Static x={rt.x - 80} y={rt.y - 120} w={360} h={420} k={drown * 0.75} n={60} seed={7} />
      <div style={{ position: "absolute", left: mwX, width: mwW, top: mwY + mwW * 0.66, display: "flex", justifyContent: "center", opacity: Math.min(1, powerK * 1.5) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.orange, padding: "4px 20px", borderRadius: 16, border: `4px solid ${C.orange}`, background: "rgba(10,18,38,.9)", scale: `${lerp(0.4, 1, powerK) * (1 + 0.05 * Math.sin(t * 10))}` }}>≈1,000 W</div>
      </div>
      <div style={{ position: "absolute", left: rt.x - 40, width: 300, top: rt.y + 210, display: "flex", justifyContent: "center", opacity: Math.min(1, pop(t, W(9, 6), 11) * 1.5) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.green, padding: "4px 20px", borderRadius: 16, border: `4px solid ${C.green}`, background: "rgba(10,18,38,.9)" }}>≈0.1 W</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim, opacity: powerK * (1 - callK) }}>typical power</div>
      {callK > 0 && <Call x={240} y={lerp(1400, 1080, callK)} w={600} h={250} frozen={frozen} shakeAt={W(10, 4)} x2={frozen ? pop(t, W(10, 4), 9) : 0} />}
      {callK > 0 && <Static x={240} y={lerp(1400, 1080, callK) + 64} w={600} h={186} k={frozen * 0.5} n={40} seed={3} />}
    </Scene>
  );
};

// ---------- scene 4: switch to 5 GHz ----------
const Switch: React.FC = () => {
  const t = useT();
  const a = LS(11);
  const z = lerp(1, 1.05, ramp(t, W(12, 0), T.END - W(12, 0), INOUT));
  const tog = pop(t, W(11, 0), 11);
  const flip = ramp(t, W(11, 2), 0.3, INOUT);
  const split = ramp(t, W(11, 2) - 0.1, 0.5, INOUT);
  const move = ramp(t, W(11, 4) - 0.3, 0.8, INOUT);
  const pulse = ramp(t, W(12, 2), 0.2) * (1 - ramp(t, W(12, 3), 0.4));
  const fixedAt = W(12, 3) + 0.1;
  const frozen = t < fixedAt ? 1 : 0;
  const ok = pop(t, fixedAt, 10);
  const take = pop(t, WE(12, 5) + 0.15, 11);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", opacity: Math.min(1, take * 1.5), scale: `${lerp(0.6, 1, take)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.white, lineHeight: 1.1 }}>Oven on.</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 112, color: C.green, lineHeight: 1.15, textShadow: "0 0 40px rgba(74,222,128,.5)" }}>5 GHz: clear</div>
      </div>
      {/* band toggle */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", opacity: Math.min(1, tog * 1.5) * (1 - ramp(t, WE(12, 5), 0.2)), scale: `${lerp(0.5, 1, tog)}` }}>
        <div style={{ position: "relative", width: 620, height: 120, borderRadius: 60, background: "#0A1226", border: `4px solid rgba(245,241,232,.3)` }}>
          <div style={{ position: "absolute", top: 8, left: lerp(8, 312, flip), width: 296, height: 96, borderRadius: 48, background: flip > 0.5 ? C.green : C.orange, boxShadow: `0 0 40px ${flip > 0.5 ? C.green : C.orange}` }} />
          <div style={{ position: "absolute", left: 0, width: 310, top: 0, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 52, color: flip < 0.5 ? C.navy : C.dim }}>2.4 GHz</div>
          <div style={{ position: "absolute", right: 0, width: 310, top: 0, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 52, color: flip >= 0.5 ? C.navy : C.dim }}>5 GHz</div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, scale: `${z}`, transformOrigin: "540px 900px" }}>
        <Spectrum x={60} y={440} w={960} h={420} k={1} mw={1} wifi={1} wifiPos={move} split={split} mwPulse={pulse} same={(1 - move) * 0.7} />
        <Call x={150} y={900} w={780} h={420} frozen={frozen} />
        <Static x={150} y={964} w={780} h={356} k={frozen * 0.5} />
        {ok > 0 && (
          <div style={{ position: "absolute", left: 830, top: 980, width: 76, height: 76, borderRadius: 38, background: C.green, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center", scale: `${lerp(0.3, 1, ok)}`, boxShadow: `0 0 30px ${C.green}` }}>✓</div>
        )}
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
type Cue = [number, string, number];
const SFX: Cue[] = [
  [0, "pop", 0.6], [0.02, "zap", 0.35], [0.3, "tick", 0.4], [W(0, 1), "click", 0.4], [W(0, 3), "error", 0.5], [W(0, 3) + 0.03, "impact", 0.5],
  [WE(0, 5) + 0.1, "rewind", 0.4], [W(1, 0) + 0.12, "click", 0.7], [W(1, 0) + 0.2, "enter", 0.4], [W(1, 4), "zap", 0.35], [W(1, 6), "error", 0.55], [W(1, 6) + 0.03, "stamp", 0.45],
  [LS(2) - 0.15, "whoosh", 0.5], [W(2, 1), "tick", 0.4], [W(2, 3), "riser", 0.35], [W(2, 4), "chime", 0.4],
  [W(3, 3), "pop", 0.6], [W(3, 3) + 0.05, "impact", 0.4], [W(3, 4), "zap", 0.45], [W(3, 5), "tick", 0.4],
  [W(4, 2) - 0.1, "whoosh", 0.4], [W(4, 2), "riser", 0.35], [W(4, 3), "pop", 0.5], [W(4, 4), "tick", 0.4],
  [W(5, 2), "pop", 0.55], [W(5, 2) + 0.1, "pop", 0.45], [W(5, 2) + 0.2, "pop", 0.45], [W(5, 5), "error", 0.4], [W(5, 6), "stamp", 0.4],
  [LS(6) - 0.15, "whoosh", 0.5], [W(6, 1), "chime", 0.45], [W(6, 2), "stamp", 0.4], [W(6, 5), "pop", 0.55], [W(6, 8), "tick", 0.4],
  [W(7, 1), "chime", 0.5], [W(7, 5), "tick", 0.4],
  [W(8, 1), "zap", 0.5], [W(8, 1) + 0.05, "error", 0.35], [W(8, 3), "pop", 0.5],
  [LS(9) - 0.05, "whoosh", 0.4], [W(9, 1), "zap", 0.4], [W(9, 2), "riser", 0.35], [W(9, 5), "pop", 0.55], [W(9, 6), "pop", 0.5],
  [W(10, 1), "impact", 0.55], [W(10, 1) + 0.05, "zap", 0.4], [W(10, 3), "whoosh", 0.35], [W(10, 4), "error", 0.5],
  [LS(11) - 0.15, "whoosh", 0.5], [W(11, 0), "pop", 0.55], [W(11, 2), "click", 0.7], [W(11, 2) + 0.05, "enter", 0.35], [W(11, 4) - 0.3, "riser", 0.35], [W(11, 4) + 0.4, "stamp", 0.45],
  [W(12, 2), "zap", 0.3], [W(12, 3) + 0.1, "chime", 0.6], [W(12, 3) + 0.12, "impact", 0.35], [WE(12, 5) + 0.15, "pop", 0.5], [WE(12, 5) + 0.2, "chime", 0.45],
];

export const MicrowaveWifi: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Kitchen />
    <Inside />
    <Leak />
    <Switch />
    <Captions lines={T.LINES} skip={[0]} />
    <Bug />
    <Audio src={A("narration.wav")} />
    <Audio src={A("music.wav")} volume={(f) => interpolate(f, [0, 10, T.TOTAL_FRAMES - 25, T.TOTAL_FRAMES], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SFX.map(([s, name, vol], i) => (
      <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={Math.round(1.6 * FPS)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * 0.55} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
