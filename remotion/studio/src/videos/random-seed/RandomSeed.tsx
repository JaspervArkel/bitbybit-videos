/*
 * STORYBOARD — "Random numbers are a formula" (extra video, 21 Nov; pillars A + C; exactly 20.0 s; ending: implication + payoff demo)
 * Real numbers (data.json, computed in Python): LCG x = (1103515245·x + 12345) mod 2^31, seed 42.
 * First state 1250496027; die = (x >> 16) mod 6 + 1 → 2 6 6 4 | 3 2 4 5 …  World: seed 1337, 9×7 tiles, tile = (x >> 16) mod 10.
 * L0 "These two computers rolled the exact same numbers."  HOOK (frame 0 complete): headline "Two computers, “random” dice" /
 *     "SAME ROLLS" (orange mono) + two monitors, each with a die; first roll (2) already landed, dice keep rolling in sync:
 *     6, 6, 4. History chips fill identically under both. "=" between them flashes orange on "exact".
 * L1 "Not luck: most computer randomness is a formula."    one big die tumbling; "luck ✗" stamp on "luck";
 *     on "formula" the die collapses into a green f(x) box.
 * L2 "Start with a seed, scramble it, get the next number." chain top→bottom: "seed 42" drops on "seed"; f(x) machine shakes
 *     on "scramble"; real state 1250496027 slides out on "get"; die "2" pops on "number"; feedback arrow loops back.
 * L3 "Same seed, same sequence. Every time."               3 runs of seed 42: rows 1+2 fill in sync; row 3 fills on "Every";
 *     green ✓ on each row on "time".
 * L4 "That's how one game seed builds the same world."     "seed 1337" pill; two tile worlds build in the same diagonal wave
 *     from "builds"; both glow green + "identical ✓" on "same world".
 * L5 "Know the seed, and you can predict every roll."      terminal "predict.py": "seed = 42" on "seed", "next: 3 2 4 5" on
 *     "predict". TAIL (silent, SFX only): die rolls 3, 2, 4, 5 — each lands on the predicted slot ✓; then takeaway
 *     "“Random” = seed + formula". Ends at exactly 600 frames.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";
import data from "./data.json";

const T = makeTiming(words as Line[], 3.65);
const { W, LS } = T;
export const RANDOM_SEED_FRAMES = 600; // exactly 20.0 s
const END = RANDOM_SEED_FRAMES / FPS;
const A = (p: string) => staticFile(`videos/random-seed/${p}`);
const DICE: number[] = data.dice;
const TILES: number[] = data.tiles;

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

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
const Die: React.FC<{ v: number; size?: number; rot?: number; glow?: string; scale?: number }> = ({ v, size = 200, rot = 0, glow, scale = 1 }) => {
  const r = size * 0.09;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.2, background: "linear-gradient(145deg,#FFFDF7,#E4DDCD)", position: "relative", rotate: `${rot}deg`, scale: `${scale}`, boxShadow: glow ? `0 0 ${size * 0.3}px ${glow}, 0 ${size * 0.06}px 0 #B9B09C` : `0 ${size * 0.06}px 0 #B9B09C, 0 10px 30px rgba(0,0,0,.4)` }}>
      {PIPS[v].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: r, background: C.navy, left: size * (0.25 + x * 0.25) - r, top: size * (0.25 + y * 0.25) - r }} />
      ))}
    </div>
  );
};

/** dice that tumble for ROLL s before each landing time, then rest on the landed value */
const ROLL = 0.42;
const useRoll = (lands: number[], values: number[], first?: number) => {
  const t = useT();
  const f = useCurrentFrame();
  let idx = -1;
  lands.forEach((L, i) => { if (t >= L) idx = i; });
  const next = idx + 1;
  const rolling = next < lands.length && t >= lands[next] - ROLL;
  const face = rolling ? ((f * 5 + 3) % 6) + 1 : idx >= 0 ? values[idx] : first ?? values[0];
  const land = idx >= 0 ? pop(t, lands[idx], 9, 260) : 1;
  const rot = rolling ? Math.sin(f * 1.7) * 18 : (1 - land) * 14;
  const scale = rolling ? 0.92 + Math.abs(Math.sin(f * 0.9)) * 0.08 : lerp(1.18, 1, land);
  return { face, rolling, rot, scale, count: idx + 1 };
};

const Monitor2: React.FC<{ w: number; h: number; label: string; glow?: string; children: React.ReactNode }> = ({ w, h, label, glow, children }) => (
  <div style={{ width: w, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: w, height: h, borderRadius: 30, border: `6px solid ${glow ?? "rgba(245,241,232,.35)"}`, background: "linear-gradient(180deg,#1B2D5C,#0E1A3A)", boxShadow: glow ? `0 0 50px ${glow}66` : "0 20px 50px rgba(0,0,0,.4)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 18, top: 14, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim }}>{label}</div>
      {children}
    </div>
    <div style={{ width: 70, height: 36, background: "rgba(245,241,232,.25)" }} />
    <div style={{ width: 180, height: 12, borderRadius: 6, background: "rgba(245,241,232,.3)" }} />
  </div>
);
const MiniDie: React.FC<{ v: number; k: number; size?: number; glow?: string }> = ({ v, k, size = 64, glow }) => (
  <div style={{ opacity: Math.min(1, k * 1.5), scale: `${lerp(0.3, 1, k)}` }}><Die v={v} size={size} glow={glow} /></div>
);

// ---------- scenes ----------
const HOOK_LANDS = [0.62, 1.3, 1.98];
const Hook: React.FC = () => {
  const t = useT();
  const r = useRoll(HOOK_LANDS, DICE.slice(1, 4), DICE[0]);
  const eq = pop(t, W(0, 5), 9, 220);
  const hot = t > W(0, 5);
  return (
    <Scene a={0} b={LS(1)} enter={false}>
      <div style={{ position: "absolute", top: 175, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.white }}>Two computers, “random” dice</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 138, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 5), 10, 0.4)}px 0px` }}>SAME ROLLS</div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 50, right: 50, display: "flex", justifyContent: "space-between" }}>
        {["PC 1", "PC 2"].map((l) => (
          <Monitor2 key={l} w={440} h={380} label={l} glow={hot ? C.orange : undefined}>
            <Die v={r.face} size={190} rot={r.rot} scale={r.scale} />
          </Monitor2>
        ))}
      </div>
      <Center y={690} style={{ opacity: 0.6 + 0.4 * eq }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: hot ? C.orange : C.dim, scale: `${lerp(1, 1.25, eq) - (hot ? Math.abs(Math.sin((t - W(0, 5)) * 6)) * 0.08 : 0)}`, textShadow: hot ? "0 0 40px rgba(251,146,60,.8)" : undefined }}>=</div>
      </Center>
      {/* history chips under both monitors */}
      <div style={{ position: "absolute", top: 1060, left: 50, right: 50, display: "flex", justifyContent: "space-between" }}>
        {[0, 1].map((m) => (
          <div key={m} style={{ width: 440, display: "flex", justifyContent: "center", gap: 18 }}>
            {DICE.slice(0, 4).map((v, i) => {
              const k = i === 0 ? 1 : pop(t, HOOK_LANDS[i - 1], 12);
              return <MiniDie key={i} v={v} k={k} size={84} glow={hot ? "rgba(251,146,60,.7)" : undefined} />;
            })}
          </div>
        ))}
      </div>
    </Scene>
  );
};

const Luck: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const a = LS(1), b = LS(2);
  const k = pop(t, a - 0.1, 12);
  const fx = pop(t, W(1, 7), 9, 200);
  const luck = pop(t, W(1, 1), 9, 220) * (1 - ramp(t, W(1, 7) - 0.15, 0.2));
  const lbl = ramp(t, W(1, 3), 0.3);
  const dieK = 1 - ramp(t, W(1, 7) - 0.12, 0.15);
  return (
    <Scene a={a} b={b}>
      <Center y={470} style={{ opacity: lbl, translate: `0px ${(1 - lbl) * 20}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.white }}>computer <span style={{ color: C.orange }}>“randomness”</span></div>
      </Center>
      <Center y={640} style={{ height: 460 }}>
        {dieK > 0.01 && (
          <div style={{ opacity: Math.min(k, dieK), scale: `${lerp(0.5, 1, k) * dieK}` }}>
            <Die v={((f * 5 + 3) % 6) + 1} size={300} rot={Math.sin(f * 0.8) * 25 + f * 4} />
          </div>
        )}
        {fx > 0.01 && (
          <div style={{ position: "absolute", opacity: Math.min(1, fx * 1.6), scale: `${lerp(0.3, 1, fx)}`, fontFamily: MONO, fontWeight: 800, fontSize: 170, color: C.green, border: `8px solid ${C.green}`, borderRadius: 40, padding: "30px 70px", background: "rgba(10,18,38,.94)", boxShadow: "0 0 90px rgba(74,222,128,.45)" }}>f(x)</div>
        )}
      </Center>
      {luck > 0.01 && <div style={{ position: "absolute", right: 120, top: 640 }}><Stamp text="luck ✗" k={luck} size={72} rot={8} /></div>}
    </Scene>
  );
};

const Arrow: React.FC<{ y: number; k: number }> = ({ y, k }) => (
  <Center y={y} style={{ opacity: k }}>
    <svg width={60} height={80} viewBox="0 0 60 80"><path d={`M30 4 V${4 + 60 * k}`} stroke={C.green} strokeWidth={8} strokeLinecap="round" /><path d="M10 52 L30 74 L50 52" fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.9 ? 1 : 0} /></svg>
  </Center>
);
const Machine: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(3);
  const seed = pop(t, W(2, 3), 10);
  const mach = pop(t, a - 0.05, 12);
  const scr = t >= W(2, 4) && t < W(2, 6) + 0.1;
  const out = pop(t, W(2, 6), 11);
  const die = pop(t, W(2, 9), 9, 220);
  const loop = ramp(t, W(2, 9) + 0.25, 0.35, INOUT);
  const digits = String(data.states[0]);
  const f = useCurrentFrame();
  return (
    <Scene a={a} b={b}>
      <Center y={455} style={{ opacity: Math.min(1, seed * 1.5), translate: `0px ${(1 - seed) * -80}px` }}>
        <Pill text={<span>seed <span style={{ color: C.green }}>42</span></span>} size={64} />
      </Center>
      <Arrow y={565} k={ramp(t, W(2, 3) + 0.1, 0.25)} />
      <Center y={650} style={{ opacity: Math.min(1, mach * 1.5), scale: `${lerp(0.6, 1, mach)}`, translate: `${scr ? shake(t, W(2, 4), 14, 0.5) : 0}px 0px` }}>
        <div style={{ width: 560, height: 190, borderRadius: 34, border: `6px solid ${C.green}`, background: "rgba(10,18,38,.95)", boxShadow: `0 0 ${scr ? 90 : 40}px rgba(74,222,128,${scr ? 0.6 : 0.3})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <svg width={90} height={90} viewBox="-50 -50 100 100" style={{ rotate: `${t * (scr ? 720 : 60)}deg` }}>
            {[...Array(8)].map((_, i) => <rect key={i} x={-9} y={-48} width={18} height={22} rx={4} fill={C.green} transform={`rotate(${i * 45})`} />)}
            <circle r={30} fill={C.green} /><circle r={12} fill={C.navy} />
          </svg>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.green }}>f(x)</div>
        </div>
      </Center>
      {scr && <div style={{ position: "absolute", left: 600, top: 872, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.orange }}>scrambling…</div>}
      <Arrow y={860} k={ramp(t, W(2, 6) - 0.1, 0.2)} />
      <Center y={945} style={{ opacity: Math.min(1, out * 1.5), translate: `0px ${(1 - out) * -60}px` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 82, color: C.white, background: "rgba(10,18,38,.92)", border: "4px solid rgba(245,241,232,.35)", borderRadius: 24, padding: "10px 34px" }}>
          {out < 1 && t < W(2, 6) + 0.35 ? digits.split("").map((d, i) => ((Number(d) + f + i) % 10)).join("") : digits}
        </div>
      </Center>
      <Center y={1095} style={{ gap: 30 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.dim, opacity: die }}>die =</div>
        <div style={{ opacity: Math.min(1, die * 1.5), scale: `${lerp(0.3, 1, die)}` }}><Die v={DICE[0]} size={150} glow="rgba(74,222,128,.6)" /></div>
      </Center>
      {/* feedback loop: the output becomes the next input */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: loop }}>
        <path d="M 900 990 C 1010 990, 1010 745, 830 745" fill="none" stroke={C.orange} strokeWidth={7} strokeDasharray="18 14" pathLength={1} strokeLinecap="round" style={{ strokeDasharray: 1, strokeDashoffset: 1 - loop, filter: "drop-shadow(0 0 8px #FB923C)" } as React.CSSProperties} />
        <text x={985} y={880} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={34} fill={C.orange} transform="rotate(90 985 880)">next</text>
      </svg>
    </Scene>
  );
};

const Runs: React.FC = () => {
  const t = useT();
  const a = LS(3), b = LS(4);
  const s0 = W(3, 0), s1 = W(3, 3) + 0.3;
  const e0 = W(3, 4), e1 = W(3, 5);
  const rowT = (row: number, i: number) => (row < 2 ? s0 + (i / 7) * (s1 - s0) : e0 + (i / 7) * (e1 - e0));
  const ok = pop(t, W(3, 5), 10);
  return (
    <Scene a={a} b={b}>
      {[0, 1, 2].map((row) => {
        const rk = row < 2 ? pop(t, a - 0.05 + row * 0.08, 12) : pop(t, e0 - 0.15, 12);
        return (
          <div key={row} style={{ position: "absolute", left: 40, right: 40, top: 520 + row * 230, height: 190, borderRadius: 30, background: "rgba(10,18,38,.9)", border: `4px solid ${ok > 0.5 ? C.green : "rgba(245,241,232,.25)"}`, boxShadow: ok > 0.5 ? "0 0 40px rgba(74,222,128,.3)" : undefined, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", opacity: Math.min(1, rk * 1.5), translate: `${(1 - rk) * -80}px 0px` }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim, width: 110, lineHeight: 1.15 }}>run {row + 1}<br /><span style={{ color: C.green }}>seed 42</span></div>
            {DICE.slice(0, 8).map((v, i) => <MiniDie key={i} v={v} k={pop(t, rowT(row, i), 13, 260)} size={88} />)}
            <div style={{ position: "absolute", right: -14, top: -26, opacity: ok, scale: `${lerp(0.3, 1, ok)}`, fontFamily: MONO, fontWeight: 800, fontSize: 54, color: C.navy, background: C.green, borderRadius: 999, width: 74, height: 74, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
          </div>
        );
      })}
    </Scene>
  );
};

const TILE_COL = (v: number) => (v <= 2 ? "#2E6BD6" : v <= 6 ? "#3FBF6A" : v <= 8 ? "#1E7A45" : "#C9C3B5");
const World: React.FC<{ k: (i: number) => number; glow: number }> = ({ k, glow }) => (
  <div style={{ padding: 12, borderRadius: 26, background: "rgba(10,18,38,.95)", border: `5px solid ${glow > 0.5 ? C.green : "rgba(245,241,232,.3)"}`, boxShadow: `0 0 ${60 * glow}px rgba(74,222,128,.5)`, display: "grid", gridTemplateColumns: "repeat(9, 44px)", gap: 3 }}>
    {TILES.map((v, i) => {
      const kk = k(i);
      return (
        <div key={i} style={{ width: 44, height: 44, borderRadius: 7, background: kk > 0.01 ? TILE_COL(v) : "rgba(245,241,232,.06)", scale: `${kk > 0.01 ? lerp(0.4, 1, kk) : 1}`, position: "relative" }}>
          {kk > 0.5 && v >= 7 && v <= 8 && <div style={{ position: "absolute", left: 13, top: 8, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "24px solid #0F4F2A" }} />}
          {kk > 0.5 && v === 9 && <div style={{ position: "absolute", left: 8, top: 8, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: "26px solid #8E8879" }} />}
        </div>
      );
    })}
  </div>
);
const Worlds: React.FC = () => {
  const t = useT();
  const a = LS(4), b = LS(5);
  const w0 = W(4, 5) - 0.15, w1 = W(4, 8) + 0.1;
  const k = (i: number) => { const r = Math.floor(i / 9), c = i % 9; return pop(t, w0 + ((r + c) / 14) * (w1 - w0), 13, 280); };
  const pill = pop(t, W(4, 3), 11);
  const same = pop(t, W(4, 7), 10);
  return (
    <Scene a={a} b={b}>
      <Center y={455} style={{ opacity: Math.min(1, pill * 1.5), scale: `${lerp(0.5, 1, pill)}` }}>
        <Pill text={<span>game seed <span style={{ color: C.green }}>1337</span></span>} size={60} />
      </Center>
      <div style={{ position: "absolute", top: 610, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {["PC 1", "PC 2"].map((l) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.dim }}>{l}</div>
            <World k={k} glow={same} />
          </div>
        ))}
      </div>
      <Center y={1075} style={{ opacity: same, scale: `${lerp(0.4, 1, same)}` }}>
        <Pill text="identical world ✓" color={C.green} size={54} />
      </Center>
    </Scene>
  );
};

const PRED = DICE.slice(4, 8); // 3 2 4 5 — the next rolls after the hook's 2 6 6 4
const TAIL_LANDS = [16.55, 17.1, 17.65, 18.2];
const Predict: React.FC = () => {
  const t = useT();
  const a = LS(5);
  const term = pop(t, a - 0.05, 12);
  const seedK = ramp(t, W(5, 2), 0.25);
  const predK = (i: number) => pop(t, W(5, 6) + i * 0.2, 12);
  const r = useRoll(TAIL_LANDS, PRED, DICE[3]);
  const dieK = pop(t, W(5, 8) - 0.2, 12);
  const hits = (i: number) => pop(t, TAIL_LANDS[i], 10, 220);
  const all = pop(t, TAIL_LANDS[3] + 0.3, 10, 220);
  const take = ramp(t, 18.65, 0.4);
  const typed = (s: string, k: number) => s.slice(0, Math.round(s.length * k));
  return (
    <Scene a={a} b={END + 1} exit={false}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 440, height: 300, borderRadius: 28, background: "#060B18", border: "4px solid rgba(245,241,232,.3)", opacity: Math.min(1, term * 1.5), scale: `${lerp(0.7, 1, term)}`, overflow: "hidden" }}>
        <div style={{ height: 52, background: "rgba(245,241,232,.08)", display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
          {[C.orange, "#FBBF24", C.green].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim, marginLeft: 12 }}>predict.py</div>
        </div>
        <div style={{ padding: "26px 34px", fontFamily: MONO, fontWeight: 800, fontSize: 52, lineHeight: 1.5, color: C.white }}>
          <div>&gt; seed = <span style={{ color: C.green }}>{typed("42", seedK)}</span></div>
          <div style={{ display: "flex", gap: 26, opacity: predK(0) > 0.01 ? 1 : 0 }}>&gt; next:
            {PRED.map((v, i) => <span key={i} style={{ color: C.orange, opacity: Math.min(1, predK(i) * 1.5), display: "inline-block", scale: `${lerp(0.3, 1, predK(i))}` }}>{v}</span>)}
          </div>
        </div>
      </div>
      <Center y={800} style={{ opacity: Math.min(1, dieK * 1.5), scale: `${lerp(0.4, 1, dieK)}` }}>
        <Die v={r.face} size={230} rot={r.rot} scale={r.scale} glow={r.count > 0 && !r.rolling ? "rgba(74,222,128,.7)" : undefined} />
      </Center>
      <Center y={1100} style={{ gap: 26, opacity: Math.min(1, dieK * 1.5) }}>
        {PRED.map((v, i) => {
          const h = hits(i);
          return (
            <div key={i} style={{ width: 130, height: 130, borderRadius: 24, border: `5px ${h > 0.01 ? "solid" : "dashed"} ${h > 0.01 ? C.green : "rgba(245,241,232,.3)"}`, background: "rgba(10,18,38,.9)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: h > 0.01 ? "0 0 40px rgba(74,222,128,.45)" : undefined }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 76, color: h > 0.01 ? C.green : "rgba(251,146,60,.55)" }}>{v}</div>
              {h > 0.01 && <div style={{ position: "absolute", right: -16, top: -18, scale: `${lerp(0.3, 1, h)}`, width: 50, height: 50, borderRadius: 25, background: C.green, color: C.navy, fontFamily: MONO, fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
            </div>
          );
        })}
      </Center>
      {all > 0.01 && <div style={{ position: "absolute", right: 70, top: 760 }}><Stamp text="4/4 predicted" k={all} color={C.green} size={50} rot={7} /></div>}
      <Center y={1430} style={{ opacity: take, translate: `0px ${(1 - take) * 24}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.white, textAlign: "center", lineHeight: 1.15 }}>“Random” =<br /><span style={{ color: C.green, fontFamily: MONO }}>seed + formula</span></div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
type Cue = [number, string, number];
const rattle = (land: number): Cue[] => [0, 1, 2, 3].map((i) => [land - ROLL + i * 0.1, "tick", 0.35] as Cue);
const SFX: Cue[] = [
  [0, "impact", 0.5],
  ...HOOK_LANDS.flatMap((L) => [...rattle(L), [L, "pop", 0.6] as Cue]),
  [W(0, 5), "error", 0.5],
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 1), "stamp", 0.8], [W(1, 7), "zap", 0.6], [W(1, 7) + 0.03, "impact", 0.4],
  [LS(2) - 0.15, "whoosh", 0.6], [W(2, 3), "pop", 0.6], [W(2, 4), "vortex", 0.4], [W(2, 6), "printer", 0.35], [W(2, 9), "pop", 0.7], [W(2, 9) + 0.3, "rewind", 0.3],
  [LS(3) - 0.15, "whoosh", 0.6], ...[...Array(8)].map((_, i) => [W(3, 0) + (i / 7) * (W(3, 3) + 0.3 - W(3, 0)), "key", 0.35] as Cue),
  ...[...Array(4)].map((_, i) => [W(3, 4) + i * 0.13, "key", 0.35] as Cue), [W(3, 5), "chime", 0.6],
  [LS(4) - 0.15, "whoosh", 0.6], [W(4, 3), "pop", 0.6], ...[...Array(6)].map((_, i) => [W(4, 5) - 0.1 + i * 0.16, "tick", 0.35] as Cue), [W(4, 7), "chime", 0.7],
  [LS(5) - 0.15, "whoosh", 0.6], [W(5, 2), "key", 0.5], ...[0, 1, 2, 3].map((i) => [W(5, 6) + i * 0.2, "key", 0.5] as Cue),
  ...TAIL_LANDS.flatMap((L, i) => [...rattle(L), [L, "pop", 0.6] as Cue, [L + 0.04, i === 3 ? "chime" : "click", 0.6] as Cue]),
  [TAIL_LANDS[3] + 0.3, "stamp", 0.8], [18.6, "riser", 0.3],
];

export const RandomSeed: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Luck />
    <Machine />
    <Runs />
    <Worlds />
    <Predict />
    <Captions lines={T.LINES} skip={[0]} />
    <Bug />
    <Audio src={A("narration.wav")} />
    <Audio src={A("music.wav")} volume={(f) => interpolate(f, [0, 10, RANDOM_SEED_FRAMES - 25, RANDOM_SEED_FRAMES], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SFX.map(([s, name, vol], i) => (
      <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={Math.round(1.6 * FPS)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * 0.55} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
