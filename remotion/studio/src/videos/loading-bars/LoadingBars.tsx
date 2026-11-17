/*
 * STORYBOARD — "Why loading bars lie" (backlog n=7, ending: implication)
 * One world: a single "Installing update…" progress window that stays on screen the whole video; below it a
 * time lane shows how long each step really takes. The illustrative job = 1,000 tiny files + 1 huge file + 1 final
 * check = 1,002 steps, so after the tiny files the bar honestly reads 1,000 / 1,002 = 99 %.
 * L0  "Why is it always stuck at 99%?"            HOOK (frame 0 complete): headline "Why it's always stuck at / 99%",
 *                                                 the window with its bar at 99 %, stripes crawling, spinner turning,
 *                                                 elapsed timer ticking (motion in the first 0.5 s).
 * L1  "Most progress bars don't measure time."    headline lifts off, window glides up; a stopwatch pops on "measure",
 *                                                 an orange ✗ lands on it on "time" + "not time" pill.
 * L2  "They count steps: files copied, …"         bar rewinds to 0 %; "step 0 of 1,002" counter; on each item a pill
 *                                                 pops ("files copied" / "chunks downloaded" / "tasks finished") and a
 *                                                 "+1 step" flies into the counter.
 * L3  "But steps aren't equal."                   time lane: 12 equal blocks; on "equal" they morph to real time:
 *                                                 10 slivers (tiny files), one huge orange block, one check block. "step ≠ step".
 * L4  "A thousand tiny files fly by,"             file icons stream up into the window, counter 3→1,000, bar 0→99 %;
 *                                                 lane playhead only crosses the thin green sliver.
 * L5  "then one huge file or a final check …"     a huge file thuds in, "final check" chip with spinner; on "takes forever"
 *                                                 the elapsed clock races; playhead crawls through the orange block.
 * L6  "and the bar sits still."                   bar glows orange and pulses at 99 %, "+0%" pill; clock keeps racing.
 * L7  "The program can't know in advance"         lane becomes upcoming steps marked "?", a "?" bubble pops on the window.
 * L8  "how long each step will take,"             the "?" blocks wobble in width; "time left" readout flickers between guesses.
 * L9  "so the bar is really a guess."             "1,000 / 1,002 = 99%" pill on "bar"; orange GUESS stamp slams on the bar.
 * L10 "Some apps even ease the bar forward …"     END (implication): two bars, "real progress" jumps in steps,
 *                                                 "what you see" glides smoothly; takeaway "It counts steps, not time." holds. No CTA.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cursor, FPS, INOUT, IN, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.2);
const { W, WE, LS } = T;
export const LOADING_BARS_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/loading-bars/${p}`);

const TOTAL = 1002;
const fmt = (n: number) => n.toLocaleString("en-US");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ---------- small building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);

const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = C.green }) => {
  const t = useT();
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ rotate: `${t * 400}deg`, flex: "none" }}>
      <circle cx={25} cy={25} r={19} fill="none" stroke="rgba(245,241,232,.15)" strokeWidth={6} />
      <path d="M25 6 A19 19 0 0 1 44 25" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

const FileIcon: React.FC<{ w?: number; color?: string; label?: string }> = ({ w = 50, color = C.white, label }) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 100 125" style={{ overflow: "visible" }}>
    <path d="M6 4 H66 L94 32 V121 H6 Z" fill={color} />
    <path d="M66 4 V32 H94" fill="rgba(0,0,0,.25)" />
    {[50, 66, 82, 98].map((y, i) => <rect key={y} x={18} y={y} width={i % 2 ? 46 : 64} height={7} rx={3} fill="#101B35" opacity={0.5} />)}
    {label && <text x={50} y={150} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={18} fill={C.white}>{label}</text>}
  </svg>
);

const Stopwatch: React.FC<{ size?: number; k: number; x: number }> = ({ size = 280, k, x }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: size, height: size, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, k)}` }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", filter: `drop-shadow(0 0 16px ${C.green})` }}>
        <rect x={86} y={6} width={28} height={18} rx={5} fill={C.green} />
        <circle cx={100} cy={112} r={80} fill={C.navy} stroke={C.green} strokeWidth={10} />
        {[...Array(12)].map((_, i) => <rect key={i} x={97} y={40} width={6} height={14} rx={3} fill={C.green} opacity={0.6} style={{ transformOrigin: "100px 112px", rotate: `${i * 30}deg` }} />)}
        <rect x={96} y={52} width={8} height={64} rx={4} fill={C.white} style={{ transformOrigin: "100px 112px", rotate: `${t * 240}deg` }} />
        <circle cx={100} cy={112} r={9} fill={C.white} />
      </svg>
      {/* the ✗ */}
      {[45, -45].map((r) => (
        <div key={r} style={{ position: "absolute", left: size / 2 - (size * 1.1 * x) / 2, top: size * 0.55, width: size * 1.1 * x, height: 22, borderRadius: 11, background: C.orange, rotate: `${r}deg`, boxShadow: "0 0 30px rgba(251,146,60,.7)" }} />
      ))}
    </div>
  );
};

// ---------- the persistent progress window ----------
const WinState = (t: number) => {
  // steps done
  let steps = 0;
  if (t >= LS(2)) {
    steps = [W(2, 3), W(2, 5), W(2, 7)].filter((s) => t >= s).length;
    const f = ramp(t, W(4, 1), WE(4, 5) - W(4, 1), INOUT);
    if (f > 0) steps = Math.round(lerp(3, 1000, f));
  }
  // bar fraction
  let frac = 0.99;
  if (t >= LS(2)) frac = steps / TOTAL;
  if (t >= LS(2) - 0.05 && t < LS(2) + 0.35) frac = lerp(0.99, 0, ramp(t, LS(2) - 0.05, 0.35, INOUT)); // rewind
  const pct = Math.floor(frac * 100 + 1e-9);
  // elapsed: ticks in real time, races from "takes forever" until the program line
  const raceA = W(5, 8), raceB = LS(7);
  const race = ramp(t, raceA, raceB - raceA, (x) => x);
  const elapsed = 134 + Math.min(t, raceA) + race * 560 + Math.max(0, t - raceB);
  return { steps, frac, pct, elapsed };
};

const WIN_X = 90, WIN_W = 900, WIN_H = 300;
const winTop = (t: number) => lerp(650, 240, ramp(t, LS(1) - 0.15, 0.55, INOUT));
const BAR_TOP = 120; // inside window

const ProgressWindow: React.FC = () => {
  const t = useT();
  const s = WinState(t);
  const top = winTop(t);
  const sc = lerp(1.04, 1, ramp(t, LS(1) - 0.15, 0.55, INOUT));
  const stuck = ramp(t, W(6, 2), 0.3) * (1 - ramp(t, LS(7), 0.4));
  const pulse = stuck * (0.5 + 0.5 * Math.sin(t * 9));
  const barCol = stuck > 0.5 ? C.orange : C.green;
  const showSteps = t >= LS(2) + 0.1;
  const stepPop = Math.max(...[W(2, 3), W(2, 5), W(2, 7)].map((a) => (t >= a && t < a + 0.4 ? 1 - ramp(t, a, 0.4) : 0)), 0);
  const stampK = pop(t, W(9, 6), 9, 220) * (1 - ramp(t, LS(10), 0.35));
  const sh = shake(t, W(9, 6), 14, 0.45) + shake(t, W(5, 2), 8, 0.35);
  return (
    <div style={{ position: "absolute", left: WIN_X, top, width: WIN_W, height: WIN_H, scale: `${sc}`, translate: `${sh}px 0px` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 36, background: "linear-gradient(180deg, rgba(28,40,74,.98), rgba(16,25,52,.98))", border: `3px solid ${C.line}`, boxShadow: `0 40px 120px rgba(0,0,0,.55), 0 0 ${60 * pulse}px rgba(251,146,60,${0.5 * pulse})` }} />
      {/* title row */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 30, display: "flex", alignItems: "center", gap: 22 }}>
        <Spinner size={54} color={barCol} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white }}>Installing update…</div>
        <div style={{ marginLeft: "auto", fontFamily: MONO, fontWeight: 800, fontSize: 64, color: s.pct >= 99 ? C.orange : C.white, scale: `${1 + pulse * 0.08}`, textShadow: s.pct >= 99 ? "0 0 30px rgba(251,146,60,.55)" : undefined }}>{s.pct}%</div>
      </div>
      {/* bar */}
      <div style={{ position: "absolute", left: 40, right: 40, top: BAR_TOP, height: 78, borderRadius: 39, background: "rgba(3,8,20,.75)", border: `3px solid ${C.line}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${s.frac * 100}%`, borderRadius: 39, background: `repeating-linear-gradient(-45deg, ${barCol} 0 26px, ${barCol}CC 26px 52px)`, backgroundPosition: `${(t * 60) % 74}px 0px`, backgroundSize: "74px 74px", boxShadow: `0 0 40px ${barCol}88` }} />
      </div>
      {/* sub row */}
      <div style={{ position: "absolute", left: 44, right: 44, top: 222, display: "flex", fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.dim }}>
        <div style={{ opacity: showSteps ? 1 : 0, color: stepPop > 0 ? C.green : C.dim, scale: `${1 + stepPop * 0.12}`, transformOrigin: "left center" }}>
          step <span style={{ color: C.white }}>{fmt(s.steps)}</span> of {fmt(TOTAL)}
        </div>
        <div style={{ marginLeft: "auto" }}>elapsed <span style={{ color: t > W(5, 8) && t < LS(7) + 0.5 ? C.orange : C.white }}>{clock(s.elapsed)}</span></div>
      </div>
      {/* GUESS stamp */}
      {stampK > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: BAR_TOP - 22, display: "flex", justifyContent: "center", opacity: Math.min(1, stampK * 2) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.orange, border: `8px solid ${C.orange}`, borderRadius: 22, padding: "0 34px", background: "rgba(16,27,53,.92)", rotate: "-8deg", scale: `${lerp(2.2, 1, stampK)}`, letterSpacing: 10, boxShadow: "0 0 60px rgba(251,146,60,.5)" }}>GUESS</div>
        </div>
      )}
    </div>
  );
};

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const head = 1 - ramp(t, LS(1) - 0.2, 0.35);
  const p99 = 1 + 0.1 * (1 - pop(t, W(0, 6) - 0.05, 9)) * (t > W(0, 6) - 0.05 ? 1 : 0);
  return (
    <div style={{ position: "absolute", top: 205, left: 0, right: 0, textAlign: "center", opacity: head, translate: `0px ${(1 - head) * -50}px` }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>Why it's always stuck at</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 200, lineHeight: 1.05, color: C.orange, textShadow: "0 0 60px rgba(251,146,60,.55)", scale: `${p99}` }}>99%</div>
    </div>
  );
};

/** impatient cursor in the hook: clicks on the stuck window every 0.6 s */
const Impatient: React.FC = () => {
  const t = useT();
  const o = 1 - ramp(t, LS(1) - 0.3, 0.3);
  if (o <= 0) return null;
  const ph = (t % 0.6) / 0.6;
  const down = ph > 0.45 && ph < 0.62 ? 1 : 0;
  return <Cursor x={760 + Math.sin(t * 3) * 30} y={1010 + Math.cos(t * 4) * 18 + down * 6} down={down} opacity={o} />;
};

const NotTime: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(2);
  const sw = pop(t, W(1, 3), 12);
  const x = ramp(t, W(1, 5), 0.25);
  const pill = pop(t, W(1, 5) + 0.1, 11);
  return (
    <Scene a={a} b={b}>
      <Center y={640}><Stopwatch k={sw} x={x} size={300} /></Center>
      <Center y={1010} style={{ opacity: pill, scale: `${lerp(0.5, 1, pill)}` }}>
        <Pill text="doesn't measure: time" color={C.orange} size={50} />
      </Center>
    </Scene>
  );
};

const Steps: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(3);
  const items: [string, number][] = [["files copied", W(2, 3)], ["chunks downloaded", W(2, 5)], ["tasks finished", W(2, 7)]];
  const head = pop(t, W(2, 2), 12);
  return (
    <Scene a={a} b={b}>
      <Center y={630} style={{ opacity: head, scale: `${lerp(0.6, 1, head)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.dim }}>it counts</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.green, textShadow: "0 0 40px rgba(74,222,128,.5)" }}>steps</div>
      </Center>
      {items.map(([label, at], i) => {
        const k = pop(t, at, 12);
        const fly = ramp(t, at + 0.12, 0.5, IN);
        const y = 790 + i * 160;
        return (
          <React.Fragment key={label}>
            <div style={{ position: "absolute", left: 130, right: 130, top: y, display: "flex", alignItems: "center", gap: 26, opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * -90}px 0px` }}>
              <div style={{ width: 70, height: 70, borderRadius: 35, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 46, color: C.navy, flex: "none" }}>✓</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.white, whiteSpace: "nowrap" }}>{label}</div>
            </div>
            {fly > 0 && fly < 1 && (
              <div style={{ position: "absolute", left: lerp(140, 230, fly), top: lerp(y + 6, 470, fly), fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: 1 - fly * 0.6, scale: `${lerp(1, 0.6, fly)}`, whiteSpace: "nowrap" }}>+1 step</div>
            )}
          </React.Fragment>
        );
      })}
    </Scene>
  );
};

// time lane: 12 blocks (10 tiny files, 1 huge file, 1 check); k = 0 equal widths, 1 = real time
const LANE_X = 90, LANE_W = 900, LANE_Y = 690, LANE_H = 92;
const laneWidths = (k: number) => {
  const eq = Array(12).fill(1 / 12);
  const real = [...Array(10).fill(0.1 / 10), 0.7, 0.2];
  return eq.map((e, i) => lerp(e, real[i], k));
};

const Lane: React.FC = () => {
  const t = useT();
  const a = LS(3), b = LS(7);
  const appear = pop(t, W(3, 1), 13);
  const k = ramp(t, W(3, 3) - 0.05, 0.55, INOUT);
  const ws = laneWidths(k);
  const gap = lerp(8, 3, k);
  const neq = pop(t, W(3, 3) + 0.25, 11) * (1 - ramp(t, LS(4) - 0.1, 0.25));
  // playhead (fraction of total time)
  const ph = t < W(4, 1) ? 0 : t < LS(5) ? lerp(0, 0.1, ramp(t, W(4, 1), WE(4, 5) - W(4, 1), INOUT)) : lerp(0.1, 0.72, ramp(t, LS(5), LS(7) - LS(5), (x) => x));
  const showPh = t >= W(4, 1) - 0.1;
  // flying files (L4)
  const fA = W(4, 1), fB = WE(4, 5);
  const N = 34;
  // huge file + check (L5)
  const huge = pop(t, W(5, 2), 10, 200);
  const check = pop(t, W(5, 6), 12);
  const zero = pop(t, W(6, 3), 10);
  const clockK = pop(t, W(5, 8), 12);
  const s = WinState(t);
  let x0 = LANE_X;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: LANE_X, top: LANE_Y - 58, fontFamily: MONO, fontWeight: 700, fontSize: 32, color: C.dim, opacity: appear }}>time each step really takes →</div>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: appear, translate: `0px ${(1 - appear) * 40}px` }}>
        {ws.map((w, i) => {
          const px = w * LANE_W - gap;
          const left = x0;
          x0 += w * LANE_W;
          const col = i < 10 ? C.green : i === 10 ? C.orange : "#FBBF24";
          const done = showPh && (left - LANE_X + px) / LANE_W <= ph + 0.001;
          return <div key={i} style={{ position: "absolute", left, top: LANE_Y, width: Math.max(2, px), height: LANE_H, borderRadius: lerp(16, i < 10 ? 3 : 16, k), background: done ? col : `${col}55`, border: `3px solid ${col}`, boxShadow: done ? `0 0 24px ${col}88` : undefined }} />;
        })}
        {/* labels after morph */}
        <div style={{ position: "absolute", left: LANE_X, top: LANE_Y + LANE_H + 16, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.green, whiteSpace: "nowrap", opacity: ramp(t, W(3, 3) + 0.3, 0.3) }}>1,000 tiny files</div>
        <div style={{ position: "absolute", left: LANE_X + 0.1 * LANE_W, width: 0.7 * LANE_W, top: LANE_Y + LANE_H + 16, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.orange, opacity: ramp(t, W(3, 3) + 0.4, 0.3) }}>1 huge file</div>
        <div style={{ position: "absolute", left: LANE_X + 0.8 * LANE_W, width: 0.2 * LANE_W, top: LANE_Y + LANE_H + 16, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "#FBBF24", opacity: ramp(t, W(3, 3) + 0.5, 0.3) }}>check</div>
        {showPh && (
          <div style={{ position: "absolute", left: LANE_X + ph * LANE_W - 4, top: LANE_Y - 18, width: 8, height: LANE_H + 36, borderRadius: 4, background: C.white, boxShadow: "0 0 20px #fff" }} />
        )}
      </div>
      <Center y={900} style={{ opacity: neq, scale: `${lerp(0.5, 1, neq)}` }}>
        <Pill text="step ≠ step" color={C.orange} size={64} />
      </Center>
      {/* L4: a thousand tiny files fly up into the window */}
      {[...Array(N)].map((_, i) => {
        const st = lerp(fA, fB - 0.45, i / (N - 1));
        const k2 = ramp(t, st, 0.45, IN);
        if (k2 <= 0 || k2 >= 1) return null;
        const sx = i % 2 ? 110 + ((i * 53) % 200) : 760 + ((i * 71) % 200);
        return (
          <div key={i} style={{ position: "absolute", left: lerp(sx, 520, k2), top: lerp(1300, 420, k2), opacity: k2 < 0.85 ? 1 : (1 - k2) / 0.15, scale: `${lerp(1, 0.4, k2)}`, rotate: `${(i % 5 - 2) * 12 * (1 - k2)}deg` }}>
            <FileIcon w={46} />
          </div>
        );
      })}
      <Center y={950} style={{ opacity: ramp(t, W(4, 1), 0.2) * (1 - ramp(t, W(5, 1), 0.3)), flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.green, textShadow: "0 0 40px rgba(74,222,128,.5)" }}>{fmt(Math.min(1000, s.steps))}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim }}>tiny files done</div>
      </Center>
      {/* L5: the huge file, the final check, the racing clock */}
      {t >= W(5, 2) - 0.05 && (
        <div style={{ position: "absolute", left: 150, top: lerp(860, 890, ramp(t, W(5, 2), 3)), opacity: Math.min(1, huge * 2), scale: `${lerp(1.8, 1, huge)}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <FileIcon w={170} color={C.orange} />
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.orange }}>huge file</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 470, top: 930, opacity: Math.min(1, check * 1.5), scale: `${lerp(0.5, 1, check)}`, display: "flex", alignItems: "center", gap: 18, padding: "18px 30px", borderRadius: 28, border: "4px solid #FBBF24", background: "rgba(10,18,38,.9)" }}>
        <Spinner size={52} color="#FBBF24" />
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: "#FBBF24", whiteSpace: "nowrap" }}>final check</div>
      </div>
      <div style={{ position: "absolute", left: 470, top: 1080, opacity: clockK, scale: `${lerp(0.5, 1, clockK)}`, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim }}>elapsed</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 100, color: C.orange, textShadow: "0 0 40px rgba(251,146,60,.5)" }}>{clock(s.elapsed)}</div>
      </div>
      {/* L6: +0% */}
      <div style={{ position: "absolute", right: 90, top: 556, opacity: zero, scale: `${lerp(0.4, 1, zero)}`, rotate: `${shake(t, W(6, 3), 6, 0.4)}deg` }}>
        <Pill text="+0%" color={C.orange} size={48} />
      </div>
    </Scene>
  );
};

const GUESSES = ["2 min", "38 min", "5 sec", "1 hour", "4 min", "12 sec", "25 min", "9 sec"];
const Unknown: React.FC = () => {
  const t = useT();
  const a = LS(7), b = LS(10);
  const boxes = pop(t, a + 0.05, 13) * (1 - ramp(t, LS(9) - 0.1, 0.3));
  const wob = ramp(t, W(8, 1), 0.3);
  const q = pop(t, W(7, 3), 10);
  const left = pop(t, W(8, 0), 12);
  const gi = t < W(8, 0) ? 0 : Math.floor((t - W(8, 0)) / 0.32);
  const settle = t >= LS(9);
  const form = pop(t, W(9, 2), 11);
  // widths of 6 upcoming steps
  const raw = [...Array(6)].map((_, i) => 1 + wob * 0.75 * Math.sin(t * (3.1 + i * 0.9) + i * 1.7));
  const sum = raw.reduce((x, y) => x + y, 0);
  let x0 = LANE_X;
  return (
    <Scene a={a} b={b}>
      {/* "?" bubble on the program window */}
      <div style={{ position: "absolute", left: 880, top: 170, width: 120, height: 120, borderRadius: 60, background: C.white, color: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 84, opacity: Math.min(1, q * 1.5), scale: `${lerp(0.3, 1, q)}`, rotate: `${Math.sin(t * 5) * 6}deg`, boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>?</div>
      <div style={{ position: "absolute", left: LANE_X, top: LANE_Y - 58, fontFamily: MONO, fontWeight: 700, fontSize: 32, color: C.dim, opacity: boxes }}>steps still to do →</div>
      {raw.map((r, i) => {
        const w = (r / sum) * LANE_W;
        const l = x0;
        x0 += w;
        return (
          <div key={i} style={{ position: "absolute", left: l, top: LANE_Y, width: w - 8, height: LANE_H, borderRadius: 16, border: `3px dashed ${C.white}`, background: "rgba(245,241,232,.06)", opacity: boxes * Math.min(1, pop(t, a + 0.05 + i * 0.07, 13) * 1.5), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.white }}>?</div>
        );
      })}
      <Center y={LANE_Y + 4} style={{ opacity: form, scale: `${lerp(0.5, 1, form)}` }}>
        <Pill text={<>1,000 / 1,002 steps = <span style={{ color: C.orange }}>99%</span></>} size={50} />
      </Center>
      <Center y={900} style={{ opacity: left, scale: `${lerp(0.6, 1, left)}`, flexDirection: "column", gap: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim }}>time left</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 130, color: C.orange, textShadow: "0 0 40px rgba(251,146,60,.5)", opacity: settle ? 0.35 + 0.65 * (Math.sin(t * 12) > 0 ? 1 : 0.6) : 1 }}>{settle ? "??" : GUESSES[gi % GUESSES.length]}</div>
      </Center>
    </Scene>
  );
};

const P_END = Math.max(2.4, T.END - W(10, 3) - 0.9);
const EndCard: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const k = pop(t, W(10, 3) - 0.05, 12);
  const u = ramp(t, W(10, 3), P_END, (x) => x);
  const real = u < 0.12 ? 0 : u < 0.5 ? 0.35 : u < 0.62 ? 0.4 : u < 0.92 ? 0.85 : 1; // jumps, then stalls
  const shown = interpolate(u, [0, 0.5, 0.92, 1], [0, 0.37, 0.86, 1], { easing: INOUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = ramp(t, W(10, 9), 0.3);
  const take1 = pop(t, WE(10, 9) - 0.1, 12);
  const take2 = pop(t, WE(10, 9) + 0.35, 10);
  const bar = (label: string, frac: number, col: string, y: number, g = 0) => (
    <div style={{ position: "absolute", left: 130, right: 130, top: y }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: col, marginBottom: 14 }}>{label}</div>
      <div style={{ height: 64, borderRadius: 32, background: "rgba(3,8,20,.75)", border: `3px solid ${C.line}`, overflow: "hidden" }}>
        <div style={{ width: `${frac * 100}%`, height: "100%", borderRadius: 32, background: col, boxShadow: `0 0 ${30 + g * 40}px ${col}` }} />
      </div>
    </div>
  );
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - k) * 50}px` }}>
        {bar("real progress", real, C.orange, 620)}
        {bar("what you see", shown, C.green, 800, glow)}
      </div>
      <Center y={1040} style={{ flexDirection: "column", gap: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.white, opacity: take1, scale: `${lerp(0.6, 1, take1)}` }}>It counts steps,</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.orange, opacity: take2, scale: `${lerp(0.6, 1, take2)}`, textShadow: "0 0 40px rgba(251,146,60,.45)" }}>not time.</div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const fileTicks = [...Array(16)].map((_, i) => [lerp(W(4, 1), WE(4, 5) - 0.1, i / 15), "tick", 0.6] as [number, string, number]);
const raceTicks = [...Array(10)].map((_, i) => [lerp(W(5, 8), LS(7) - 0.2, i / 9), "tick", 0.45] as [number, string, number]);
const guessTicks = [...Array(Math.max(0, Math.floor((LS(9) - W(8, 0)) / 0.32)))].map((_, i) => [W(8, 0) + i * 0.32, "click", 0.5] as [number, string, number]);
const endJumps = [0.12, 0.5, 0.62, 0.92].map((x) => [W(10, 3) + x * P_END, "tick", 0.55] as [number, string, number]);
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.27, "click", 0.5], [0.87, "click", 0.5], [W(0, 6) - 0.05, "pop", 0.8], [2.07, "click", 0.4],
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 3), "pop", 0.7], [W(1, 5), "stamp", 0.6], [W(1, 5) + 0.1, "error", 0.3],
  [LS(2) - 0.15, "whoosh", 0.5], [LS(2) - 0.05, "rewind", 0.5], [W(2, 2), "pop", 0.6],
  [W(2, 3), "pop", 0.7], [W(2, 3) + 0.5, "tick", 0.7], [W(2, 5), "pop", 0.7], [W(2, 5) + 0.5, "tick", 0.7], [W(2, 7), "pop", 0.7], [W(2, 7) + 0.5, "tick", 0.7],
  [LS(3) - 0.15, "whoosh", 0.5], [W(3, 1), "pop", 0.6], [W(3, 3) - 0.05, "zap", 0.6], [W(3, 3) + 0.25, "impact", 0.6],
  ...fileTicks, [W(4, 4), "riser", 0.35],
  [W(5, 2), "impact", 0.9], [W(5, 6), "pop", 0.7], [W(5, 8), "riser", 0.4], ...raceTicks,
  [W(6, 3), "error", 0.35], [W(6, 3), "pop", 0.6],
  [LS(7) - 0.15, "whoosh", 0.5], [W(7, 3), "pop", 0.8], ...guessTicks,
  [W(9, 2), "pop", 0.7], [W(9, 6), "stamp", 0.9], [W(9, 6), "impact", 0.7],
  [LS(10) - 0.15, "whoosh", 0.5], [W(10, 3), "pop", 0.6], ...endJumps, [WE(10, 9) - 0.1, "chime", 0.8], [WE(10, 9) + 0.35, "pop", 0.7],
];

export const LoadingBars: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Background retro={0} />
      <Hook />
      <NotTime />
      <Steps />
      <Lane />
      <Unknown />
      <EndCard />
      <ProgressWindow />
      <Impatient />
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
};


