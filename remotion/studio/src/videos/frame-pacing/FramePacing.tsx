/*
 * STORYBOARD — "60 FPS that still stutters" (frame pacing; pillar C; ending: implication, E5/E6 odd n; posts 01:00+1, E7)
 * One world: a small game screen (a runner + scrolling pillars, FPS counter in the corner, shown in 3× slow-mo so
 * 60 FPS differences are visible at 30 fps video) above a 1-second frame timeline (one tick per frame).
 * Real numbers: even = 60 frames × 16.7 ms. Uneven = 44 frames × 8 ms + 16 frames × 40 ms = 992 ms ≈ 1 s → still "60 FPS".
 * 1% low of the uneven second = slowest frames 40 ms → 25 FPS. Cap example: 45 FPS = one frame every 22.2 ms.
 * L0  "Your game says 60 FPS, but it feels choppy."  HOOK (frame 0 complete): "60 FPS" (green mono) / "still choppy" (orange mono)
 *                                                    + game screen whose world stutters (uneven pacing) from frame 0.
 * L1  "FPS is an average."                           the counter zooms to centre: "60 frames ÷ 1 second" → "= an average" pill on "average".
 * L2  "Sixty frames in a second could arrive evenly," game screen (smooth) + 1-second timeline; 60 ticks drop in from "Sixty" to "evenly".
 * L3  "one every 16.7 milliseconds."                 bracket between two ticks + "16.7 ms" label on "16.7".
 * L4  "Or most could arrive fast and a few late:"    ticks slide into clumps on "fast"; late gaps glow orange on "late"; screen starts stuttering.
 * L5  "8 milliseconds, then 40."                     "8 ms" bracket (green) on "8", "40 ms" bracket (orange) on "40".
 * L6  "The counter still says 60,"                   FPS counter on the screen pulses "60 FPS" + "still 60 FPS" stamp on "60".
 * L7  "but your eyes notice the gaps."               eye icon on "eyes"; gaps flash orange + screen shakes on "gaps".
 * L8  "That's frame pacing."                         "FRAME PACING" stamp lands on "frame".
 * L9  "It's why reviewers now show frame-time graphs and 1% lows,"  frame-time graph card: flat green line vs spiky orange
 *                                                    line drawn on "graphs"; "avg 60 FPS" + "1% low 25 FPS" pills on "1%".
 * L10 "and why capping your frame rate"              END world: screen + timeline; "FPS cap: 45" limiter drops on "capping";
 *                                                    ticks snap to an even 22.2 ms grid on "rate".
 * L11 "can make a game feel smoother."               screen runs smooth, "smoother ✓" on "smoother"; takeaway on top:
 *                                                    "Smooth = evenly spaced frames" (implication ending, no CTA).
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 1.6);
const { W, LS } = T;
export const FRAME_PACING_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/frame-pacing/${p}`);

// ---------- frame schedules (ms between frames) ----------
const EVEN = [...Array(60)].map(() => 1000 / 60);
// 16 late frames spread evenly among 60: 44 × 8 ms + 16 × 40 ms = 992 ms
const UNEVEN = [...Array(60)].map((_, i) => (Math.floor(((i + 1) * 16) / 60) > Math.floor((i * 16) / 60) ? 40 : 8));
const CAP = [...Array(45)].map(() => 1000 / 45);
const cum = (a: number[]) => { const o = [0]; a.forEach((d) => o.push(o[o.length - 1] + d)); return o; };
const EVEN_C = cum(EVEN), UNEVEN_C = cum(UNEVEN), CAP_C = cum(CAP);
const SLOW = 3; // shown in 3× slow motion

/** game time (s) actually on screen at real time t, for a repeating schedule */
const shown = (t: number, sched: number[], c: number[]) => {
  const period = c[c.length - 1];
  const g = ((t / SLOW) * 1000);
  const base = Math.floor(g / period) * period;
  const r = g - base;
  let k = 0;
  while (k < sched.length && c[k + 1] <= r) k++;
  return (base + c[k]) / 1000;
};

// ---------- building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);
const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.92)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);
const Stamp: React.FC<{ text: string; k: number; color?: string; size?: number; rot?: number }> = ({ text, k, color = C.orange, size = 76, rot = -6 }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, border: `7px solid ${color}`, borderRadius: 20, padding: "4px 30px", background: "rgba(10,18,38,.94)", rotate: `${rot}deg`, scale: `${lerp(2.2, 1, k)}`, opacity: Math.min(1, k * 2), boxShadow: `0 0 50px ${color}77`, whiteSpace: "nowrap" }}>{text}</div>
);

/** The game screen. mode picks the frame schedule; mix blends from even (0) to uneven (1) by switching at the threshold. */
const Game: React.FC<{ w: number; h: number; sched: "even" | "uneven" | "cap"; fps?: string; fpsK?: number; fpsColor?: string; shakeX?: number; glow?: string }> = ({ w, h, sched, fps = "60 FPS", fpsK = 0, fpsColor = C.green, shakeX = 0, glow }) => {
  const t = useT();
  const g = sched === "even" ? shown(t, EVEN, EVEN_C) : sched === "uneven" ? shown(t, UNEVEN, UNEVEN_C) : shown(t, CAP, CAP_C);
  const speed = 1500; // px per game-second
  const scroll = g * speed;
  const pillarGap = 260;
  const groundY = h * 0.74;
  const bob = Math.abs(Math.sin(g * 18)) * 22;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 34, overflow: "hidden", border: `6px solid ${glow ?? "rgba(245,241,232,.35)"}`, background: "linear-gradient(180deg,#1B2D5C 0%,#13224A 70%,#0B1530 100%)", boxShadow: glow ? `0 0 60px ${glow}66` : "0 20px 60px rgba(0,0,0,.4)", translate: `${shakeX}px 0px` }}>
      {/* far hills */}
      {[...Array(6)].map((_, i) => {
        const x = ((i * 360 - scroll * 0.3) % 2160 + 2160) % 2160 - 360;
        return <div key={`h${i}`} style={{ position: "absolute", left: x, top: groundY - 150, width: 420, height: 300, borderRadius: "50%", background: "rgba(74,222,128,.10)" }} />;
      })}
      {/* pillars */}
      {[...Array(Math.ceil(w / pillarGap) + 2)].map((_, i) => {
        const x = ((i * pillarGap - scroll) % (pillarGap * (Math.ceil(w / pillarGap) + 2)) + pillarGap * (Math.ceil(w / pillarGap) + 2)) % (pillarGap * (Math.ceil(w / pillarGap) + 2)) - pillarGap;
        const ph = 110 + ((i * 53) % 90);
        return <div key={i} style={{ position: "absolute", left: x, top: groundY - ph, width: 70, height: ph, borderRadius: "14px 14px 0 0", background: "#2B4A8A", border: "4px solid #4A6FB8", borderBottom: "none" }} />;
      })}
      {/* ground */}
      <div style={{ position: "absolute", left: 0, right: 0, top: groundY, bottom: 0, background: "#0E1A3A", borderTop: `5px solid ${C.green}` }} />
      {[...Array(14)].map((_, i) => {
        const x = ((i * 90 - scroll) % 1260 + 1260) % 1260 - 90;
        return <div key={`g${i}`} style={{ position: "absolute", left: x, top: groundY + 30, width: 44, height: 8, borderRadius: 4, background: "rgba(74,222,128,.35)" }} />;
      })}
      {/* runner */}
      <div style={{ position: "absolute", left: w * 0.3, top: groundY - 110 - bob, width: 96, height: 104, borderRadius: 26, background: C.green, boxShadow: "0 0 30px rgba(74,222,128,.6)" }}>
        <div style={{ position: "absolute", left: 52, top: 26, width: 18, height: 26, borderRadius: 9, background: C.navy }} />
        <div style={{ position: "absolute", left: 76, top: 26, width: 14, height: 26, borderRadius: 7, background: C.navy }} />
      </div>
      {/* HUD */}
      <div style={{ position: "absolute", right: 22, top: 18, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: fpsColor, background: "rgba(6,10,24,.75)", padding: "4px 18px", borderRadius: 14, scale: `${1 + fpsK * 0.35}`, transformOrigin: "100% 0", boxShadow: fpsK > 0.05 ? `0 0 ${50 * fpsK}px ${fpsColor}` : undefined }}>{fps}</div>
      <div style={{ position: "absolute", left: 22, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.dim }}>3× slow-mo</div>
    </div>
  );
};

/** 1-second frame timeline. pos(k) = position (ms) of tick k; ticks appear with tickK(k). */
const TL_W = 900;
const Timeline: React.FC<{ ticks: number[]; tickK?: (k: number) => number; lateGlow?: number; lateIdx?: Set<number>; brackets?: { a: number; b: number; label: string; color: string; k: number; up?: boolean }[]; label?: string }> = ({ ticks, tickK = () => 1, lateGlow = 0, lateIdx = new Set(), brackets = [], label = "1 second" }) => {
  const x = (ms: number) => (ms / 1000) * TL_W;
  return (
    <div style={{ position: "relative", width: TL_W, height: 170 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 6, borderRadius: 3, background: "rgba(245,241,232,.3)" }} />
      <div style={{ position: "absolute", left: 0, top: 112, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim }}>0 ms</div>
      <div style={{ position: "absolute", right: 0, top: 112, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim }}>1000 ms</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.white }}>{label}</div>
      {/* late gaps */}
      {lateGlow > 0.01 && [...lateIdx].map((k) => (
        <div key={`l${k}`} style={{ position: "absolute", left: x(ticks[k - 1] ?? 0) + 4, width: Math.max(0, x(ticks[k]) - x(ticks[k - 1] ?? 0) - 6), top: 44, height: 58, borderRadius: 8, background: `rgba(251,146,60,${0.55 * lateGlow})`, boxShadow: `0 0 ${24 * lateGlow}px rgba(251,146,60,.8)` }} />
      ))}
      {ticks.map((ms, k) => {
        const kk = tickK(k);
        if (kk <= 0.001) return null;
        return <div key={k} style={{ position: "absolute", left: x(ms) - 3, top: 40, width: 6, height: 66, borderRadius: 3, background: C.green, opacity: Math.min(1, kk * 1.5), translate: `0px ${(1 - kk) * -40}px`, boxShadow: "0 0 8px rgba(74,222,128,.7)" }} />;
      })}
      {brackets.map((b, i) => b.k > 0.01 && (
        <div key={i} style={{ position: "absolute", left: x(b.a), width: x(b.b) - x(b.a), top: b.up ? -60 : 8, opacity: Math.min(1, b.k * 1.5) }}>
          <div style={{ height: 20, borderLeft: `4px solid ${b.color}`, borderRight: `4px solid ${b.color}`, borderTop: `4px solid ${b.color}`, borderRadius: "6px 6px 0 0", translate: "0 28px" }} />
          <div style={{ position: "absolute", left: "50%", top: -58, translate: "-50% 0", scale: `${lerp(0.5, 1, b.k)}` }}><Pill text={b.label} color={b.color} size={38} /></div>
        </div>
      ))}
    </div>
  );
};
const lateSet = new Set(UNEVEN.map((d, i) => (d === 40 ? i : -1)).filter((i) => i >= 0));
// bracket gaps: an 8 ms gap near the middle and a 40 ms gap on the right
const B8 = 20 + UNEVEN.slice(20).findIndex((d) => d === 8);
const B40 = 44 + UNEVEN.slice(44).findIndex((d) => d === 40);

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  return (
    <Scene a={0} b={LS(1)} enter={false}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: C.green, textShadow: "0 0 50px rgba(74,222,128,.45)" }}>60 FPS</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 112, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 7), 10, 0.4)}px 0px` }}>still choppy</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 560 }}>
        <Game w={900} h={660} sched="uneven" fpsK={pop(t, W(0, 3), 10) * (1 - ramp(t, W(0, 4), 0.4))} glow={t > W(0, 7) ? C.orange : undefined} />
      </div>
    </Scene>
  );
};

const Average: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(2);
  const k = pop(t, a, 12);
  const avg = pop(t, W(1, 3), 10);
  return (
    <Scene a={a} b={b}>
      <Center y={560} style={{ opacity: Math.min(1, k * 1.5), scale: `${lerp(0.6, 1, k)}` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 190, color: C.green, textShadow: "0 0 60px rgba(74,222,128,.45)" }}>60 FPS</div>
      </Center>
      <Center y={820} style={{ opacity: ramp(t, W(1, 0) + 0.1, 0.3) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.white }}>= 60 frames ÷ 1 second</div>
      </Center>
      <Center y={1020} style={{ opacity: avg, scale: `${lerp(0.5, 1, avg)}` }}>
        <Pill text="an AVERAGE" color={C.orange} size={70} />
      </Center>
    </Scene>
  );
};

const Pacing: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(9);
  // even ticks drop in from "Sixty" to "evenly"
  const d0 = W(2, 0), d1 = W(2, 7);
  const tickK = (k: number) => pop(t, d0 + (k / 59) * (d1 - d0), 14, 260);
  // morph even → uneven on "fast"
  const m = ramp(t, W(4, 4) - 0.1, 0.6, INOUT);
  const ticks = EVEN_C.slice(1).map((e, k) => lerp(e, UNEVEN_C[k + 1], m));
  const uneven = t >= W(4, 4);
  const lateGlow = ramp(t, W(4, 8), 0.3) * (t > W(7, 5) ? 0.6 + 0.4 * Math.abs(Math.sin((t - W(7, 5)) * 9)) : 1);
  const b16 = pop(t, W(3, 2), 12) * (1 - ramp(t, W(4, 3), 0.3));
  const b8 = pop(t, W(5, 0), 12);
  const b40 = pop(t, W(5, 3), 10);
  const still = pop(t, W(6, 4), 9, 220) * (1 - ramp(t, LS(8) - 0.2, 0.3));
  const fpsK = pop(t, W(6, 1), 10) * (1 - ramp(t, W(6, 4) + 0.6, 0.4));
  const eye = pop(t, W(7, 2), 11);
  const gapsShake = shake(t, W(7, 5), 18, 0.5);
  const fp = pop(t, W(8, 1), 9, 220);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: 90, top: 450 }}>
        <Game w={900} h={500} sched={uneven ? "uneven" : "even"} fpsK={fpsK} shakeX={gapsShake} glow={t > W(7, 5) ? C.orange : uneven ? undefined : C.green} />
      </div>
      {/* labels over the screen */}
      <div style={{ position: "absolute", left: 120, top: 880, opacity: ramp(t, W(2, 7), 0.3) * (1 - ramp(t, W(4, 4), 0.2)) }}><Pill text="even ✓" color={C.green} size={38} /></div>
      <div style={{ position: "absolute", left: 120, top: 880, opacity: ramp(t, W(4, 8), 0.3) * (1 - ramp(t, W(7, 2) - 0.1, 0.2)) }}><Pill text="uneven ✗" color={C.orange} size={38} /></div>
      {eye > 0.01 && (
        <div style={{ position: "absolute", left: 120, top: 862, opacity: eye, scale: `${lerp(0.4, 1, eye)}`, transformOrigin: "0 50%" }}>
          <svg width={150} height={90} viewBox="0 0 150 90"><path d="M8 45 Q75 -12 142 45 Q75 102 8 45 Z" fill="rgba(10,18,38,.95)" stroke={C.white} strokeWidth={6} /><circle cx={75 + Math.sin(t * 5) * 14} cy={45} r={20} fill={C.orange} /><circle cx={75 + Math.sin(t * 5) * 14} cy={45} r={8} fill={C.navy} /></svg>
        </div>
      )}
      <div style={{ position: "absolute", left: 90, top: 1120 }}>
        <Timeline ticks={ticks} tickK={tickK} lateGlow={lateGlow} lateIdx={lateSet}
          label={uneven ? "1 second = 60 frames" : "1 second"}
          brackets={[
            { a: EVEN_C[29], b: EVEN_C[30], label: "16.7 ms", color: C.green, k: b16 },
            { a: UNEVEN_C[B8], b: UNEVEN_C[B8 + 1], label: "8 ms", color: C.green, k: b8 },
            { a: UNEVEN_C[B40], b: UNEVEN_C[B40 + 1], label: "40 ms", color: C.orange, k: b40 },
          ]} />
      </div>
      {still > 0.01 && <div style={{ position: "absolute", right: 110, top: 600 }}><Stamp text="still 60" k={still} color={C.green} size={64} /></div>}
      {fp > 0.01 && <Center y={640}><Stamp text="FRAME PACING" k={fp} color={C.orange} size={84} rot={-5} /></Center>}
    </Scene>
  );
};

/** frame-time graph: ms per frame, 60 frames */
const GW = 860, GH = 340, GMAX = 45;
const gx = (i: number) => (i / 59) * GW;
const gy = (ms: number) => GH - (ms / GMAX) * GH;
const pathOf = (arr: number[]) => arr.map((ms, i) => `${i ? "L" : "M"}${gx(i).toFixed(1)} ${gy(ms).toFixed(1)}`).join(" ");
const Graph: React.FC = () => {
  const t = useT();
  const a = LS(9), b = LS(10);
  const card = pop(t, W(9, 2), 12);
  const draw = ramp(t, W(9, 5) - 0.1, 1.1, INOUT);
  const p1 = pop(t, W(9, 8), 11);
  const p2 = pop(t, W(9, 9), 11);
  return (
    <Scene a={a} b={b}>
      <Center y={470} style={{ opacity: ramp(t, a, 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>what reviewers show</div>
      </Center>
      <div style={{ position: "absolute", left: 60, top: 570, width: 960, height: 520, borderRadius: 30, border: `4px solid rgba(245,241,232,.3)`, background: "rgba(10,18,38,.93)", opacity: Math.min(1, card * 1.5), scale: `${lerp(0.6, 1, card)}` }}>
        <div style={{ position: "absolute", left: 40, top: 26, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.white }}>frame time (ms)</div>
        <svg width={GW} height={GH} style={{ position: "absolute", left: 50, top: 110, overflow: "visible" }}>
          {[0, 8, 16.7, 40].map((v) => (
            <g key={v}>
              <line x1={0} x2={GW} y1={gy(v)} y2={gy(v)} stroke="rgba(245,241,232,.12)" strokeWidth={2} />
              <text x={-10} y={gy(v) + 8} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={22} fill="rgba(245,241,232,.5)">{v}</text>
            </g>
          ))}
          <path d={pathOf(UNEVEN)} fill="none" stroke={C.orange} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 8px #FB923C)" }} />
          <path d={pathOf(EVEN)} fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 8px #4ADE80)" }} />
        </svg>
        <div style={{ position: "absolute", left: 50, top: 470, display: "flex", gap: 40, fontFamily: MONO, fontWeight: 800, fontSize: 28, opacity: draw }}>
          <span style={{ color: C.green }}>━ even</span><span style={{ color: C.orange }}>━ uneven</span><span style={{ color: C.dim }}>both: 60 FPS avg</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1140, display: "flex", justifyContent: "space-between" }}>
        <div style={{ opacity: p1, scale: `${lerp(0.5, 1, p1)}` }}><Pill text="1% low: 60" color={C.green} size={46} /></div>
        <div style={{ opacity: p2, scale: `${lerp(0.5, 1, p2)}` }}><Pill text="1% low: 25" color={C.orange} size={46} /></div>
      </div>
    </Scene>
  );
};

const Cap: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const capK = pop(t, W(10, 2), 10);
  const snap = ramp(t, W(10, 5) - 0.05, 0.5, INOUT);
  const capped = t >= W(10, 5) + 0.2;
  // uneven ticks (first 45) slide to the even 22.2 ms grid
  const ticks = CAP_C.slice(1).map((e, k) => lerp(UNEVEN_C[k + 1] ?? e, e, snap));
  const extra = 1 - snap; // the remaining 15 uneven ticks fade out
  const sm = pop(t, W(11, 5), 10);
  const take = ramp(t, W(11, 0), 0.4);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Center y={440} style={{ opacity: take, translate: `0px ${(1 - take) * 20}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, color: C.white, textAlign: "center", lineHeight: 1.1 }}>Smooth = <span style={{ color: C.green }}>evenly spaced</span> frames</div>
      </Center>
      <div style={{ position: "absolute", left: 90, top: 540 }}>
        <Game w={900} h={460} sched={capped ? "cap" : "uneven"} fps={capped ? "45 FPS" : "60 FPS"} fpsK={pop(t, W(10, 5) + 0.2, 10) * (1 - ramp(t, W(10, 5) + 0.8, 0.4))} glow={capped ? C.green : undefined} />
      </div>
      <div style={{ position: "absolute", right: 110, top: 900, opacity: sm, scale: `${lerp(0.5, 1, sm)}` }}><Pill text="smoother ✓" color={C.green} size={44} /></div>
      <div style={{ position: "absolute", left: 90, top: 1120 }}>
        <Timeline ticks={[...ticks, ...UNEVEN_C.slice(46)]} tickK={(k) => (k >= 45 ? extra : 1)} lateGlow={1 - snap} lateIdx={new Set([...lateSet].filter((k) => k < 45))}
          label={capped ? "one frame every 22.2 ms" : "1 second"} />
      </div>
      <Center y={1040} style={{ opacity: capK, scale: `${lerp(0.5, 1, capK)}` }}>
        <Pill text="FPS cap: 45" color={C.green} size={48} />
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.05, "error", 0.25],
  ...[...Array(4)].map((_, i) => [0.35 + i * 0.4, "tick", 0.3] as [number, string, number]),
  [W(0, 3), "pop", 0.6], [W(0, 7), "error", 0.5],
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 0), "pop", 0.5], [W(1, 3), "stamp", 0.8],
  [LS(2) - 0.15, "whoosh", 0.6], ...[...Array(12)].map((_, i) => [W(2, 0) + (i / 11) * (W(2, 7) - W(2, 0)), "key", 0.35] as [number, string, number]), [W(2, 7), "chime", 0.5],
  [W(3, 2), "pop", 0.6],
  [W(4, 4), "rewind", 0.4], [W(4, 8), "error", 0.5],
  [W(5, 0), "pop", 0.6], [W(5, 3), "impact", 0.7],
  [W(6, 1), "click", 0.6], [W(6, 4), "stamp", 0.9],
  [W(7, 2), "pop", 0.6], [W(7, 5), "error", 0.7], [W(7, 5) + 0.05, "impact", 0.5],
  [W(8, 1), "stamp", 1], [W(8, 1) + 0.05, "impact", 0.5],
  [LS(9) - 0.15, "whoosh", 0.6], [W(9, 2), "pop", 0.6], [W(9, 5), "printer", 0.35], [W(9, 8), "pop", 0.6], [W(9, 9), "pop", 0.6],
  [LS(10) - 0.15, "whoosh", 0.6], [W(10, 2), "click", 0.8], [W(10, 2) + 0.05, "pop", 0.5], [W(10, 5), "zap", 0.6],
  [W(11, 0), "riser", 0.3], [W(11, 5), "chime", 0.8],
];

export const FramePacing: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Average />
    <Pacing />
    <Graph />
    <Cap />
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
