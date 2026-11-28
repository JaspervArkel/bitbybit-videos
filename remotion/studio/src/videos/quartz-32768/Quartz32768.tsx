/*
 * STORYBOARD — "Your watch counts to 32,768 every second". One world: a watch and the quartz inside it.
 * Real values: 32,768 = 2^15; a 15-stage divide-by-2 chain gives 16,384, 8,192, 4,096, 2,048, 1,024, 512, 256,
 * 128, 64, 32, 16, 8, 4, 2, 1; human hearing tops out around 20 kHz (labelled "~20 kHz"). The hook counter runs
 * at true speed: it counts 32,768 per second of video and the second hand ticks each time it wraps.
 *  L0  "32,768 vibrations make one second on your watch."  Frame 0: headline "Your watch counts to / 32,768 /
 *        every second" + watch face with a ring filling + green counter racing (wraps & ticks at 0.25 s, 1.25 s…).
 *        Second hand flashes on "one second"; watch pulses on "watch".
 *  L1  "Inside is a tiny sliver of quartz."     New scene: cut-away can; tuning-fork crystal slides in on "Inside";
 *        glows + "quartz crystal" tag on "quartz".
 *  L2  "Put voltage on it, and it vibrates"      Battery left; wire draws to the fork on "voltage" (+ spark);
 *        tines start to buzz on "vibrates" (motion ghosts).
 *  L3  "32,768 times a second."                 Scope panel rises with a fast sine; "32,768 per second" chip on
 *        "32,768"; counter races; tick flash on "second".
 *  L4  "That number is two to the fifteenth."   New scene: header "32,768"; on "two" 15 tiles labelled "2" pop
 *        (3×5 grid) and the header becomes "2¹⁵ = 32,768" on "fifteenth".
 *  L5  "A chip halves the signal fifteen times in a row:"  Chip outline draws around the grid on "chip"; tiles flip
 *        to "÷2" on "halves"; "×15" badge on "fifteen".
 *  L6  "16,384, 8,192, all the way down to one." Input pill "32,768" feeds tile 1 = 16,384 (spoken), tile 2 = 8,192,
 *        tiles 3–14 cascade on "all the way down", tile 15 = 1 flashes on "one".
 *  L7  "One tick, one second."                  Output arrow → "1 per second" → small watch ticks on "tick" and "second".
 *  L8  "It's this fast because a slower crystal" New scene: watch outline with our small fork buzzing fast (left)
 *        and a "slower" fork (right) in the same outline on "slower".
 *  L9  "would have to be bigger,"               Slower fork's tines stretch out of its outline in orange on "bigger".
 *  L10 "and 32,768 sits just above"             New scene: frequency axis 0–40 kHz with the hearing band (green,
 *        "your ears", up to ~20 kHz); a "32,768" pin flies in on "32,768", lands just past the band on "above".
 *  L11 "what your ears can hear."               Band pulses on "ears"; implication ending: takeaway
 *        "2¹⁵ vibrations / = 1 SECOND". Slow push-in.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, WE, LS } = T;
export const QUARTZ_32768_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/quartz-32768/${p}`);
const fmt = (n: number) => n.toLocaleString("en-US");

// hook counter phase: wraps at 0.25 s, 1.25 s, 2.25 s … (true 32,768 per second)
const PH = 0.75;
const wrapsUntil = (t: number) => Math.floor(t + PH);

// spoken split inside the "16,384, 8,192," token (energy dip measured at ~20.3 s)
const N1 = W(6, 0);
const N2 = Math.min(W(6, 1) - 0.3, Math.max(N1 + 1.5, 20.35));

// ---------- pieces ----------
/** Analog watch face (design box 400x400). ticks: number of second-hand steps */
const Watch: React.FC<{ x: number; y: number; size: number; ticks: number; tickAt?: number; ring?: number; glow?: number; flash?: number }> = ({ x, y, size, ticks, tickAt = -9, ring = -1, glow = 0, flash = 0 }) => {
  const t = useT();
  const settle = t >= tickAt && t < tickAt + 0.25 ? Math.sin(((t - tickAt) / 0.25) * Math.PI) * 2.5 : 0;
  const sec = ticks * 6 + settle;
  const R = 168;
  const circ = 2 * Math.PI * (R + 18);
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", filter: glow ? `drop-shadow(0 0 ${36 * glow}px ${C.green})` : "drop-shadow(0 20px 40px rgba(0,0,0,.55))" }} width={size} height={size} viewBox="0 0 400 400">
      {/* lugs */}
      <rect x={150} y={-30} width={100} height={60} rx={14} fill="#1C2A4D" />
      <rect x={150} y={370} width={100} height={60} rx={14} fill="#1C2A4D" />
      <rect x={385} y={180} width={28} height={40} rx={8} fill="#2A3B63" />
      <circle cx={200} cy={200} r={196} fill="#1C2A4D" stroke="rgba(245,241,232,.4)" strokeWidth={6} />
      <circle cx={200} cy={200} r={R} fill="#0A1226" />
      {ring >= 0 && (
        <circle cx={200} cy={200} r={R + 18} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform="rotate(-90 200 200)" style={{ filter: `drop-shadow(0 0 10px ${C.green})` }} />
      )}
      {[...Array(60)].map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const big = i % 5 === 0;
        const r0 = big ? R - 26 : R - 12;
        return <line key={i} x1={200 + Math.sin(a) * r0} y1={200 - Math.cos(a) * r0} x2={200 + Math.sin(a) * (R - 4)} y2={200 - Math.cos(a) * (R - 4)} stroke={big ? C.white : "rgba(245,241,232,.35)"} strokeWidth={big ? 7 : 3} strokeLinecap="round" />;
      })}
      {/* hour + minute */}
      <line x1={200} y1={200} x2={200 + Math.sin(-0.9) * 88} y2={200 - Math.cos(-0.9) * 88} stroke={C.white} strokeWidth={14} strokeLinecap="round" />
      <line x1={200} y1={200} x2={200 + Math.sin(1.4) * 130} y2={200 - Math.cos(1.4) * 130} stroke={C.white} strokeWidth={10} strokeLinecap="round" />
      {/* second hand */}
      <g transform={`rotate(${sec} 200 200)`}>
        <line x1={200} y1={236} x2={200} y2={52} stroke={C.orange} strokeWidth={6 + flash * 4} strokeLinecap="round" style={{ filter: flash ? `drop-shadow(0 0 ${20 * flash}px ${C.orange})` : undefined }} />
      </g>
      <circle cx={200} cy={200} r={14} fill={C.orange} />
    </svg>
  );
};

/** Quartz tuning fork (design box 240x420, base at bottom). amp: vibration, grow: extra tine length (px) */
const Fork: React.FC<{ x: number; y: number; w: number; amp: number; glow?: number; grow?: number; color?: string; electrodes?: number }> = ({ x, y, w, amp, glow = 0, grow = 0, color = "#BFEFD0", electrodes = 0 }) => {
  const f = useCurrentFrame();
  const s = w / 240;
  const d = amp * (f % 2 ? 1 : -1) * 9;
  const top = 20 - grow;
  const tine = (cx: number, dx: number, op = 1, key?: string) => (
    <path key={key} d={`M${cx - 26} 300 L${cx - 26 + dx} ${top + 26} Q${cx + dx} ${top - 4} ${cx + 26 + dx} ${top + 26} L${cx + 26} 300 Z`} fill={color} opacity={op} />
  );
  return (
    <svg style={{ position: "absolute", left: x, top: y - grow * s, overflow: "visible", filter: glow ? `drop-shadow(0 0 ${30 * glow}px ${C.green})` : "drop-shadow(0 10px 20px rgba(0,0,0,.5))" }} width={w} height={(420 + grow) * s} viewBox={`0 ${-grow} 240 ${420 + grow}`}>
      {amp > 0.05 && <>{tine(66, -d * 1.6, 0.25, "g1")}{tine(174, d * 1.6, 0.25, "g2")}</>}
      {tine(66, -d)}
      {tine(174, d)}
      <path d="M40 290 L200 290 L200 340 Q200 360 180 360 L150 360 L150 420 L90 420 L90 360 L60 360 Q40 360 40 340 Z" fill={color} />
      {electrodes > 0 && (
        <>
          <rect x={52 - d} y={top + 70} width={28} height={200 + 0} rx={6} fill={C.green} opacity={0.55 * electrodes} />
          <rect x={160 + d} y={top + 70} width={28} height={200} rx={6} fill={C.green} opacity={0.55 * electrodes} />
        </>
      )}
    </svg>
  );
};

/** Little battery (design 160x90) */
const Battery: React.FC<{ x: number; y: number; k: number; on: number }> = ({ x, y, k, on }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, k)}` }}>
    <div style={{ position: "relative", width: 170, height: 96, borderRadius: 18, border: `6px solid ${on > 0.5 ? C.green : "rgba(245,241,232,.5)"}`, background: "#0A1226", boxShadow: on > 0.5 ? `0 0 30px rgba(74,222,128,.5)` : undefined }}>
      <div style={{ position: "absolute", right: -18, top: 28, width: 12, height: 28, borderRadius: 4, background: on > 0.5 ? C.green : "rgba(245,241,232,.5)" }} />
      <div style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: lerp(20, 130, on), borderRadius: 8, background: C.green, opacity: 0.8 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white }}>+ −</div>
    </div>
  </div>
);

const Tag: React.FC<{ k: number; text: React.ReactNode; color?: string; size?: number; x?: number; y: number; w?: number }> = ({ k, text, color = C.green, size = 54, x = 0, y, w = 1080 }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", top: y, left: x, width: w, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.5) }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.16}px ${size * 0.42}px`, borderRadius: size * 0.34, border: `4px solid ${color}`, background: "rgba(10,18,38,.92)", boxShadow: `0 0 40px ${color}55`, scale: `${lerp(0.4, 1, k)}`, whiteSpace: "nowrap", letterSpacing: 1 }}>{text}</div>
    </div>
  );

/** oscilloscope with a fast sine */
const Scope: React.FC<{ x: number; y: number; w: number; h: number; k: number; amp: number }> = ({ x, y, w, h, k, amp }) => {
  const t = useT();
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const u = i / 160;
    pts.push(`${20 + u * (w - 40)} ${h / 2 + 18 + Math.sin(u * 60 - t * 40) * (h / 2 - 50) * amp}`);
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(13,22,48,.96)", border: `3px solid rgba(245,241,232,.18)`, overflow: "hidden", opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - Math.min(1, k)) * 80}px` }}>
      <div style={{ position: "absolute", left: 24, top: 12, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.dim }}>vibration</div>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={w} height={h}>
        <line x1={20} y1={h / 2 + 18} x2={w - 20} y2={h / 2 + 18} stroke="rgba(245,241,232,.15)" strokeWidth={3} />
        <path d={"M" + pts.join(" L")} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${C.green})` }} />
      </svg>
    </div>
  );
};

// ---------- scene 1: hook ----------
const Hook: React.FC = () => {
  const t = useT();
  const b = LS(1);
  const frac = (t + PH) % 1;
  const val = Math.min(32768, Math.max(1, Math.round(frac * 32768)));
  const ticks = wrapsUntil(t);
  const lastTick = ticks - PH;
  const flash = ramp(t, W(0, 3), 0.15) * (1 - ramp(t, W(0, 5), 0.5));
  const pulse = pop(t, W(0, 7), 9);
  const wz = 1 + 0.04 * Math.sin(Math.min(1, pulse) * Math.PI);
  const zoomOut = ramp(t, b - 0.6, 0.6, INOUT);
  return (
    <Scene a={0} b={b} enter={false}>
      <div style={{ position: "absolute", top: 168, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, lineHeight: 1.05, color: C.white, letterSpacing: -1 }}>Your watch counts to</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 168, lineHeight: 1.08, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>32,768</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, lineHeight: 1.0, color: C.white, letterSpacing: -1 }}>every second</div>
      </div>
      <div style={{ position: "absolute", inset: 0, scale: `${wz * lerp(1, 1.5, zoomOut)}`, transformOrigin: "540px 830px" }}>
        <Watch x={290} y={590} size={500} ticks={ticks + 8} tickAt={lastTick} ring={frac} flash={flash} glow={Math.min(1, pulse) * (1 - ramp(t, W(0, 7) + 0.3, 0.4))} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - zoomOut }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 112, color: C.green, textShadow: "0 0 40px rgba(74,222,128,.45)", fontVariantNumeric: "tabular-nums", minWidth: 520, textAlign: "center" }}>{fmt(val)}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: -6 }}>vibrations this second</div>
      </div>
    </Scene>
  );
};

// ---------- scene 2: the crystal ----------
const FK = { x: 420, y: 470, w: 240 };
const Crystal: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(4);
  const can = pop(t, W(1, 0), 13);
  const forkIn = ramp(t, W(1, 0) + 0.1, 0.6);
  const glow = ramp(t, W(1, 6), 0.3) * (1 - ramp(t, W(2, 1), 0.5) * 0.6);
  const qTag = pop(t, W(1, 6), 11) * (1 - ramp(t, W(2, 1) - 0.1, 0.25));
  const bat = pop(t, LS(2), 12);
  const wire = ramp(t, W(2, 1), 0.4);
  const volt = pop(t, W(2, 1), 11) * (1 - ramp(t, W(2, 6) - 0.1, 0.3));
  const amp = ramp(t, W(2, 6), 0.3);
  const scopeK = ramp(t, W(3, 0) - 0.2, 0.4);
  const chip = pop(t, W(3, 0), 11);
  const tickF = ramp(t, W(3, 3), 0.12) * (1 - ramp(t, W(3, 3) + 0.2, 0.4));
  const shakeX = shake(t, W(2, 6), 8, 0.4);
  const canY = FK.y - 40;
  const elecX = FK.x + 120 + shakeX;
  return (
    <Scene a={a} b={b}>
      {/* metal can (cut-away) */}
      <div style={{ position: "absolute", left: 330, top: canY, width: 420, height: 560, borderRadius: "200px 200px 40px 40px", border: `6px dashed rgba(245,241,232,${0.35 * can})`, background: `rgba(28,42,77,${0.55 * can})`, scale: `${lerp(0.6, 1, can)}`, opacity: Math.min(1, can * 1.5) }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -52, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.dim }}>inside the watch</div>
      </div>
      <div style={{ opacity: forkIn, translate: `0px ${(1 - forkIn) * 80}px` }}>
        <div style={{ translate: `${shakeX}px 0px` }}>
          <Fork x={FK.x} y={FK.y} w={FK.w} amp={amp} glow={glow} electrodes={wire} />
        </div>
      </div>
      <Tag k={qTag} text="quartz crystal" y={canY - 110} size={50} />
      {/* battery + wires */}
      <Battery x={80} y={760} k={bat} on={wire} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
        {wire > 0 && (
          <>
            <path d={`M250 808 C330 808 340 ${740} ${elecX - 50} 740`} fill="none" stroke={C.green} strokeWidth={7} strokeDasharray={500} strokeDashoffset={500 * (1 - wire)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${C.green})` }} />
            <path d={`M250 830 C360 880 760 900 ${elecX + 170} 760`} fill="none" stroke={C.green} strokeWidth={7} strokeDasharray={900} strokeDashoffset={900 * (1 - wire)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${C.green})` }} />
          </>
        )}
      </svg>
      <Tag k={volt} text="voltage" y={canY - 110} size={50} />
      {/* buzz lines */}
      {amp > 0 && [0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: i ? FK.x + FK.w + 40 : FK.x - 110, top: FK.y + 60, fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green, opacity: amp * (0.5 + 0.5 * Math.sin(t * 30 + i)) }}>{i ? "))" : "(("}</div>
      ))}
      <Scope x={90} y={1090} w={900} h={260} k={scopeK} amp={amp} />
      <div style={{ position: "absolute", left: 0, right: 0, top: canY - 120, display: "flex", justifyContent: "center", opacity: Math.min(1, chip * 1.5) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green, padding: "8px 28px", borderRadius: 20, border: `4px solid ${C.green}`, background: "rgba(10,18,38,.92)", scale: `${lerp(0.4, 1, chip) * (1 + tickF * 0.08)}`, boxShadow: `0 0 ${40 + tickF * 40}px rgba(74,222,128,.5)` }}>32,768 per second</div>
      </div>
    </Scene>
  );
};

// ---------- scene 3: the divider chip ----------
const VALS = [16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];
const GX = 90, GY = 610, TW = 160, TH = 130, GAP = 14;
const tilePos = (i: number) => {
  const r = Math.floor(i / 5), c0 = i % 5;
  const c = r % 2 ? 4 - c0 : c0; // snake order
  return { x: GX + 22 + c * (TW + GAP), y: GY + 70 + r * (TH + GAP) };
};
const Divider: React.FC = () => {
  const t = useT();
  const a = LS(4), b = LS(8);
  const powK = ramp(t, W(4, 6), 0.3);
  const chipK = ramp(t, W(5, 1), 0.5);
  const flipAt = W(5, 2);
  const x15 = pop(t, W(5, 5), 10);
  // when each tile receives its value
  const valAt = (i: number) => (i === 0 ? N1 + 0.05 : i === 1 ? N2 : i === 14 ? W(6, 6) : lerp(W(6, 1), W(6, 6) - 0.12, (i - 2) / 12));
  const outK = ramp(t, W(7, 0) - 0.15, 0.35);
  const ticks = (t >= W(7, 1) ? 1 : 0) + (t >= W(7, 3) ? 1 : 0);
  const lastTick = t >= W(7, 3) ? W(7, 3) : W(7, 1);
  const watchK = pop(t, W(7, 0) - 0.1, 12);
  const inK = pop(t, N1 - 0.25, 12);
  return (
    <Scene a={a} b={b}>
      {/* header: 32,768 -> 2^15 = 32,768 */}
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, color: C.white }}>
        <span style={{ fontSize: 130, color: C.green, display: "inline-block", opacity: powK, scale: `${lerp(0.5, 1, powK)}`, width: lerp(0, 300, powK), overflow: "hidden", whiteSpace: "nowrap", verticalAlign: "bottom" }}>2<sup style={{ fontSize: 76 }}>15</sup></span>
        <span style={{ fontSize: 130, opacity: powK, display: "inline-block", width: lerp(0, 110, powK), overflow: "hidden", verticalAlign: "bottom" }}>=</span>
        <span style={{ fontSize: 130, color: C.orange, textShadow: "0 0 40px rgba(251,146,60,.5)" }}>32,768</span>
      </div>
      {/* chip body */}
      <div style={{ position: "absolute", left: GX, top: GY, width: 900, height: 70 + 3 * TH + 2 * GAP + 30, borderRadius: 30, border: `5px solid ${C.green}`, background: "rgba(13,22,48,.85)", opacity: chipK, boxShadow: `0 0 ${50 * chipK}px rgba(74,222,128,.3)` }}>
        <div style={{ position: "absolute", left: 24, top: 14, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green }}>divider chip</div>
        {[...Array(9)].map((_, i) => <div key={"l" + i} style={{ position: "absolute", left: -26, top: 50 + i * 50, width: 22, height: 14, borderRadius: 4, background: "rgba(74,222,128,.6)" }} />)}
        {[...Array(9)].map((_, i) => <div key={"r" + i} style={{ position: "absolute", right: -26, top: 50 + i * 50, width: 22, height: 14, borderRadius: 4, background: "rgba(74,222,128,.6)" }} />)}
      </div>
      <div style={{ position: "absolute", left: GX + 900 - 190, top: GY - 46, opacity: Math.min(1, x15 * 1.5), scale: `${lerp(0.4, 1, x15)}` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, color: C.navy, background: C.green, padding: "4px 22px", borderRadius: 16, boxShadow: `0 0 30px ${C.green}` }}>×15</div>
      </div>
      {/* input pill */}
      <div style={{ position: "absolute", left: GX + 18, top: GY - 64, opacity: Math.min(1, inK * 1.5), scale: `${lerp(0.4, 1, inK)}`, transformOrigin: "0 100%" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.orange, padding: "2px 18px", borderRadius: 14, border: `4px solid ${C.orange}`, background: "rgba(10,18,38,.92)" }}>in: 32,768 ↓</div>
      </div>
      {/* tiles */}
      {VALS.map((v, i) => {
        const p = tilePos(i);
        const appear = pop(t, W(4, 3) + i * 0.07, 12);
        const flip = ramp(t, flipAt + i * 0.03, 0.25);
        const got = t >= valAt(i);
        const hit = pop(t, valAt(i), 10);
        const isLast = i === 14;
        const lit = got ? 1 : 0;
        const col = isLast && got ? C.orange : C.green;
        const label = got ? fmt(v) : flip > 0.5 ? "÷2" : "2";
        const fz = got ? (v >= 10000 ? 38 : v >= 1000 ? 42 : 56) : 60;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: TW, height: TH, borderRadius: 20, background: lit ? (isLast ? "rgba(251,146,60,.22)" : "rgba(74,222,128,.18)") : "#0A1226", border: `4px solid ${lit ? col : "rgba(245,241,232,.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: fz, color: lit ? col : C.white, opacity: Math.min(1, appear * 1.5), scale: `${lerp(0.3, 1, appear) * (got ? lerp(1.25, 1, Math.min(1, hit)) : 1) * (Math.abs(flip - 0.5) < 0.5 ? lerp(1, 0.9, Math.sin(flip * Math.PI)) : 1)}`, boxShadow: lit ? `0 0 ${isLast ? 50 : 24}px ${col}66` : undefined, letterSpacing: -1 }}>
            {label}
          </div>
        );
      })}
      {/* output: 1 per second -> watch */}
      <div style={{ position: "absolute", left: 0, right: 0, top: GY + 70 + 3 * TH + 2 * GAP + 30 + 10, display: "flex", justifyContent: "center", gap: 30, alignItems: "center", opacity: outK }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.orange }}>↓ 1 per second</div>
      </div>
      {watchK > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, watchK * 1.5) }}>
          <Watch x={760} y={1150} size={210} ticks={ticks + 8} tickAt={lastTick} flash={ticks > 0 ? 1 - ramp(t, lastTick + 0.1, 0.5) : 0} glow={ticks > 0 ? 1 - ramp(t, lastTick, 0.6) : 0} />
        </div>
      )}
      <Tag k={pop(t, W(7, 1), 11)} text="tick" color={C.orange} y={1245} size={48} x={120} w={560} />
    </Scene>
  );
};

// ---------- scene 4: why so fast? size ----------
const Size: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(10);
  const inK = pop(t, LS(8) + 0.05, 12);
  const slowK = pop(t, W(8, 5), 12);
  const grow = ramp(t, W(9, 4), 0.6, INOUT) * 260;
  const warn = ramp(t, W(9, 4) + 0.2, 0.2);
  const big = pop(t, W(9, 4), 10);
  const slowSwing = Math.sin(t * 6) * 0.9;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 76, color: C.white, opacity: Math.min(1, inK * 1.5) }}>
        Why <span style={{ fontFamily: MONO, color: C.green }}>32,768</span>?
      </div>
      {/* two watch outlines */}
      {[0, 1].map((i) => {
        const cx = i ? 770 : 310;
        const k = i ? slowK : inK;
        const stroke = i && warn > 0 ? C.orange : "rgba(245,241,232,.45)";
        return (
          <div key={i} style={{ position: "absolute", left: cx - 210, top: 600, width: 420, height: 420, borderRadius: 210, border: `6px solid ${stroke}`, background: "rgba(10,18,38,.6)", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, k)}`, boxShadow: i && warn > 0 ? `0 0 ${40 * warn}px rgba(251,146,60,.5)` : undefined, translate: `${i ? shake(t, W(9, 4) + 0.3, 10, 0.4) : 0}px 0px` }} />
        );
      })}
      <div style={{ opacity: Math.min(1, inK * 1.5) }}>
        <Fork x={310 - 80} y={640} w={160} amp={1} />
      </div>
      <div style={{ opacity: Math.min(1, slowK * 1.5) }}>
        <div style={{ position: "absolute", left: 0, top: 0, rotate: "0deg" }}>
          <SlowFork x={770 - 80} y={640} w={160} grow={grow} swing={slowSwing} orange={warn} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 310 - 220, width: 440, top: 1050, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: Math.min(1, inK * 1.5) }}>32,768 / s</div>
      <div style={{ position: "absolute", left: 770 - 220, width: 440, top: 1050, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: warn > 0.5 ? C.orange : C.white, opacity: Math.min(1, slowK * 1.5) }}>slower</div>
      <Tag k={big} text="bigger" color={C.orange} y={1120} size={56} x={770 - 260} w={520} />
    </Scene>
  );
};

/** slower fork: same shape, swings slowly, tines can grow */
const SlowFork: React.FC<{ x: number; y: number; w: number; grow: number; swing: number; orange: number }> = ({ x, y, w, grow, swing, orange }) => {
  const s = w / 240;
  const top = 20 - grow;
  const d = swing * 10;
  const col = orange > 0.5 ? "#FDBA74" : "#BFEFD0";
  const tine = (cx: number, dx: number) => <path d={`M${cx - 26} 300 L${cx - 26 + dx} ${top + 26} Q${cx + dx} ${top - 4} ${cx + 26 + dx} ${top + 26} L${cx + 26} 300 Z`} fill={col} />;
  return (
    <svg style={{ position: "absolute", left: x, top: y - grow * s, overflow: "visible", filter: orange ? `drop-shadow(0 0 ${24 * orange}px ${C.orange})` : "drop-shadow(0 10px 20px rgba(0,0,0,.5))" }} width={w} height={(420 + grow) * s} viewBox={`0 ${-grow} 240 ${420 + grow}`}>
      {tine(66, -d)}
      {tine(174, d)}
      <path d="M40 290 L200 290 L200 340 Q200 360 180 360 L150 360 L150 420 L90 420 L90 360 L60 360 Q40 360 40 340 Z" fill={col} />
    </svg>
  );
};

// ---------- scene 5: just above hearing ----------
const AX = { x: 110, y: 1090, w: 860 };
const kx = (khz: number) => AX.x + (khz / 40) * AX.w;
const Hearing: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const z = lerp(1, 1.05, ramp(t, W(11, 0), T.END - W(11, 0), INOUT));
  const axK = ramp(t, LS(10) + 0.05, 0.5);
  const band = ramp(t, LS(10) + 0.2, 0.7, INOUT);
  const pin = ramp(t, W(10, 1) - 0.1, WE(10, 4) - W(10, 1) + 0.1, INOUT);
  const land = pop(t, W(10, 4), 9);
  const ears = ramp(t, W(11, 2), 0.2) * (1 - ramp(t, W(11, 2) + 0.4, 0.6) * 0.6);
  const take = pop(t, WE(11, 4) + 0.15, 11);
  const pinX = lerp(kx(40) + 200, kx(32.768), pin);
  const shift = ramp(t, WE(11, 4) + 0.1, 0.5, INOUT);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      {/* takeaway */}
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", opacity: Math.min(1, take * 1.5), scale: `${lerp(0.6, 1, take)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.white, lineHeight: 1.1 }}>
          <span style={{ fontFamily: MONO, color: C.green }}>2<sup style={{ fontSize: 50 }}>15</sup></span> vibrations
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 124, color: C.orange, lineHeight: 1.15, textShadow: "0 0 40px rgba(251,146,60,.5)" }}>= 1 SECOND</div>
      </div>
      <div style={{ position: "absolute", inset: 0, scale: `${z}`, transformOrigin: "540px 1000px", translate: `0px ${shift * 40}px` }}>
        {/* fork riding the pin */}
        <div style={{ opacity: pin > 0 ? 1 : 0 }}>
          <Fork x={pinX - 60} y={470} w={120} amp={1} glow={land > 0 ? 0.4 : 0} />
        </div>
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: axK }} width={1080} height={1920}>
          {/* hearing band */}
          <rect x={kx(0.02)} y={AX.y - 150} width={(kx(20) - kx(0.02)) * band} height={150} rx={16} fill={`rgba(74,222,128,${0.18 + ears * 0.25})`} stroke={C.green} strokeWidth={4} style={{ filter: ears ? `drop-shadow(0 0 ${30 * ears}px ${C.green})` : undefined }} />
          <line x1={AX.x} y1={AX.y} x2={AX.x + AX.w} y2={AX.y} stroke="rgba(245,241,232,.7)" strokeWidth={5} />
          {[0, 10, 20, 30, 40].map((k) => <line key={k} x1={kx(k)} y1={AX.y} x2={kx(k)} y2={AX.y + 18} stroke="rgba(245,241,232,.7)" strokeWidth={4} />)}
          {/* pin */}
          {pin > 0 && (
            <g>
              <line x1={pinX} y1={AX.y - 300} x2={pinX} y2={AX.y + 4} stroke={C.orange} strokeWidth={6} style={{ filter: `drop-shadow(0 0 10px ${C.orange})` }} />
              <circle cx={pinX} cy={AX.y} r={14 + land * 4} fill={C.orange} />
            </g>
          )}
        </svg>
        {[0, 10, 20, 30, 40].map((k) => (
          <div key={k} style={{ position: "absolute", left: kx(k) - 60, width: 120, top: AX.y + 26, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim, opacity: axK }}>{k}k</div>
        ))}
        <div style={{ position: "absolute", left: AX.x, width: AX.w, top: AX.y + 66, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim, opacity: axK }}>vibrations per second</div>
        <div style={{ position: "absolute", left: kx(0), width: kx(20) - kx(0), top: AX.y - 118, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: band }}>your ears</div>
        <div style={{ position: "absolute", left: kx(20) - 110, width: 220, top: AX.y - 205, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green, opacity: band }}>~20k</div>
        {pin > 0 && (
          <div style={{ position: "absolute", left: pinX - 170, width: 340, top: AX.y - 380, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, color: C.orange, padding: "4px 18px", borderRadius: 14, border: `4px solid ${C.orange}`, background: "rgba(10,18,38,.92)", scale: `${1 + Math.max(0, land - 1) * 0.5}` }}>32,768</div>
          </div>
        )}
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
type Cue = [number, string, number];
const hookTicks: Cue[] = [0.25, 1.25, 2.25, 3.25, 4.25].map((s) => [s, "tick", 0.55]);
const cascade: Cue[] = VALS.slice(2, 14).map((_, i) => [lerp(W(6, 1), W(6, 6) - 0.12, i / 12), "key", 0.35]);
const SFX: Cue[] = [
  [0, "pop", 0.6], [0.02, "riser", 0.25], ...hookTicks, [W(0, 3), "chime", 0.4], [W(0, 7), "impact", 0.45],
  [LS(1) - 0.2, "whoosh", 0.5], [W(1, 0) + 0.1, "enter", 0.4], [W(1, 3), "tick", 0.35], [W(1, 6), "chime", 0.5], [W(1, 6) + 0.05, "pop", 0.45],
  [LS(2), "pop", 0.45], [W(2, 1), "zap", 0.5], [W(2, 1) + 0.05, "click", 0.5], [W(2, 4), "tick", 0.35], [W(2, 6), "vortex", 0.3], [W(2, 6) + 0.02, "impact", 0.35],
  [W(3, 0) - 0.15, "whoosh", 0.35], [W(3, 0), "pop", 0.55], [W(3, 1), "riser", 0.3], [W(3, 3), "tick", 0.55],
  [LS(4) - 0.15, "whoosh", 0.5], [W(4, 1), "tick", 0.35], ...[...Array(15)].map((_, i): Cue => [W(4, 3) + i * 0.07, "key", 0.3]), [W(4, 6), "chime", 0.5],
  [W(5, 1), "enter", 0.45], [W(5, 2), "click", 0.55], [W(5, 2) + 0.2, "click", 0.4], [W(5, 5), "stamp", 0.45], [W(5, 8), "tick", 0.3],
  [N1 - 0.25, "pop", 0.45], [N1 + 0.05, "pop", 0.55], [N2, "pop", 0.55], ...cascade, [W(6, 6), "impact", 0.5], [W(6, 6) + 0.03, "chime", 0.5],
  [W(7, 0) - 0.1, "whoosh", 0.35], [W(7, 1), "tick", 0.7], [W(7, 3), "tick", 0.7], [W(7, 3) + 0.05, "chime", 0.35],
  [LS(8) - 0.15, "whoosh", 0.5], [LS(8) + 0.05, "pop", 0.45], [W(8, 3), "tick", 0.35], [W(8, 5), "pop", 0.5], [W(8, 6), "tick", 0.3],
  [W(9, 4) - 0.05, "riser", 0.35], [W(9, 4) + 0.1, "stamp", 0.5], [W(9, 4) + 0.3, "error", 0.4],
  [LS(10) - 0.15, "whoosh", 0.5], [LS(10) + 0.1, "enter", 0.35], [W(10, 1) - 0.1, "whoosh", 0.35], [W(10, 2), "riser", 0.3], [W(10, 4), "impact", 0.5], [W(10, 4) + 0.03, "pop", 0.45],
  [W(11, 2), "chime", 0.45], [W(11, 4), "tick", 0.35], [WE(11, 4) + 0.15, "pop", 0.5], [WE(11, 4) + 0.2, "chime", 0.45], [WE(11, 4) + 1.2, "tick", 0.4],
];

export const Quartz32768: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Crystal />
    <Divider />
    <Size />
    <Hearing />
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
