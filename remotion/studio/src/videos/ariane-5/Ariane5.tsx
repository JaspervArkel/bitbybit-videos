/*
 * STORYBOARD — "The rocket destroyed by one number" (backlog n=8, ending: follow_cta, E5)
 * Facts from the Ariane 501 inquiry board report (source in backlog): breakup at about H0+39 s; the value was BH,
 * "horizontal bias", converted from 64-bit float to 16-bit signed integer (Operand Error); the SRI was reused from
 * Ariane 4; the backup SRI ran identical software and failed one data cycle (72 ms) earlier.
 * One world: the rocket. It flies, breaks apart, then we go inside its guidance computer and its one number.
 * L0  "In 1996, a brand-new rocket broke apart"    HOOK (frame 0 complete): headline "The rocket destroyed by / one number",
 *                                                  a rocket climbing (flame flicker, speed streaks), mission clock T+ counting,
 *                                                  "1996" tag. Motion in the first 0.5 s.
 * L1  "about forty seconds after launch, because of one number."  clock lands on T+39 s on "forty"; rocket tilts;
 *                                                  on "one" the rocket breaks apart (flash, parts fly); a "######" number box glows on "number".
 * L2  "Ariane 5's guidance software was reused"     big rocket "Ariane 5" on the right; a code chip "guidance code" in its nose
 *                                                  on "guidance"; on "reused" a ↺ copy badge.
 * L3  "from the smaller Ariane 4."                  small rocket "Ariane 4" pops on the left on "smaller"; the chip flies 4 → 5.
 * L4  "One value, tied to horizontal velocity,"     zoom into the chip: one value slot pops on "value"; a horizontal velocity arrow
 *                                                  grows from the rocket on "horizontal velocity".
 * L5  "was a 64-bit float converted into a 16-bit integer."  64-cell box on "64-bit"; funnel on "converted";
 *                                                  16-cell box on "16-bit" (orange, much narrower).
 * L6  "The biggest number that fits is 32,767."     16 cells fill to 0111 1111 1111 1111, counter rolls to 32,767 on "32,767".
 * L7  "Ariane 5 flew faster, the value got too big,"  velocity arrow stretches on "faster"; counter climbs to 32,768 on "too big",
 *                                                  the box cracks and shakes.
 * L8  "and the conversion failed."                  OPERAND ERROR stamp slams on "failed".
 * L9  "Its backup computer ran the same code,"      two computer boxes: "active" + "backup"; same code chip lights in both on "same code".
 * L10 "and had failed the same way moments earlier."  backup flips to ERROR on "failed", then active; timeline "72 ms earlier" on "moments".
 * L11 "Follow: tomorrow, 60 FPS that still stutters."  END (follow_cta): takeaway "One number didn't fit", Follow button clicked
 *                                                  → Following ✓, "Tomorrow:" + a stuttering "60 FPS" frame counter.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cursor, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 1.6);
const { W, LS } = T;
export const ARIANE_5_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/ariane-5/${p}`);

// ---------- building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);
const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

/** Generic rocket (core + two boosters), drawn in a 200x400 box. brk 0..1 = break-apart progress. */
const Rocket: React.FC<{ h: number; brk?: number; flame?: number; chip?: React.ReactNode }> = ({ h, brk = 0, flame = 1, chip }) => {
  const t = useT();
  const w = h / 2;
  const fl = 0.85 + 0.15 * Math.sin(t * 47) + 0.08 * Math.sin(t * 91);
  const part = (dx: number, dy: number, rot: number): React.CSSProperties => ({
    transform: `translate(${dx * brk}px, ${dy * brk}px) rotate(${rot * brk}deg)`, transformBox: "fill-box", transformOrigin: "center",
  });
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <svg width={w} height={h} viewBox="0 0 200 400" style={{ overflow: "visible" }}>
        {/* flames */}
        <g opacity={flame * (1 - brk)}>
          {[64, 100, 136].map((x, i) => (
            <path key={x} d={`M${x - (i === 1 ? 16 : 10)} 340 Q${x} ${340 + (i === 1 ? 90 : 70) * fl} ${x + (i === 1 ? 16 : 10)} 340 Z`} fill={i === 1 ? "#FDE68A" : C.orange} opacity={0.95} style={{ filter: "drop-shadow(0 0 14px rgba(251,146,60,.9))" }} />
          ))}
        </g>
        {/* boosters */}
        <g style={part(-140, 60, -70)}>
          <path d="M48 160 Q58 120 68 160 V330 H48 Z" fill="#D9D4C7" stroke={C.navyDeep} strokeWidth={3} />
          <rect x={46} y={326} width={24} height={14} rx={3} fill="#6B7280" />
        </g>
        <g style={part(150, 40, 80)}>
          <path d="M132 160 Q142 120 152 160 V330 H132 Z" fill="#D9D4C7" stroke={C.navyDeep} strokeWidth={3} />
          <rect x={130} y={326} width={24} height={14} rx={3} fill="#6B7280" />
        </g>
        {/* core */}
        <g style={part(30, 120, 25)}>
          <rect x={72} y={120} width={56} height={215} rx={6} fill={C.white} stroke={C.navyDeep} strokeWidth={3} />
          <rect x={72} y={250} width={56} height={10} fill={C.green} opacity={0.8} />
          <rect x={84} y={334} width={32} height={10} rx={3} fill="#6B7280" />
        </g>
        {/* nose / upper stage */}
        <g style={part(150, -90, 120)}>
          <path d="M72 122 Q72 40 100 18 Q128 40 128 122 Z" fill={C.white} stroke={C.navyDeep} strokeWidth={3} />
          <rect x={72} y={104} width={56} height={10} fill={C.navyDeep} opacity={0.35} />
        </g>
      </svg>
      {chip && <div style={{ position: "absolute", left: "50%", top: h * 0.2, translate: "-50% 0" }}>{chip}</div>}
    </div>
  );
};

const Streaks: React.FC<{ k: number }> = ({ k }) => {
  const t = useT();
  return (
    <>
      {[...Array(14)].map((_, i) => {
        const x = (i * 157) % 1000 + 40;
        const y = ((i * 263 + t * 1400) % 1300) + 380;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 70 + (i % 3) * 30, borderRadius: 2, background: "rgba(245,241,232,.35)", opacity: k * (y < 1340 ? 1 : 0) }} />;
      })}
    </>
  );
};

const CodeChip: React.FC<{ k?: number; color?: string; label?: string; size?: number }> = ({ k = 1, color = C.green, label = "guidance code", size = 30 }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color: C.navy, background: color, padding: `${size * 0.25}px ${size * 0.55}px`, borderRadius: size * 0.35, boxShadow: `0 0 ${36 * k}px ${color}`, whiteSpace: "nowrap", scale: `${lerp(0.4, 1, k)}`, opacity: Math.min(1, k * 1.5) }}>
    {"</>"} {label}
  </div>
);

/** row of bit cells */
const Bits: React.FC<{ n: number; cell: number; color: string; fill?: string; k?: number; perRow?: number }> = ({ n, cell, color, fill, k = 1, perRow = n }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${perRow}, ${cell}px)`, gap: 4, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.6, 1, k)}` }}>
    {[...Array(n)].map((_, i) => {
      const b = fill ? fill[i] : undefined;
      return (
        <div key={i} style={{ width: cell, height: cell * 1.25, borderRadius: 6, border: `3px solid ${color}`, background: b === "1" ? color : "rgba(10,18,38,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: cell * 0.62, color: b === "1" ? C.navy : C.dim }}>
          {b ?? ""}
        </div>
      );
    })}
  </div>
);

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const a = 0, b = LS(2);
  const forty = W(1, 1);
  const secs = Math.min(39, Math.floor((t / forty) * 39));
  const landed = t >= forty;
  const lk = pop(t, forty, 10);
  const brkAt = W(1, 7);
  const brk = ramp(t, brkAt, 1.2);
  const flash = t >= brkAt ? Math.max(0, 1 - (t - brkAt) / 0.4) : 0;
  const tilt = lerp(0, 18, ramp(t, forty, brkAt - forty, INOUT));
  const climb = Math.sin(t * 2.2) * 8;
  const numK = pop(t, W(1, 8), 11);
  const lift = ramp(t, LS(1) - 0.1, 0.5, INOUT); // headline shrinks a bit after the hook line
  return (
    <Scene a={a} b={b} enter={false}>
      <Streaks k={1 - brk} />
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center", scale: `${lerp(1, 0.85, lift)}`, transformOrigin: "50% 0" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>The rocket destroyed by</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 124, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>one number</div>
      </div>
      {/* mission clock + year */}
      <div style={{ position: "absolute", left: 70, top: 520, display: "flex", flexDirection: "column", gap: 18 }}>
        <Pill text="1996" color={C.green} size={44} />
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: landed ? 66 : 58, color: landed ? C.orange : C.white, scale: `${landed ? lerp(0.7, 1, lk) : 1}`, transformOrigin: "left center", textShadow: landed ? "0 0 30px rgba(251,146,60,.6)" : undefined }}>
          T+{String(secs).padStart(2, "0")}s
        </div>
      </div>
      <div style={{ position: "absolute", left: 540 - 175 + 60, top: 560 + climb, rotate: `${tilt}deg`, transformOrigin: "50% 60%" }}>
        <Rocket h={700} brk={brk} />
      </div>
      {flash > 0 && <div style={{ position: "absolute", left: 540 - 300 + 60, top: 700, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(253,230,138,${flash}), rgba(251,146,60,${flash * 0.6}) 40%, transparent 70%)` }} />}
      {/* debris sparks */}
      {brk > 0 && [...Array(12)].map((_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const d = brk * (220 + (i % 4) * 60);
        return <div key={i} style={{ position: "absolute", left: 600 + Math.cos(ang) * d, top: 960 + Math.sin(ang) * d + brk * brk * 120, width: 16, height: 16, borderRadius: 4, background: i % 2 ? C.orange : "#FDE68A", opacity: 1 - brk * 0.7, rotate: `${t * 400 + i * 30}deg` }} />;
      })}
      <Center y={1180} style={{ opacity: numK, scale: `${lerp(0.5, 1, numK)}` }}>
        <Pill text="######" color={C.orange} size={64} />
      </Center>
    </Scene>
  );
};

const Reuse: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(4);
  const big = pop(t, W(2, 0), 12);
  const chipK = pop(t, W(2, 2), 12);
  const reK = pop(t, W(2, 5), 10);
  const small = pop(t, W(3, 2), 12);
  const flyA = W(3, 2) + 0.15, flyB = W(3, 4) + 0.05;
  const fly = ramp(t, flyA, flyB - flyA, INOUT);
  const arrived = t >= flyB;
  // chip positions (screen)
  const sx = 270, sy = 640, bx = 730, by = 580;
  return (
    <Scene a={a} b={b}>
      {/* Ariane 4 (small, left) */}
      <div style={{ position: "absolute", left: 270 - 100, top: 1300 - 400 * 1.0 - 120, opacity: Math.min(1, small * 1.5), scale: `${lerp(0.6, 1, small)}`, transformOrigin: "50% 100%" }}>
        <Rocket h={480} flame={0} />
      </div>
      <div style={{ position: "absolute", left: 270 - 160, width: 320, top: 1270, textAlign: "center", opacity: small, fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.green }}>Ariane 4</div>
      <div style={{ position: "absolute", left: 270 - 160, width: 320, top: 1330, textAlign: "center", opacity: small, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim }}>smaller, slower</div>
      {/* Ariane 5 (big, right) */}
      <div style={{ position: "absolute", left: 730 - 175, top: 470, opacity: Math.min(1, big * 1.5), scale: `${lerp(0.6, 1, big)}`, transformOrigin: "50% 100%" }}>
        <Rocket h={700} flame={0} />
      </div>
      <div style={{ position: "absolute", left: 730 - 200, width: 400, top: 1180, textAlign: "center", opacity: big, fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.orange }}>Ariane 5</div>
      {/* empty slot in Ariane 5 until the chip arrives */}
      {!arrived && <div style={{ position: "absolute", left: bx - 150, top: by, width: 300, height: 62, borderRadius: 14, border: `4px dashed ${C.orange}`, opacity: chipK * 0.9, background: "rgba(10,18,38,.7)" }} />}
      {/* chip: shown in Ariane 5 on "guidance", then revealed as Ariane 4's code flying across */}
      <div style={{ position: "absolute", left: t < flyA ? bx : lerp(sx, bx, fly), top: t < flyA ? by + 4 : lerp(sy, by + 4, fly) - Math.sin(fly * Math.PI) * 120, translate: "-50% 0" }}>
        {t < W(3, 2) ? <div style={{ opacity: chipK * (1 - small) }}><CodeChip k={chipK} label="guidance code" /></div> : <CodeChip k={1} label="guidance code" />}
      </div>
      <div style={{ position: "absolute", left: 120, top: 470, opacity: reK, scale: `${lerp(0.5, 1, reK)}` }}>
        <Pill text="↺ reused" color={C.green} size={48} />
      </div>
    </Scene>
  );
};

const F64 = "0".repeat(64);
const ONE_OVER = "1000000000000000";

const NumberScene: React.FC = () => {
  const t = useT();
  const a = LS(4), b = LS(9);
  const valK = pop(t, W(4, 1), 12);
  const vel = ramp(t, W(4, 4), 0.7, INOUT);
  const fast = ramp(t, W(7, 2), W(7, 3) - W(7, 2) + 0.3, INOUT);
  const b64 = pop(t, W(5, 2), 12);
  const conv = ramp(t, W(5, 4), 0.5);
  const b16 = pop(t, W(5, 7), 11);
  // counter: 0 → 32,767 during L6, then → 32,768 on "too big"
  const fillA = W(6, 0), fillB = W(6, 6);
  const cnt = t < fillA ? 0 : t < fillB ? Math.round(32767 * Math.pow(ramp(t, fillA, fillB - fillA, (x) => x), 2)) : t < W(7, 7) ? 32767 : 32768;
  const fitsK = pop(t, fillB, 10);
  const over = t >= W(7, 7);
  const overK = pop(t, W(7, 7), 9);
  const nOnes = t < fillA ? 0 : Math.min(15, Math.floor(15 * ramp(t, fillA, fillB - fillA, (x) => x)));
  const bits16 = over ? ONE_OVER : "0" + "1".repeat(nOnes) + "0".repeat(15 - nOnes);
  const failed = t >= W(8, 3);
  const stamp = pop(t, W(8, 3), 9, 220);
  const sh = shake(t, W(7, 7), 18, 0.5) + shake(t, W(8, 3), 24, 0.5);
  const sum = t >= fillA;
  return (
    <Scene a={a} b={b}>
      {/* the rocket's one value + velocity arrow (top) */}
      <div style={{ position: "absolute", left: 120, top: 430, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ rotate: "90deg" }}><Rocket h={200} flame={1} /></div>
      </div>
      <div style={{ position: "absolute", left: 330, top: 530, height: 18, width: lerp(0, 330, vel) + 300 * fast, borderRadius: 9, background: fast > 0 ? `linear-gradient(90deg, ${C.green}, ${C.orange})` : C.green, boxShadow: `0 0 24px ${fast > 0.5 ? C.orange : C.green}` }} />
      <div style={{ position: "absolute", left: 320 + lerp(0, 330, vel) + 300 * fast, top: 512, width: 0, height: 0, borderTop: "27px solid transparent", borderBottom: "27px solid transparent", borderLeft: `40px solid ${fast > 0.5 ? C.orange : C.green}`, opacity: vel }} />
      <div style={{ position: "absolute", left: 330, top: 570, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: fast > 0.5 ? C.orange : C.dim, opacity: vel }}>horizontal velocity{fast > 0.5 ? ": faster" : ""}</div>
      <Center y={650} style={{ opacity: valK, scale: `${lerp(0.5, 1, valK)}` }}>
        <Pill text={<>one value: <span style={{ color: C.green }}>BH</span></>} size={46} />
      </Center>
      {/* 64-bit float */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: b64 * (1 - ramp(t, fillA - 0.2, 0.3) * 0.65) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.green }}>64-bit float</div>
        <Bits n={64} cell={24} color={C.green} perRow={32} k={b64} fill={F64.replace(/0/g, " ")} />
      </div>
      {/* funnel arrow */}
      <Center y={930} style={{ opacity: conv }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.white, translate: `0px ${Math.sin(t * 8) * 6 * conv}px` }}>▼</div>
      </Center>
      {/* 16-bit integer */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1020, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: b16, translate: `${sh}px 0px` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.orange }}>16-bit integer</div>
        <div style={{ position: "relative" }}>
          <Bits n={16} cell={48} color={over ? C.orange : sum ? C.green : C.orange} k={b16} fill={bits16} />
          {over && <svg width={840} height={70} viewBox="0 0 840 70" style={{ position: "absolute", left: 0, top: -4, overflow: "visible", opacity: overK }}>
            <path d="M380 0 L410 25 L395 38 L440 70" fill="none" stroke={C.orange} strokeWidth={6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #FB923C)" }} />
          </svg>}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: over ? 96 : 88, color: over ? C.orange : cnt === 32767 ? C.green : C.white, opacity: sum ? 1 : 0, scale: `${over ? lerp(0.7, 1, overK) : cnt === 32767 ? lerp(0.8, 1, fitsK) : 1}`, textShadow: over ? "0 0 40px rgba(251,146,60,.7)" : cnt === 32767 ? "0 0 40px rgba(74,222,128,.6)" : undefined }}>
          {cnt.toLocaleString("en-US")}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: over ? C.orange : C.green, opacity: t >= fillB ? 1 : 0, marginTop: -6 }}>{over ? "too big to fit" : "the biggest that fits"}</div>
      </div>
      {/* OPERAND ERROR stamp */}
      {failed && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1100, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.orange, border: `8px solid ${C.orange}`, borderRadius: 22, padding: "6px 34px", background: "rgba(10,18,38,.92)", rotate: "-8deg", scale: `${lerp(2.2, 1, stamp)}`, opacity: Math.min(1, stamp * 2), boxShadow: "0 0 60px rgba(251,146,60,.5)" }}>OPERAND ERROR</div>
        </div>
      )}
    </Scene>
  );
};

const Computer: React.FC<{ label: string; on: number; err: number; code: number }> = ({ label, on, err, code }) => {
  const col = err > 0.5 ? C.orange : C.green;
  return (
    <div style={{ width: 420, height: 400, borderRadius: 34, background: "rgba(13,22,48,.95)", border: `5px solid ${on > 0.5 ? col : C.line}`, boxShadow: `0 0 ${50 * on}px ${col}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: on > 0.5 ? C.white : C.dim }}>{label}</div>
      <div style={{ opacity: code }}><CodeChip k={code} label="same code" size={28} color={err > 0.5 ? C.orange : C.green} /></div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, color: err > 0.5 ? C.orange : C.green, opacity: on }}>{err > 0.5 ? "✗ ERROR" : "● OK"}</div>
    </div>
  );
};

const Backup: React.FC = () => {
  const t = useT();
  const a = LS(9), b = LS(11);
  const actK = pop(t, a, 12);
  const bkK = pop(t, W(9, 1), 12);
  const code = pop(t, W(9, 5), 12);
  const bErr = t >= W(10, 2) ? 1 : 0;
  const aErrAt = W(10, 2) + 0.6;
  const aErr = t >= aErrAt ? 1 : 0;
  const tl = pop(t, W(10, 6), 11);
  const sb = shake(t, W(10, 2), 14, 0.45), sa = shake(t, aErrAt, 14, 0.45);
  return (
    <Scene a={a} b={b}>
      <Center y={455} style={{ opacity: ramp(t, a, 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white }}>inside: two guidance computers</div>
      </Center>
      <div style={{ position: "absolute", left: 90, top: 560, opacity: Math.min(1, actK * 1.5), scale: `${lerp(0.6, 1, actK)}`, translate: `${sa}px 0px` }}>
        <Computer label="active" on={1} err={aErr} code={code} />
      </div>
      <div style={{ position: "absolute", left: 570, top: 560, opacity: Math.min(1, bkK * 1.5), scale: `${lerp(0.6, 1, bkK)}`, translate: `${sb}px 0px` }}>
        <Computer label="backup" on={bkK} err={bErr} code={code} />
      </div>
      {/* timeline */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 1080, height: 8, borderRadius: 4, background: "rgba(245,241,232,.2)", opacity: tl }} />
      {[{ x: 0.3, l: "backup fails", c: bErr }, { x: 0.7, l: "active fails", c: aErr }].map((m) => (
        <div key={m.l} style={{ position: "absolute", left: 120 + 840 * m.x - 150, width: 300, top: 1052, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: tl * (m.c ? 1 : 0.35) }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: C.orange, boxShadow: "0 0 30px rgba(251,146,60,.7)" }} />
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.orange }}>{m.l}</div>
        </div>
      ))}
      <Center y={1230} style={{ opacity: tl, scale: `${lerp(0.5, 1, tl)}` }}>
        <Pill text="72 ms earlier" color={C.orange} size={44} />
      </Center>
    </Scene>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const a = LS(11);
  const fol = pop(t, W(11, 0), 10);
  const clickAt = W(11, 0) + 0.4;
  const press = t > clickAt - 0.05 && t < clickAt + 0.1 ? 1 : 0;
  const followed = t > clickAt;
  const tm = ramp(t, W(11, 1), 0.3);
  const fps = pop(t, W(11, 2), 12);
  // stutter: counter mostly steady, freezes in hitches
  const ph = (t * 3) % 1;
  const hitch = ph > 0.72 && ph < 0.86;
  const frame = Math.floor(t * 60);
  const stK = ramp(t, W(11, 4), 0.2);
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Center y={450} style={{ opacity: ramp(t, a, 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>One number <span style={{ color: C.orange }}>didn't fit</span></div>
      </Center>
      <Center y={590} style={{ opacity: fol, scale: `${lerp(0.5, 1, fol) * (1 - press * 0.06)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, color: followed ? C.green : C.navy, background: followed ? "rgba(74,222,128,.12)" : C.green, border: `5px solid ${C.green}`, padding: "18px 70px", borderRadius: 999, boxShadow: "0 0 70px rgba(74,222,128,.45)" }}>{followed ? "Following ✓" : "Follow"}</div>
      </Center>
      <Cursor x={lerp(820, 640, ramp(t, a, 0.4, INOUT))} y={lerp(820, 650, ramp(t, a, 0.4, INOUT))} down={press} opacity={ramp(t, a, 0.2) * (1 - ramp(t, W(11, 1) + 0.2, 0.3))} />
      <Center y={820} style={{ opacity: tm }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>Tomorrow:</div>
      </Center>
      <Center y={930} style={{ opacity: fps, scale: `${lerp(0.6, 1, fps)}` }}>
        <div style={{ width: 640, height: 230, borderRadius: 30, border: `4px solid ${stK > 0.5 && hitch ? C.orange : C.green}`, background: "rgba(10,18,38,.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", translate: `${stK > 0.5 && hitch ? 10 : 0}px 0px` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.green }}>60 FPS</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: stK > 0.5 && hitch ? C.orange : C.dim }}>{stK > 0.5 && hitch ? "frame … stuck" : `frame ${frame}`}</div>
        </div>
      </Center>
      <Center y={1200} style={{ opacity: ramp(t, W(11, 3), 0.3) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.orange }}>that still stutters</div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "riser", 0.5], [0.05, "impact", 0.4],
  ...[...Array(9)].map((_, i) => [0.3 + i * 0.36, "tick", 0.4] as [number, string, number]),
  [W(0, 1), "pop", 0.5], [W(0, 5), "zap", 0.35],
  [W(1, 1), "chime", 0.6], [W(1, 4), "error", 0.3], [W(1, 7), "impact", 1], [W(1, 7) + 0.05, "vortex", 0.4], [W(1, 8), "stamp", 0.7],
  [LS(2) - 0.15, "whoosh", 0.6], [W(2, 0), "pop", 0.6], [W(2, 2), "pop", 0.6], [W(2, 5), "chime", 0.5],
  [W(3, 2), "pop", 0.6], [W(3, 2) + 0.15, "whoosh", 0.5], [W(3, 4) + 0.05, "click", 0.8],
  [LS(4) - 0.15, "whoosh", 0.6], [W(4, 1), "pop", 0.6], [W(4, 4), "zap", 0.5],
  [W(5, 2), "pop", 0.7], [W(5, 4), "whoosh", 0.4], [W(5, 7), "impact", 0.6],
  ...[...Array(12)].map((_, i) => [W(6, 0) + i * ((W(6, 6) - W(6, 0)) / 12), "key", 0.4] as [number, string, number]),
  [W(6, 6), "chime", 0.8],
  [W(7, 2), "riser", 0.4], [W(7, 3), "zap", 0.5], [W(7, 7), "impact", 0.9], [W(7, 7), "error", 0.4],
  [W(8, 3), "stamp", 1], [W(8, 3) + 0.05, "impact", 0.6],
  [LS(9) - 0.15, "whoosh", 0.6], [LS(9), "pop", 0.5], [W(9, 1), "pop", 0.6], [W(9, 5), "chime", 0.6],
  [W(10, 2), "error", 0.6], [W(10, 2) + 0.6, "error", 0.6], [W(10, 2) + 0.6, "impact", 0.6], [W(10, 6), "pop", 0.6],
  [LS(11) - 0.15, "whoosh", 0.5], [W(11, 0) + 0.4, "click", 0.9], [W(11, 0) + 0.45, "chime", 0.6], [W(11, 2), "pop", 0.6], [W(11, 4), "tick", 0.6], [W(11, 5), "tick", 0.6],
];

export const Ariane5: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Background retro={0} />
      <Hook />
      <Reuse />
      <NumberScene />
      <Backup />
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
