/*
 * STORYBOARD — "Games let you jump on thin air" (coyote time). One world: a side-on platformer level
 * (ledge · pit with spikes · far platform), one hero cube, a JUMP key and a frame strip.
 *  L0  "You just jumped off thin air."        Frame 0: headline + hero already mid-air past the dashed edge line,
 *                                              ghost trail along the ledge, jump puff under its feet in the air. Hero arcs over the pit and lands.
 *  L1  "Look again. … already left the ledge"  ◀◀ REPLAY · slow-mo tag. Hero runs back on the ledge, crosses the edge on "left"; edge line flashes orange, gap bracket.
 *  L2  "when you pressed jump."                JUMP key presses on "pressed"; hero is hovering over the pit.
 *  L3  "The game let it happen on purpose."    Hero jumps from the air, lands; "allowed ✓" chip on "on purpose".
 *  L4  "It's called coyote time."              COYOTE TIME chip pops on "coyote"; hero hops.
 *  L5  "Players often press jump a split second" Frame strip appears; cells light as time passes; hero runs, crosses edge on "split" (edge flag).
 *  L6  "after the edge is gone,"               JUMP pressed on "after" (press flag); ledge edge dims on "gone".
 *  L7  "and a strict game would drop them into the pit." STRICT GAME tag on "strict", key shows ✗, hero falls on "drop", hits spikes on "pit" (shake).
 *  L8  "So games like Celeste keep the jump open"  Reset. "e.g. Celeste" pill; green grace zone grows past the edge on "open".
 *  L9  "for a few extra frames after the edge."    Cells after the edge turn green on "a/few/extra"; hero runs into the zone, presses on "after", jumps, lands ✓.
 *  L10 "Many hard games feel fair"            Camera pulls out to a level of four platforms; hero hops every pit, taking off past each edge. "feels fair ✓" chip.
 *  L11 "because they quietly forgive you."    (implication ending) hidden grace zones at every edge glow on "quietly"; takeaway "Late jump? Still counts." on "forgive". Slow push-in to the end.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, IN, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.6);
const { W, LS } = T;
export const COYOTE_TIME_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/coyote-time/${p}`);

// ---------- world ----------
const GROUND = 1150;
const BOTTOM = 1330;
const EDGE = 470;
const FAR = 720;
const clamp = (k: number) => Math.max(0, Math.min(1, k));
type Pos = { x: number; y: number; sq: number; run: number; rot?: number };

/** parabolic hop from (x0,y0) to (x1,y1) between t0 and t1, peak h above the line */
const arc = (t: number, t0: number, t1: number, x0: number, x1: number, y0: number, y1: number, h: number) => {
  const k = clamp((t - t0) / (t1 - t0));
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k) - 4 * h * k * (1 - k), k };
};
/** landing squash for ~0.25 s after touchdown */
const squash = (t: number, at: number) => (t < at || t > at + 0.3 ? 0 : Math.sin(((t - at) / 0.3) * Math.PI));

const Hero: React.FC<Pos & { ghost?: number; glow?: string }> = ({ x, y, sq, run, rot = 0, ghost, glow }) => {
  const t = useT();
  const s = 96;
  const bob = run > 0 ? Math.abs(Math.sin(t * 22)) * 8 * run : 0;
  const sy = 1 - sq * 0.28, sx = 1 + sq * 0.22;
  return (
    <div style={{ position: "absolute", left: x - s / 2, top: y - s - bob, width: s, height: s, opacity: ghost ?? 1, transformOrigin: "50% 100%", scale: `${sx} ${sy}`, rotate: `${rot}deg` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: ghost ? "rgba(245,241,232,.5)" : C.white, boxShadow: glow ? `0 0 50px ${glow}` : "0 12px 30px rgba(0,0,0,.45)" }} />
      {!ghost && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 18, height: 14, background: C.green }} />
          <div style={{ position: "absolute", left: -26, top: 18 + Math.sin(t * 14) * 3, width: 30, height: 10, borderRadius: 5, background: C.green, rotate: "-12deg" }} />
          <div style={{ position: "absolute", left: 50, top: 44, width: 13, height: 22, borderRadius: 7, background: C.navy }} />
          <div style={{ position: "absolute", left: 72, top: 44, width: 13, height: 22, borderRadius: 7, background: C.navy }} />
        </>
      )}
      {run > 0 && !ghost && (
        <>
          <div style={{ position: "absolute", left: 14, bottom: -12 + Math.sin(t * 22) * 6, width: 26, height: 14, borderRadius: 7, background: C.white }} />
          <div style={{ position: "absolute", left: 56, bottom: -12 - Math.sin(t * 22) * 6, width: 26, height: 14, borderRadius: 7, background: C.white }} />
        </>
      )}
    </div>
  );
};

/** jump puff: ring expanding under the feet at time at */
const Puff: React.FC<{ x: number; y: number; at: number; color?: string }> = ({ x, y, at, color = C.white }) => {
  const t = useT();
  const k = (t - at) / 0.5;
  if (k < 0 || k > 1) return null;
  const w = lerp(60, 220, k);
  return <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.12, width: w, height: w * 0.24, borderRadius: "50%", border: `6px solid ${color}`, opacity: 1 - k }} />;
};

const Platform: React.FC<{ x1: number; x2: number; dim?: number; edgeGlow?: number }> = ({ x1, x2, dim = 0, edgeGlow = 0 }) => (
  <div style={{ position: "absolute", left: x1, top: GROUND, width: x2 - x1, height: BOTTOM - GROUND + 60, borderRadius: "18px 18px 0 0", background: "linear-gradient(180deg,#1B2C55,#0E1838)", border: `3px solid ${C.line}`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, background: C.green, opacity: 1 - dim * 0.7, boxShadow: `0 0 24px ${C.green}` }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, rgba(245,241,232,.06) 2px, transparent 2px), linear-gradient(rgba(245,241,232,.06) 2px, transparent 2px)", backgroundSize: "60px 60px", top: 12 }} />
    {edgeGlow > 0 && <div style={{ position: "absolute", right: 0, top: 0, width: 50, height: "100%", background: `linear-gradient(90deg, transparent, ${C.orange})`, opacity: edgeGlow * 0.6 }} />}
  </div>
);

const Spikes: React.FC<{ x1: number; x2: number; hot?: number }> = ({ x1, x2, hot = 0 }) => {
  const n = Math.floor((x2 - x1) / 44);
  return (
    <svg style={{ position: "absolute", left: x1, top: BOTTOM - 50, overflow: "visible" }} width={x2 - x1} height={50}>
      {[...Array(n)].map((_, i) => {
        const a = (x2 - x1 - n * 44) / 2 + i * 44;
        return <path key={i} d={`M${a} 50 L${a + 22} 4 L${a + 44} 50 Z`} fill={C.orange} opacity={0.55 + hot * 0.45} style={{ filter: hot ? `drop-shadow(0 0 ${14 * hot}px ${C.orange})` : undefined }} />;
      })}
    </svg>
  );
};

const EdgeLine: React.FC<{ x: number; k: number; color?: string; label?: boolean }> = ({ x, k, color = C.white, label = true }) => (
  <div style={{ position: "absolute", left: x - 2, top: 900, height: GROUND - 900, width: 0, borderLeft: `5px dashed ${color}`, opacity: k }}>
    {label && <div style={{ position: "absolute", left: -60, top: -52, width: 120, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 32, color }}>edge</div>}
  </div>
);

/** the hidden grace window: a ghost ledge past the edge */
const Grace: React.FC<{ x: number; w: number; k: number; label?: boolean }> = ({ x, w, k, label }) => {
  const t = useT();
  if (k <= 0 || w <= 1) return null;
  const pulse = 0.75 + Math.sin(t * 6) * 0.25;
  return (
    <div style={{ position: "absolute", left: x, top: GROUND, width: w, height: 40, opacity: k }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "0 14px 14px 0", border: `4px dashed ${C.green}`, background: `rgba(74,222,128,${0.22 * pulse})`, boxShadow: `0 0 ${40 * pulse}px rgba(74,222,128,.5)` }} />
      <div style={{ position: "absolute", left: 0, width: w, top: -260, height: 260, background: `linear-gradient(0deg, rgba(74,222,128,${0.18 * pulse}), transparent)` }} />
      {label && <div style={{ position: "absolute", left: -60, top: 56, width: w + 120, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green, lineHeight: 1.15 }}>jump still<br />allowed</div>}
    </div>
  );
};

const JumpKey: React.FC<{ at: number; verdict?: "ok" | "no"; vAt?: number; k?: number }> = ({ at, verdict, vAt = 1e9, k = 1 }) => {
  const t = useT();
  const down = t > at - 0.02 && t < at + 0.18 ? 1 : 0;
  const lit = ramp(t, at, 0.08) * (1 - ramp(t, at + 0.5, 0.4));
  const v = pop(t, vAt, 10);
  const col = verdict === "no" ? C.orange : C.green;
  return (
    <div style={{ position: "absolute", left: 830, top: 780, width: 190, height: 112, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, k)}` }}>
      <div style={{ position: "absolute", inset: 0, top: 14, borderRadius: 22, background: "#08101F" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: down * 12, height: 98, borderRadius: 22, background: lit > 0 ? `rgba(74,222,128,${0.15 + lit * 0.4})` : "#1C2A50", border: `4px solid ${lit > 0 ? C.green : "rgba(245,241,232,.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.white, letterSpacing: 4, boxShadow: lit ? `0 0 ${50 * lit}px ${C.green}` : undefined }}>JUMP</div>
      {verdict && v > 0 && (
        <div style={{ position: "absolute", right: -22, top: -30, width: 72, height: 72, borderRadius: 36, background: col, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: 46, display: "flex", alignItems: "center", justifyContent: "center", scale: `${v}`, boxShadow: `0 0 40px ${col}` }}>{verdict === "no" ? "✗" : "✓"}</div>
      )}
    </div>
  );
};

const Tag: React.FC<{ k: number; text: React.ReactNode; color?: string; size?: number; y: number; x?: number }> = ({ k, text, color = C.green, size = 64, y, x }) => (
  <div style={{ position: "absolute", top: y, left: x ?? 0, right: x === undefined ? 0 : undefined, display: "flex", justifyContent: x === undefined ? "center" : "flex-start", opacity: Math.min(1, k * 1.5) }}>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.16}px ${size * 0.42}px`, borderRadius: size * 0.34, border: `4px solid ${color}`, background: "rgba(10,18,38,.88)", boxShadow: `0 0 40px ${color}55`, scale: `${lerp(0.4, 1, k)}`, whiteSpace: "nowrap", letterSpacing: 2 }}>{text}</div>
  </div>
);

/** frame strip: n cells; color(i) returns the fill of each cell or null */
const Strip: React.FC<{ k: number; cells: (string | null)[]; flags: { i: number; text: string; color: string; k: number }[] }> = ({ k, cells, flags }) => {
  const cw = 64, gap = 10, n = cells.length;
  const x0 = 540 - (n * cw + (n - 1) * gap) / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 240, width: 1080, height: 260, opacity: k, translate: `0px ${(1 - k) * -30}px` }}>
      <div style={{ position: "absolute", left: x0, top: 0, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.dim }}>frames →</div>
      {cells.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: x0 + i * (cw + gap), top: 52, width: cw, height: 84, borderRadius: 10, border: `3px solid ${c ?? "rgba(245,241,232,.25)"}`, background: c ? `${c}55` : "rgba(245,241,232,.04)", boxShadow: c ? `0 0 18px ${c}66` : undefined }} />
      ))}
      {flags.map((f) => (
        <div key={f.text} style={{ position: "absolute", left: x0 + f.i * (cw + gap) + cw / 2 - 100, width: 200, top: 146, textAlign: "center", opacity: f.k, scale: `${lerp(0.5, 1, f.k)}` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: f.color, lineHeight: 1 }}>▲</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: f.color }}>{f.text}</div>
        </div>
      ))}
    </div>
  );
};

const BasicLevel: React.FC<{ dim?: number; edgeGlow?: number; hot?: number }> = ({ dim, edgeGlow, hot }) => (
  <>
    <Platform x1={40} x2={EDGE} dim={dim} edgeGlow={edgeGlow} />
    <Platform x1={FAR} x2={1040} />
    <Spikes x1={EDGE + 6} x2={FAR - 6} hot={hot} />
  </>
);

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const b = LS(1);
  const head = 1 - ramp(t, b - 0.25, 0.3);
  const j = arc(t, 0, 1.05, 545, 850, 1085, GROUND, 250);
  const landed = t >= 1.05;
  const p: Pos = { x: j.x, y: j.y, sq: squash(t, 1.05), run: 0 };
  return (
    <Scene a={0} b={b} enter={false}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", opacity: head }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>You just jumped off</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.1, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>thin air</div>
      </div>
      <BasicLevel />
      <EdgeLine x={EDGE} k={1} color={C.orange} />
      {/* ghost trail: ran along the ledge, then past the edge */}
      {[[200, GROUND], [300, GROUND], [400, GROUND]].map(([x, y], i) => (
        <Hero key={i} x={x} y={y} sq={0} run={0} ghost={(0.12 + i * 0.07) * (1 - ramp(t, 0.5, 0.6))} />
      ))}
      <Puff x={545} y={1085} at={-0.12} />
      <div style={{ position: "absolute", left: 470, top: 1092, width: 75, height: 0, borderTop: `5px dashed ${C.orange}`, opacity: 1 - ramp(t, 0.4, 0.3) }} />
      <Hero {...p} />
      {landed && <Puff x={850} y={GROUND} at={1.05} color={C.green} />}
    </Scene>
  );
};

const Replay: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(5);
  const left = W(1, 6), press = W(2, 2), go = W(3, 0) + 0.05, land = go + 0.9;
  let p: Pos;
  if (t < 2.0) p = { x: 150, y: GROUND, sq: 0, run: 0 };
  else if (t < left) p = { x: lerp(150, EDGE, (t - 2.0) / (left - 2.0)), y: GROUND, sq: 0, run: 1 };
  else if (t < go) { const k = (t - left) / (go - left); p = { x: lerp(EDGE, 540, Math.min(1, k * 1.25)), y: GROUND + 30 * k * k, sq: 0, run: 0.4 * (1 - k) }; }
  else if (t < land) { const j = arc(t, go, land, 540, 850, GROUND + 30, GROUND, 300); p = { x: j.x, y: j.y, sq: 0, run: 0 }; }
  else { const hop = arc(t, W(4, 2), W(4, 2) + 0.45, 850, 850, GROUND, GROUND, 70); p = { x: hop.x, y: hop.y, sq: squash(t, land) + squash(t, W(4, 2) + 0.45), run: 0 }; }
  const tag = pop(t, a + 0.05, 12);
  const crossed = pop(t, left, 10);
  const slowmo = t > 2.0 && t < go;
  const gapK = ramp(t, left + 0.2, 0.3) * (1 - ramp(t, go, 0.2));
  const allowed = pop(t, W(3, 5), 10);
  const coyote = pop(t, W(4, 2), 9);
  const rew = t < a + 0.35; // rewind streaks
  return (
    <Scene a={a} b={b}>
      <Tag k={tag * (1 - ramp(t, W(3, 5) - 0.2, 0.2))} text={slowmo || t < 2.0 ? "◀◀ replay · slow-mo" : "◀◀ replay"} color={C.white} size={44} y={230} />
      <Tag k={allowed * (1 - ramp(t, W(4, 2) - 0.2, 0.2))} text="allowed ✓" y={300} />
      <Tag k={coyote} text="COYOTE TIME" size={92} y={280} />
      <BasicLevel />
      <EdgeLine x={EDGE} k={1} color={crossed > 0 ? C.orange : C.white} />
      {/* gap bracket edge → hero */}
      <div style={{ position: "absolute", left: EDGE, top: 940, width: Math.max(0, p.x - 48 - EDGE), height: 30, borderLeft: `5px solid ${C.orange}`, borderRight: `5px solid ${C.orange}`, borderTop: `5px solid ${C.orange}`, opacity: gapK }} />
      <Puff x={540} y={GROUND + 30} at={go} />
      <Puff x={850} y={GROUND} at={land} color={C.green} />
      <Hero {...p} glow={t > press && t < go ? "rgba(74,222,128,.8)" : undefined} />
      <JumpKey at={press} k={pop(t, W(2, 0), 12)} verdict="ok" vAt={W(3, 5)} />
      {rew && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(245,241,232,.08) 0 3px, transparent 3px 14px)", opacity: 1 - ramp(t, a, 0.35) }} />}
    </Scene>
  );
};

const N = 12;
const Strict: React.FC = () => {
  const t = useT();
  const a = LS(5), b = LS(8);
  const edgeAt = W(5, 5), press = W(6, 0), gone = W(6, 4), strict = W(7, 2), drop = W(7, 5), pit = W(7, 9);
  const step = 0.25, c0 = edgeAt - 4 * step;
  let p: Pos;
  if (t < 9.05) p = { x: 150, y: GROUND, sq: 0, run: 0 };
  else if (t < edgeAt) p = { x: lerp(150, EDGE, (t - 9.05) / (edgeAt - 9.05)), y: GROUND, sq: 0, run: 1 };
  else if (t < drop) { const k = (t - edgeAt) / (drop - edgeAt); p = { x: lerp(EDGE, 545, Math.min(1, k * 1.6)), y: GROUND + 20 * Math.min(1, k * 1.6), sq: 0, run: 0.5 * (1 - Math.min(1, k * 3)) }; }
  else { const k = ramp(t, drop, pit - drop, IN); p = { x: lerp(545, 590, k), y: lerp(GROUND + 20, BOTTOM - 20, k), sq: 0, run: 0, rot: k * 30 }; }
  const cells = [...Array(N)].map((_, i) => (t >= c0 + i * step ? (i < 4 ? C.white : C.orange) : null));
  const sh = shake(t, pit, 20, 0.5);
  const dead = pop(t, pit, 9);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", inset: 0, translate: `${sh}px 0px` }}>
        <Strip k={ramp(t, a, 0.4)} cells={cells} flags={[
          { i: 4, text: "edge", color: C.white, k: pop(t, edgeAt, 12) },
          { i: 8, text: "press", color: C.orange, k: pop(t, press, 12) },
        ]} />
        <Tag k={pop(t, strict, 10)} text="STRICT GAME" color={C.orange} size={56} y={520} />
        <BasicLevel dim={ramp(t, gone, 0.3)} edgeGlow={ramp(t, gone, 0.2) * (1 - ramp(t, gone + 0.6, 0.4))} hot={dead} />
        <EdgeLine x={EDGE} k={1} color={t > edgeAt ? C.orange : C.white} label={false} />
        <Hero {...p} />
        <JumpKey at={press} k={ramp(t, a, 0.4)} verdict="no" vAt={strict} />
        <div style={{ position: "absolute", left: 470, width: 250, top: 1060, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 130, color: C.orange, opacity: dead, scale: `${lerp(0.3, 1, dead)}`, textShadow: `0 0 50px ${C.orange}` }}>✗</div>
        <div style={{ position: "absolute", inset: 0, background: C.orange, opacity: 0.25 * (1 - ramp(t, pit, 0.4)) * (t >= pit ? 1 : 0) }} />
      </div>
    </Scene>
  );
};

const Forgive: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(10);
  const open = W(8, 7), press = W(9, 5), go = press + 0.08, land = go + 0.8;
  const grow = ramp(t, open, 0.5, INOUT);
  const runA = W(9, 0);
  let p: Pos;
  if (t < runA) p = { x: 150, y: GROUND, sq: 0, run: 0 };
  else if (t < go) { const k = (t - runA) / (go - runA); p = { x: lerp(150, 545, k), y: GROUND + (t > runA + (go - runA) * 0.81 ? 8 : 0), sq: 0, run: 1 }; }
  else { const j = arc(t, go, land, 545, 850, GROUND + 8, GROUND, 300); p = { x: j.x, y: j.y, sq: squash(t, land), run: 0 }; }
  const greenAt = [W(9, 1), W(9, 2), W(9, 3)];
  const cells = [...Array(N)].map((_, i) => {
    if (i < 4) return C.white;
    if (i >= 4 && i < 7) return t >= greenAt[i - 4] ? C.green : null;
    return null;
  });
  const pulse = ramp(t, W(9, 4), 0.15) * (1 - ramp(t, W(9, 4) + 0.3, 0.4));
  const ok = pop(t, land, 9);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", inset: 0, scale: `${1 + pulse * 0.02}` }}>
        <Strip k={1} cells={cells} flags={[{ i: 4, text: "edge", color: C.white, k: 1 }]} />
      </div>
      <Tag k={pop(t, W(8, 3), 11) * (1 - ramp(t, W(9, 0), 0.3))} text="e.g. Celeste" color={C.white} size={48} y={540} />
      <BasicLevel />
      <Grace x={EDGE} w={130 * grow} k={grow} label />
      <EdgeLine x={EDGE} k={1} label={false} />
      <Hero {...p} glow={t > press && t < go + 0.3 ? "rgba(74,222,128,.8)" : undefined} />
      <Puff x={545} y={GROUND + 8} at={go} color={C.green} />
      <Puff x={850} y={GROUND} at={land} color={C.green} />
      <JumpKey at={press} k={1} verdict="ok" vAt={land} />
      <Tag k={ok} text="made it ✓" size={52} y={560} />
    </Scene>
  );
};

// wide level for the ending (world coords, then scaled)
const WIDE = [[0, 300], [480, 700], [880, 1100], [1280, 1500]];
const Fair: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const z = lerp(0.66, 0.72, ramp(t, W(11, 0), T.END - W(11, 0), INOUT));
  // hero hops: run, take off a little past each edge, land on the next platform
  const hops = [
    { r0: a + 0.05, go: W(10, 1), land: W(10, 1) + 0.5, from: 130, off: 330, to: 560 },
    { r0: W(10, 1) + 0.5, go: W(10, 4), land: W(10, 4) + 0.5, from: 560, off: 730, to: 960 },
    { r0: W(10, 4) + 0.5, go: W(11, 1), land: W(11, 1) + 0.5, from: 960, off: 1130, to: 1380 },
  ];
  let p: Pos = { x: 1380, y: GROUND, sq: 0, run: 0 };
  for (const h of hops) {
    if (t < h.r0) { p = { x: h.from, y: GROUND, sq: 0, run: 0 }; break; }
    if (t < h.go) { const k = (t - h.r0) / (h.go - h.r0); p = { x: lerp(h.from, h.off, k), y: GROUND + (h.off - 300 > 0 && lerp(h.from, h.off, k) > h.off - 30 ? 6 : 0), sq: 0, run: 1 }; break; }
    if (t < h.land) { const j = arc(t, h.go, h.land, h.off, h.to, GROUND + 6, GROUND, 240); p = { x: j.x, y: j.y, sq: 0, run: 0 }; break; }
    p = { x: h.to, y: GROUND, sq: squash(t, h.land), run: 0 };
  }
  const idleHop = t > hops[2].land + 0.6 ? arc(t, T.END - 2.0, T.END - 1.55, 1380, 1380, GROUND, GROUND, 50) : null;
  if (idleHop) p = { ...p, y: idleHop.y, sq: squash(t, T.END - 1.55) };
  const reveal = ramp(t, W(11, 2), 0.5);
  const fair = pop(t, W(10, 3), 10) * (1 - ramp(t, W(11, 3) - 0.2, 0.2));
  const take = pop(t, W(11, 3), 11);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Tag k={fair} text="feels fair ✓" size={64} y={300} />
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", opacity: Math.min(1, take * 1.5), scale: `${lerp(0.6, 1, take)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.white, lineHeight: 1.1 }}>Late jump?</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 104, color: C.green, lineHeight: 1.15, textShadow: "0 0 40px rgba(74,222,128,.5)" }}>Still counts.</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1500, height: 1920, transformOrigin: `750px ${GROUND}px`, translate: `${540 - 750}px ${1090 - GROUND}px`, scale: `${z}` }}>
        {WIDE.map(([x1, x2], i) => <Platform key={i} x1={x1} x2={x2} />)}
        {WIDE.slice(0, 3).map(([, x2], i) => <Spikes key={i} x1={x2 + 6} x2={WIDE[i + 1][0] - 6} />)}
        {hops.map((h, i) => {
          const flash = ramp(t, h.go - 0.3, 0.15) * (1 - ramp(t, h.go + 0.15, 0.3));
          return <Grace key={i} x={WIDE[i][1]} w={60} k={Math.max(flash, reveal)} />;
        })}
        {hops.map((h, i) => <Puff key={`p${i}`} x={h.off} y={GROUND + 6} at={h.go} color={C.green} />)}
        {hops.map((h, i) => <Puff key={`l${i}`} x={h.to} y={GROUND} at={h.land} />)}
        <Hero {...p} />
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
const steps = (from: number, to: number, every = 0.16, vol = 0.3) =>
  [...Array(Math.max(0, Math.floor((to - from) / every)))].map((_, i) => [from + i * every, "tick", vol] as [number, string, number]);
const SFX: [number, string, number][] = [
  [0, "pop", 0.8], [0.02, "whoosh", 0.4], [1.05, "stamp", 0.45],
  [LS(1) - 0.1, "rewind", 0.7], ...steps(2.0, W(1, 6), 0.22), [W(1, 6), "error", 0.25],
  [W(2, 0), "pop", 0.5], [W(2, 2), "click", 0.9],
  [W(3, 0) + 0.05, "pop", 0.8], [W(3, 0) + 0.95, "stamp", 0.45], [W(3, 5), "chime", 0.8],
  [W(4, 2), "impact", 0.6], [W(4, 2) + 0.05, "pop", 0.6],
  [LS(5) - 0.15, "whoosh", 0.5], ...steps(9.05, W(5, 5), 0.2),
  ...[...Array(N)].map((_, i) => [W(5, 5) - 1 + i * 0.25, "tick", 0.5] as [number, string, number]),
  [W(6, 0), "click", 0.9], [W(6, 4), "zap", 0.4], [W(7, 2), "error", 0.5], [W(7, 5), "riser", 0.35], [W(7, 9), "impact", 0.9],
  [LS(8) - 0.15, "whoosh", 0.5], [W(8, 3), "pop", 0.6], [W(8, 7), "riser", 0.4],
  [W(9, 1), "tick", 0.8], [W(9, 2), "tick", 0.8], [W(9, 3), "tick", 0.8], ...steps(W(9, 0), W(9, 5), 0.2),
  [W(9, 5), "click", 0.9], [W(9, 5) + 0.08, "pop", 0.8], [W(9, 5) + 0.88, "chime", 0.8],
  [LS(10) - 0.15, "whoosh", 0.5],
  [W(10, 1), "pop", 0.6], [W(10, 1) + 0.5, "stamp", 0.3], [W(10, 3), "chime", 0.5],
  [W(10, 4), "pop", 0.6], [W(10, 4) + 0.5, "stamp", 0.3],
  [W(11, 1), "pop", 0.6], [W(11, 1) + 0.5, "stamp", 0.3],
  [W(11, 2), "riser", 0.4], [W(11, 3), "impact", 0.5], [W(11, 3) + 0.05, "chime", 0.6],
  [T.END - 2.0, "pop", 0.4],
];

export const CoyoteTime: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Replay />
    <Strict />
    <Forgive />
    <Fair />
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
