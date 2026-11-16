/*
 * STORYBOARD — "If a CPU cycle took one second" (backlog n=6, ending: follow_cta, E5)
 * One world: a CPU chip at the top, wired by a bus to a ladder of memory further and further away.
 * Real latencies + scaled times from the Systems Performance table (seboudry gist, 3.3 GHz): 0.3 ns → 1 s.
 * L0 "Your CPU spends most of its life waiting."  HOOK (frame 0 complete): headline "Your CPU spends most of its life / waiting";
 *     a big CPU chip with a spinning wait-ring and "waiting for data…" dots, chip pulses with each clock tick.
 * L1 "Slow it down so a single clock tick takes one second."  chip slides to top-left; speed dial winds down on "Slow";
 *     "1 tick = 0.3 ns" flips to "1 tick = 1 second" on "one second"; big clock hand ticks on "tick".
 * L2 "Grabbing data from its closest cache: about three seconds."  ladder row L1 cache pops; a data packet runs up the bus,
 *     stopwatch next to the CPU rolls; lands on "≈3 s" on "three".
 * L3 "The next cache: around ten."   L2 row, packet, "≈10 s".
 * L4 "Main memory, the RAM: six minutes."   RAM row (orange), longer bar, "≈6 min", chip shakes.
 * L5 "Reading from an SSD: days."   SSD row, "2–6 days", calendar pages flip in the readout.
 * L6 "A spinning hard drive: months." HDD row with spinning platter, "1–12 months", heaviest hit.
 * L7 "That's why chips are covered in caches,"   zoom into the chip die: cores small, cache blocks light up across it on "caches".
 * L8 "and why fast code is mostly about keeping data close."  a data block jumps from the RAM row to the L1 row
 *     beside the CPU; wait readout drops 6 min → 3 s on "close".
 * L9 "Follow: tomorrow, why loading bars lie."  END (follow_cta): takeaway "Fast code keeps data close",
 *     Follow button clicked → Following ✓, "Tomorrow:" + a loading bar crawling to 99% and stalling.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cursor, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 1.4);
const { W, LS } = T;
export const CPU_SECOND_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/cpu-second/${p}`);

// ---------- building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);

const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

/** CPU chip: square die with pins; pulses on each clock tick (rate in ticks/s, visual only) */
const Chip: React.FC<{ size: number; tickRate?: number; wait?: number; label?: string }> = ({ size, tickRate = 6, wait = 0, label = "CPU" }) => {
  const t = useT();
  const ph = (t * tickRate) % 1;
  const pulse = Math.max(0, 1 - ph * 3);
  const pins = 6;
  const pin = (i: number, side: number) => {
    const p = (i + 1) / (pins + 1);
    const L = size * 0.12, Wd = size * 0.05;
    const st: React.CSSProperties = { position: "absolute", background: C.green, borderRadius: 3, opacity: 0.85 };
    if (side === 0) return <div key={`t${i}`} style={{ ...st, left: p * size - Wd / 2, top: -L, width: Wd, height: L }} />;
    if (side === 1) return <div key={`b${i}`} style={{ ...st, left: p * size - Wd / 2, bottom: -L, width: Wd, height: L }} />;
    if (side === 2) return <div key={`l${i}`} style={{ ...st, top: p * size - Wd / 2, left: -L, height: Wd, width: L }} />;
    return <div key={`r${i}`} style={{ ...st, top: p * size - Wd / 2, right: -L, height: Wd, width: L }} />;
  };
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[0, 1, 2, 3].map((s) => [...Array(pins)].map((_, i) => pin(i, s)))}
      <div style={{ position: "absolute", inset: 0, borderRadius: size * 0.12, background: "linear-gradient(150deg,#1D3460,#0C1832)", border: `${Math.max(4, size * 0.025)}px solid ${C.green}`, boxShadow: `0 0 ${40 + pulse * 50}px rgba(74,222,128,${0.3 + pulse * 0.3})` }} />
      <div style={{ position: "absolute", inset: size * 0.16, borderRadius: size * 0.06, border: `3px solid rgba(74,222,128,.35)` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: size * 0.22, color: C.white, letterSpacing: 4 }}>{label}</div>
      {wait > 0 && (
        <svg width={size * 1.5} height={size * 1.5} viewBox="0 0 100 100" style={{ position: "absolute", left: -size * 0.25, top: -size * 0.25, opacity: wait, overflow: "visible" }}>
          <circle cx={50} cy={50} r={46} fill="none" stroke={C.orange} strokeWidth={2.5} strokeDasharray="70 220" strokeLinecap="round" style={{ transformOrigin: "50px 50px", rotate: `${t * 300}deg` }} />
        </svg>
      )}
    </div>
  );
};

// memory ladder rows (real latency → scaled time)
const ROWS = [
  { name: "L1 cache", real: "0.9 ns", scaled: "≈ 3 s", c: C.green, bar: 0.12, line: 2, land: [2, 7] as [number, number], secs: 3 },
  { name: "L2 cache", real: "2.8 ns", scaled: "≈ 10 s", c: C.green, bar: 0.2, line: 3, land: [3, 4] as [number, number], secs: 9 },
  { name: "RAM", real: "120 ns", scaled: "6 min", c: C.orange, bar: 0.42, line: 4, land: [4, 4] as [number, number], secs: 360 },
  { name: "SSD", real: "50–150 µs", scaled: "2–6 days", c: C.orange, bar: 0.7, line: 5, land: [5, 4] as [number, number], secs: 345600 },
  { name: "Hard drive", real: "1–10 ms", scaled: "1–12 months", c: C.orange, bar: 1, line: 6, land: [6, 4] as [number, number], secs: 15552000 },
];
const ROW_Y = (i: number) => 690 + i * 124;
const BUS_X = 150;

const fmtClock = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${p(h)}:${p(m)}` : `${p(h)}:${p(m)}:${p(sec)}`;
};

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  return (
    <Scene a={0} b={LS(1)} enter={false}>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>Your CPU spends<br />most of its life</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 140, lineHeight: 1.12, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>waiting</div>
      </div>
      <Center y={720} style={{ scale: `${lerp(1, 1.06, ramp(t, 0, 2.8, INOUT))}` }}>
        <Chip size={330} tickRate={5} wait={1} />
      </Center>
      <Center y={1180}>
        <Pill text={<>waiting for data<span style={{ display: "inline-block", width: 70, textAlign: "left" }}>{dots}</span></>} color={C.orange} size={46} />
      </Center>
    </Scene>
  );
};

const SlowDown: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(2);
  const chipK = ramp(t, a - 0.1, 0.6, INOUT);
  const slow = ramp(t, W(1, 0), W(1, 9) - W(1, 0), INOUT);
  const flipped = t >= W(1, 9);
  const flip = pop(t, W(1, 9), 10);
  // clock hand: fast spin, decelerating to one tick per second; snaps on "tick"
  const tickAt = W(1, 7);
  const ang = t < tickAt ? lerp(0, 1, 1 - Math.pow(1 - ramp(t, a, tickAt - a, (x) => x), 2)) * 1440 : 1440 + 6 * Math.floor((t - tickAt) + 1);
  const tickBounce = pop(t, tickAt, 9);
  const rate = lerp(8, 0.9, slow);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: lerp(375, 140, chipK), top: lerp(560, 450, chipK) }}>
        <Chip size={lerp(330, 220, chipK)} tickRate={rate} />
      </div>
      <div style={{ position: "absolute", left: 430, top: 470, width: 560 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim, opacity: chipK }}>one clock tick</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 78, color: flipped ? C.green : C.white, scale: `${flipped ? lerp(0.6, 1, flip) : 1}`, transformOrigin: "left center", opacity: chipK }}>
          {flipped ? "= 1 second" : "= 0.3 ns"}
        </div>
      </div>
      {/* the slowed clock */}
      <Center y={800}>
        <div style={{ position: "relative", width: 440, height: 440, opacity: pop(t, a + 0.1, 13), scale: `${1 + tickBounce * 0.03 * (1 - ramp(t, tickAt + 0.3, 0.3))}` }}>
          <svg width={440} height={440} viewBox="0 0 200 200" style={{ overflow: "visible", filter: `drop-shadow(0 0 16px ${flipped ? C.green : "rgba(245,241,232,.4)"})` }}>
            <circle cx={100} cy={100} r={92} fill="rgba(10,18,38,.9)" stroke={flipped ? C.green : C.white} strokeWidth={6} />
            {[...Array(60)].map((_, i) => (
              <rect key={i} x={99} y={12} width={i % 5 ? 2 : 4} height={i % 5 ? 7 : 13} fill={C.white} opacity={i % 5 ? 0.4 : 0.9} style={{ transformOrigin: "100px 100px", rotate: `${i * 6}deg` }} />
            ))}
            <rect x={97} y={22} width={6} height={86} rx={3} fill={C.orange} style={{ transformOrigin: "100px 100px", rotate: `${ang}deg` }} />
            <circle cx={100} cy={100} r={9} fill={C.orange} />
          </svg>
        </div>
      </Center>
      <div style={{ position: "absolute", left: 90, top: 1290, right: 90, height: 14, borderRadius: 7, background: "rgba(245,241,232,.12)" }}>
        <div style={{ width: `${(1 - slow) * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${C.green}, ${C.orange})` }} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 1240, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.dim }}>speed: {slow < 0.98 ? `${(3.3 * (1 - slow) + 0.000000001).toFixed(1)} GHz` : "1 Hz"}</div>
    </Scene>
  );
};

/** Ladder: rows appear one by one, a packet runs up the bus, a stopwatch rolls and lands on the scaled time */
const Ladder: React.FC<{ a: number; b: number; showReadout?: boolean; rowsK?: number }> = ({ a, b }) => {
  const t = useT();
  // active row: last row whose line has started
  let act = -1;
  ROWS.forEach((r, i) => { if (t >= LS(r.line) - 0.1) act = i; });
  const r = act >= 0 ? ROWS[act] : null;
  const st = r ? LS(r.line) : 0;
  const land = r ? W(r.land[0], r.land[1]) : 0;
  const prog = r ? ramp(t, st + 0.15, land - st - 0.15, (x) => x) : 0;
  const landed = r ? t >= land : false;
  const landK = r ? pop(t, land, 10) : 0;
  const sh = r && act >= 2 ? shake(t, land, act === 4 ? 22 : 12, 0.5) : 0;
  const shown = r ? Math.pow(prog, 3) * r.secs : 0;
  return (
    <Scene a={a} b={b}>
      {/* CPU + readout */}
      <div style={{ position: "absolute", left: 60, top: 450, translate: `${sh}px 0px` }}>
        <Chip size={180} tickRate={0.9} wait={r && !landed ? 1 : 0.0001} />
      </div>
      <div style={{ position: "absolute", left: 320, top: 455, width: 700 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.dim }}>waiting for data (1 tick = 1 s)</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: landed ? 92 : 78, color: landed && r ? r.c : C.white, scale: `${landed ? lerp(0.7, 1, landK) : 1}`, transformOrigin: "left center", whiteSpace: "nowrap", textShadow: landed && r ? `0 0 40px ${r.c}88` : undefined }}>
          {r ? (landed ? r.scaled : fmtClock(shown)) : "00:00:00"}
        </div>
      </div>
      {/* bus */}
      <div style={{ position: "absolute", left: BUS_X - 4, top: 640, width: 8, height: ROW_Y(4) + 52 - 640, borderRadius: 4, background: "rgba(74,222,128,.25)" }} />
      {ROWS.map((row, i) => {
        const k = pop(t, LS(row.line) - 0.05, 13);
        if (k <= 0.001) return null;
        const y = ROW_Y(i);
        const isAct = i === act;
        const barK = ramp(t, LS(row.line), 0.6);
        const done = t >= W(row.land[0], row.land[1]);
        const platter = row.name === "Hard drive";
        return (
          <div key={row.name} style={{ position: "absolute", left: 0, top: y, width: 1080, height: 104, opacity: Math.min(1, k * 1.5) * (isAct ? 1 : 0.6), translate: `${(1 - k) * 80}px 0px` }}>
            <div style={{ position: "absolute", left: BUS_X, top: 50, width: 50, height: 5, background: row.c, opacity: 0.6 }} />
            <div style={{ position: "absolute", left: 200, right: 60, top: 0, height: 104, borderRadius: 24, background: "rgba(13,22,48,.95)", border: `3px solid ${isAct ? row.c : C.line}`, boxShadow: isAct ? `0 0 40px ${row.c}33` : undefined }}>
              <div style={{ position: "absolute", left: 26, top: 12, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white, display: "flex", alignItems: "center", gap: 14 }}>
                {platter && (
                  <svg width={40} height={40} viewBox="0 0 40 40" style={{ rotate: `${t * 720}deg` }}>
                    <circle cx={20} cy={20} r={17} fill="none" stroke={row.c} strokeWidth={4} /><circle cx={20} cy={20} r={4} fill={row.c} /><rect x={19} y={3} width={2} height={12} fill={row.c} />
                  </svg>
                )}
                {row.name}
              </div>
              <div style={{ position: "absolute", left: 26, top: 60, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.dim }}>real: {row.real}</div>
              {/* distance bar */}
              <div style={{ position: "absolute", left: 350, top: 44, width: 170 * row.bar * barK, height: 16, borderRadius: 8, background: row.c, opacity: 0.8 }} />
              <div style={{ position: "absolute", right: 24, top: 0, height: 104, display: "flex", alignItems: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: row.c, opacity: done ? 1 : 0.25 }}>{done ? row.scaled : "…"}</div>
            </div>
          </div>
        );
      })}
      {/* packet running up the bus */}
      {r && !landed && prog > 0 && (
        <div style={{ position: "absolute", left: BUS_X - 18, top: lerp(ROW_Y(act) + 34, 610, prog), width: 36, height: 36, borderRadius: 10, background: r.c, boxShadow: `0 0 30px ${r.c}`, rotate: `${t * 200}deg` }} />
      )}
    </Scene>
  );
};

const Die: React.FC = () => {
  const t = useT();
  const a = LS(7), b = LS(8);
  const zoom = ramp(t, a - 0.15, 0.7, INOUT);
  const lit = (i: number) => pop(t, W(7, 6) - 0.1 + i * 0.07, 12);
  const blocks = [
    { x: 0, y: 0, w: 2, h: 1, l: "L3 cache" }, { x: 2, y: 0, w: 2, h: 1, l: "L3 cache" },
    { x: 0, y: 1, w: 1, h: 1, l: "core", core: true }, { x: 1, y: 1, w: 1, h: 1, l: "L2" }, { x: 2, y: 1, w: 1, h: 1, l: "core", core: true }, { x: 3, y: 1, w: 1, h: 1, l: "L2" },
    { x: 0, y: 2, w: 1, h: 1, l: "core", core: true }, { x: 1, y: 2, w: 1, h: 1, l: "L2" }, { x: 2, y: 2, w: 1, h: 1, l: "core", core: true }, { x: 3, y: 2, w: 1, h: 1, l: "L2" },
  ];
  const S = 190, X0 = 540 - 2 * S, Y0 = 560;
  let ci = 0;
  return (
    <Scene a={a} b={b}>
      <Center y={455} style={{ opacity: ramp(t, a, 0.4) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.white }}>inside the chip</div>
      </Center>
      <div style={{ position: "absolute", left: X0 - 20, top: Y0 - 20, width: 4 * S + 40, height: 3 * S + 40, borderRadius: 40, border: `5px solid ${C.green}`, background: "#0C1832", scale: `${lerp(0.35, 1, zoom)}`, opacity: Math.min(1, zoom * 2), boxShadow: "0 0 80px rgba(74,222,128,.25)" }} />
      {blocks.map((bk, i) => {
        const k = bk.core ? 1 : lit(ci++);
        return (
          <div key={i} style={{ position: "absolute", left: X0 + bk.x * S + 8, top: Y0 + bk.y * S + 8, width: bk.w * S - 16, height: bk.h * S - 16, borderRadius: 18, opacity: zoom, scale: `${lerp(0.35, 1, zoom)}`,
            background: bk.core ? "rgba(245,241,232,.08)" : `rgba(74,222,128,${0.08 + 0.4 * k})`, border: `3px solid ${bk.core ? "rgba(245,241,232,.3)" : C.green}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: bk.w > 1 ? 44 : 34, color: bk.core ? C.dim : k > 0.5 ? C.navy : C.green,
            boxShadow: k > 0.3 && !bk.core ? `0 0 ${40 * k}px rgba(74,222,128,.6)` : undefined }}>{bk.l}</div>
        );
      })}
      <Center y={1215} style={{ opacity: pop(t, W(7, 6) + 0.3, 12) }}>
        <Pill text="caches all over the chip" color={C.green} size={42} />
      </Center>
    </Scene>
  );
};

const Close: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(9);
  const moveAt = W(8, 7);
  const mv = ramp(t, moveAt, W(8, 9) - moveAt, INOUT);
  const near = t >= W(8, 9);
  const nk = pop(t, W(8, 9), 10);
  const fast = pop(t, W(8, 2), 12);
  const yFar = 1100, yNear = 760;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: 60, top: 450 }}><Chip size={180} tickRate={near ? 3 : 0.9} wait={near ? 0.0001 : 1} /></div>
      <div style={{ position: "absolute", left: 320, top: 455, width: 700 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.dim }}>wait for this data</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 92, color: near ? C.green : C.orange, scale: `${near ? lerp(0.7, 1, nk) : 1}`, transformOrigin: "left center" }}>{near ? "≈ 3 s" : "6 min"}</div>
      </div>
      {/* near shelf and far shelf */}
      {[{ y: yNear, l: "L1 cache: close", c: C.green }, { y: yFar, l: "RAM: far", c: C.orange }].map((s) => (
        <div key={s.l} style={{ position: "absolute", left: 200, right: 60, top: s.y, height: 150, borderRadius: 26, border: `3px dashed ${s.c}`, background: "rgba(13,22,48,.8)" }}>
          <div style={{ position: "absolute", left: 26, top: 14, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: s.c }}>{s.l}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: BUS_X - 4, top: 640, width: 8, height: yFar + 75 - 640, borderRadius: 4, background: "rgba(74,222,128,.25)" }} />
      {/* data block */}
      <div style={{ position: "absolute", left: lerp(560, 560, mv), top: lerp(yFar + 62, yNear + 62, mv) + Math.sin(mv * Math.PI) * -40, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.navy, background: near ? C.green : C.orange, padding: "6px 24px", borderRadius: 14, boxShadow: `0 0 40px ${near ? C.green : C.orange}` }}>your data</div>
      <div style={{ position: "absolute", left: 40, top: 1300, right: 40, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.white, opacity: fast }}>fast code = <span style={{ color: C.green }}>keep data close</span></div>
    </Scene>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const a = LS(9);
  const fol = pop(t, W(9, 0), 10);
  const clickAt = W(9, 0) + 0.4;
  const press = t > clickAt - 0.05 && t < clickAt + 0.1 ? 1 : 0;
  const followed = t > clickAt;
  const tm = ramp(t, W(9, 1), 0.3);
  const barK = pop(t, W(9, 3), 13);
  const pct = Math.min(99, Math.floor(99 * (1 - Math.pow(1 - ramp(t, W(9, 3), W(9, 5) - W(9, 3) + 0.2, (x) => x), 3))));
  const stuck = pct >= 99;
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Center y={450} style={{ opacity: ramp(t, a, 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.white }}>Fast code keeps data <span style={{ color: C.green }}>close</span></div>
      </Center>
      <Center y={590} style={{ opacity: fol, scale: `${lerp(0.5, 1, fol) * (1 - press * 0.06)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, color: followed ? C.green : C.navy, background: followed ? "rgba(74,222,128,.12)" : C.green, border: `5px solid ${C.green}`, padding: "18px 70px", borderRadius: 999, boxShadow: "0 0 70px rgba(74,222,128,.45)" }}>{followed ? "Following ✓" : "Follow"}</div>
      </Center>
      <Cursor x={lerp(820, 640, ramp(t, a, 0.4, INOUT))} y={lerp(820, 650, ramp(t, a, 0.4, INOUT))} down={press} opacity={ramp(t, a, 0.2) * (1 - ramp(t, W(9, 1) + 0.2, 0.3))} />
      <Center y={820} style={{ opacity: tm }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>Tomorrow:</div>
      </Center>
      <div style={{ position: "absolute", left: 120, right: 120, top: 940, opacity: barK, scale: `${lerp(0.6, 1, barK)}` }}>
        <div style={{ height: 70, borderRadius: 35, border: `4px solid ${stuck ? C.orange : C.green}`, background: "rgba(10,18,38,.9)", padding: 8, rotate: `${stuck ? shake(t, W(9, 5), 2, 0.5) : 0}deg` }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 28, background: stuck ? C.orange : C.green }} />
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontFamily: MONO, fontWeight: 800, fontSize: 84, color: stuck ? C.orange : C.white }}>{pct}%</div>
      </div>
      <Center y={1210} style={{ opacity: ramp(t, W(9, 2), 0.3) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.orange }}>why loading bars lie</div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const rowCues: [number, string, number][] = ROWS.flatMap((r, i) => {
  const st = LS(r.line), land = W(r.land[0], r.land[1]);
  const n = Math.max(2, Math.floor((land - st) / 0.16));
  return [
    [st - 0.05, "pop", 0.6] as [number, string, number],
    [st + 0.15, "zap", 0.35] as [number, string, number],
    ...[...Array(n)].map((_, k) => [st + 0.2 + k * 0.16, "tick", 0.45] as [number, string, number]),
    [land, i >= 2 ? "impact" : "chime", i === 4 ? 1 : i >= 2 ? 0.7 : 0.6] as [number, string, number],
  ];
});
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.15, "riser", 0.3],
  ...[...Array(6)].map((_, i) => [0.3 + i * 0.4, "tick", 0.45] as [number, string, number]),
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 0), "rewind", 0.4], [W(1, 7), "tick", 1], [W(1, 9), "pop", 0.8],
  [LS(2) - 0.15, "whoosh", 0.5],
  ...rowCues,
  [LS(7) - 0.15, "whoosh", 0.6], [W(7, 6) - 0.1, "riser", 0.35], [W(7, 6), "pop", 0.7], [W(7, 6) + 0.3, "chime", 0.5],
  [LS(8) - 0.15, "whoosh", 0.5], [W(8, 2), "pop", 0.6], [W(8, 7), "zap", 0.5], [W(8, 9), "chime", 0.9],
  [LS(9) - 0.15, "whoosh", 0.5], [W(9, 0) + 0.4, "click", 0.9], [W(9, 0) + 0.45, "chime", 0.6], [W(9, 3), "pop", 0.6], [W(9, 5) + 0.15, "error", 0.35],
];

export const CpuSecond: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Background retro={0} />
      <Hook />
      <SlowDown />
      <Ladder a={LS(2)} b={LS(7)} />
      <Die />
      <Close />
      <EndCard />
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
