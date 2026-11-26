/*
 * STORYBOARD — "Why AI answers differently every time" (temperature / sampling). One world: an AI chat window
 * that writes its reply one chunk at a time, a score panel of candidate next chunks (labelled "example"),
 * a temperature slider and a weighted die.
 *  L0  "Ask AI twice. You get two different answers."   Frame 0: headline "Same question. 2 answers" + two chat windows
 *                                     (try 1 / try 2), same question, different replies; differing words glow; ≠ badge pulses,
 *                                     regenerate icon spins. ≠ punches on "two".
 *  L1  "That's on purpose. For each next chunk of text,"  Windows merge into one chat. "on purpose ✓" chip on "purpose".
 *                                     Reply "It's in ▮": slot pulses on "next", chunk boxes around It's / in on "chunk".
 *  L2  "the model scores every option it knows."   Score panel rises on "scores"; a fast column of many candidate words
 *                                     with flickering bars scrolls on "every", settles on "knows".
 *  L3  "\"Paris\" might get ninety percent,"   "example" tag; Paris bar fills to 90% on "ninety" (counter).
 *  L4  "\"France\" five, and so on."           France bar to 5% on "five"; the rest fill on "so".
 *  L5  "A setting called temperature decides how it picks."  Temperature slider pops on "temperature"; picker arrow
 *                                     wobbles over the rows on "picks".
 *  L6  "Near zero, it almost always takes the top choice,"  Knob slides to cold on "zero"; bars sharpen (Paris ≈100%,
 *                                     computed with softmax(ln p / T)); Paris row glows on "top", drops into the reply on "choice".
 *  L7  "and replies barely change."           Chat shows three tries, all the same reply, "=" ticks on each.
 *  L8  "Chatbots usually run warmer,"          Reply resets; knob slides warm (orange) on "warmer"; bars return to 90/5.
 *  L9  "rolling weighted dice for every chunk." Die tumbles on "rolling", lands on "dice" → Paris; next chunks appear
 *                                     one by one on "every chunk", each with a small die flip.
 *  L10 "One different roll early on,"          New scene: root "It's in …", die tumbles, lands → France (5%) on "roll";
 *                                     "early" chip; old Paris path stays on the left, dim.
 *  L11 "and the whole answer takes another path." Right branch writes ", in the city of Paris." chunk by chunk on "whole";
 *                                     on "another path" it glows, left path dims. Implication ending: takeaway
 *                                     "Different roll. New answer." Slow push-in.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, LS } = T;
export const AI_TEMPERATURE_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/ai-temperature/${p}`);

const QUESTION = "Where is the Eiffel Tower?";
const REPLY_A = ["It's", "in", "Paris,", "on", "the", "river", "Seine."];
const REPLY_B = ["It's", "in", "France,", "in", "the", "city", "of", "Paris."];

// ---------- example scores (illustration, labelled "example" on screen) ----------
const ROWS = ["Paris", "France", "the", "Europe", "a", "…"];
const BASE = [0.9, 0.05, 0.02, 0.01, 0.01, 0.01];
/** temperature scaling: softmax(ln p / temp) */
const dist = (temp: number) => {
  const e = BASE.map((p) => Math.pow(p, 1 / temp));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
};
const fmt = (p: number) => {
  const v = p * 100;
  if (v >= 99.5) return "≈100%";
  if (v < 0.5) return "≈0%";
  return `${Math.round(v)}%`;
};
/** temperature over time: 1 → near zero on "zero" → back to 1 on "warmer" */
const tempAt = (t: number) => {
  const cold = ramp(t, W(6, 1), 0.7, INOUT) * (1 - ramp(t, W(8, 3), 0.7, INOUT));
  return lerp(1, 0.1, cold);
};

// ---------- pieces ----------
const Window: React.FC<{ x: number; y: number; w: number; h: number; title: string; spin?: boolean; children: React.ReactNode; glow?: string }> = ({ x, y, w, h, title, spin, children, glow }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30, background: "rgba(13,22,48,.96)", border: `3px solid ${glow ?? "rgba(245,241,232,.18)"}`, boxShadow: glow ? `0 0 50px ${glow}66` : "0 20px 60px rgba(0,0,0,.5)", overflow: "hidden" }}>
      <div style={{ height: 64, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "rgba(245,241,232,.25)" }} />)}
        <div style={{ marginLeft: 12, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim, flex: 1 }}>{title}</div>
        {spin !== undefined && <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: spin ? C.orange : C.dim, rotate: spin ? `${t * 300}deg` : "0deg", lineHeight: 1 }}>↻</div>}
      </div>
      <div style={{ position: "relative", padding: 24 }}>{children}</div>
    </div>
  );
};

const UserBubble: React.FC<{ size?: number; maxW?: number }> = ({ size = 36, maxW = 600 }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
    <div style={{ maxWidth: maxW, padding: "14px 24px", borderRadius: "26px 26px 6px 26px", background: "rgba(74,222,128,.16)", border: `2px solid rgba(74,222,128,.45)`, fontFamily: SANS, fontWeight: 700, fontSize: size, color: C.white, lineHeight: 1.25 }}>{QUESTION}</div>
  </div>
);

type Tok = { s: string; k?: number; color?: string; box?: number; hi?: number };
const Reply: React.FC<{ toks: Tok[]; size?: number; slot?: number; slotPulse?: number }> = ({ toks, size = 42, slot, slotPulse = 0 }) => {
  const t = useT();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `6px ${size * 0.28}px`, alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: size, color: C.white, lineHeight: 1.3 }}>
      {toks.map((x, i) => {
        const k = x.k ?? 1;
        if (k <= 0) return null;
        const col = x.color;
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, Math.min(1, k))}`, color: col ?? C.white, padding: x.box || x.hi ? "0 8px" : undefined, borderRadius: 10,
            border: x.box ? `3px dashed rgba(245,241,232,${0.6 * x.box})` : x.hi ? `3px solid ${col}` : undefined,
            background: x.hi ? `${col}33` : undefined, boxShadow: x.hi ? `0 0 ${24 * x.hi}px ${col}88` : undefined }}>{x.s}</span>
        );
      })}
      {slot !== undefined && slot > 0 && (
        <span style={{ display: "inline-block", width: size * 2.4, height: size * 1.1, borderRadius: 10, border: `3px solid ${C.green}`, background: `rgba(74,222,128,${0.08 + slotPulse * 0.25})`, opacity: slot, boxShadow: `0 0 ${30 * slotPulse}px ${C.green}`, textAlign: "center", fontFamily: MONO, fontSize: size * 0.8, color: C.green, lineHeight: `${size * 1.05}px` }}>
          {Math.sin(t * 9) > 0 ? "?" : ""}
        </span>
      )}
    </div>
  );
};

const Tag: React.FC<{ k: number; text: React.ReactNode; color?: string; size?: number; y: number }> = ({ k, text, color = C.green, size = 64, y }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.5) }}>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.16}px ${size * 0.42}px`, borderRadius: size * 0.34, border: `4px solid ${color}`, background: "rgba(10,18,38,.88)", boxShadow: `0 0 40px ${color}55`, scale: `${lerp(0.4, 1, k)}`, whiteSpace: "nowrap", letterSpacing: 2 }}>{text}</div>
  </div>
);

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
/** a die that tumbles between t0 and t1, then rests; face changes while tumbling */
const Die: React.FC<{ x: number; y: number; s?: number; t0: number; t1: number; k?: number; color?: string; flips?: number[] }> = ({ x, y, s = 150, t0, t1, k = 1, color = C.white, flips = [] }) => {
  const t = useT();
  const roll = t > t0 && t < t1 ? (t - t0) / (t1 - t0) : t >= t1 ? 1 : 0;
  const flip = flips.find((f) => t > f && t < f + 0.18);
  const tumbling = (t > t0 && t < t1) || flip !== undefined;
  const face = tumbling ? 1 + (Math.floor(t * 16) % 6) : 5;
  const rot = t > t0 && t < t1 ? (1 - roll) * 720 * (1 - roll) : flip !== undefined ? ((t - flip) / 0.18) * 90 : 0;
  const hop = t > t0 && t < t1 ? Math.abs(Math.sin(roll * Math.PI * 3)) * 60 * (1 - roll) : 0;
  const land = pop(t, t1, 9);
  return (
    <div style={{ position: "absolute", left: x - s / 2, top: y - s / 2 - hop, width: s, height: s, rotate: `${rot}deg`, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, Math.min(1, k)) * (t >= t1 ? lerp(1.15, 1, land) : 1)}` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: s * 0.2, background: color, boxShadow: `0 0 ${t >= t1 ? 40 * (1 - land) + 16 : 16}px ${color}88` }} />
      {PIPS[face].map(([cx, cy], i) => (
        <div key={i} style={{ position: "absolute", left: s * (0.2 + cx * 0.3) - s * 0.08, top: s * (0.2 + cy * 0.3) - s * 0.08, width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08, background: C.navy }} />
      ))}
    </div>
  );
};

// ---------- scene 1: hook ----------
const HookWin: React.FC<{ x: number; title: string; reply: string[]; diff: number; color: string; spin?: boolean }> = ({ x, title, reply, diff, color, spin }) => {
  const t = useT();
  const pulse = 0.7 + Math.sin(t * 7) * 0.3;
  return (
    <Window x={x} y={520} w={460} h={560} title={title} spin={spin} glow={color}>
      <UserBubble size={36} maxW={390} />
      <div style={{ padding: "18px 22px", borderRadius: "26px 26px 26px 6px", background: "rgba(245,241,232,.06)", border: `2px solid ${C.line}` }}>
        <Reply size={50} toks={reply.map((s, i) => ({ s, color: i === diff ? color : undefined, hi: i === diff ? pulse : 0 }))} />
      </div>
    </Window>
  );
};

const Hook: React.FC = () => {
  const t = useT();
  const b = LS(1);
  const two = pop(t, W(0, 5), 8);
  const neq = 0.8 + Math.sin(t * 6) * 0.08 + (t > W(0, 5) ? 0.35 * (1 - ramp(t, W(0, 5) + 0.1, 0.6)) : 0);
  return (
    <Scene a={0} b={b} enter={false}>
      <div style={{ position: "absolute", top: 175, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>Same question.</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.1, color: C.orange, textShadow: `0 0 ${50 + two * 30}px rgba(251,146,60,.55)` }}>2 answers</div>
      </div>
      <HookWin x={40} title="try 1" reply={REPLY_A} diff={2} color={C.green} />
      <HookWin x={580} title="try 2" reply={REPLY_B} diff={2} color={C.orange} spin={t < 0.9} />
      <div style={{ position: "absolute", left: 540 - 44, top: 800 - 44, width: 88, height: 88, borderRadius: 44, background: C.orange, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center", scale: `${neq}`, boxShadow: `0 0 40px ${C.orange}` }}>≠</div>
    </Scene>
  );
};

// ---------- scene 2: the machine (one evolving world) ----------
const PX = 60, PY = 880, PW = 960, PH = 450, ROW0 = 950, RH = 62, BX = 300, BW = 440;
const SCROLL = ["Paris", "France", "the", "a", "Europe", "Rome", "Lyon", "my", "one", "Texas", "your", "this", "Seine", "an", "Nice", "front", "Las", "central", "every", "our", "town", "old", "space", "Tokyo", "his", "it", "real", "north", "fact", "new"];
const Machine: React.FC = () => {
  const t = useT();
  const a = LS(1), b = LS(10);
  // chat window states
  const purpose = pop(t, W(1, 2), 10) * (1 - ramp(t, W(1, 5) - 0.25, 0.2));
  const nextTag = pop(t, W(1, 5), 11) * (1 - ramp(t, W(3, 0) - 0.3, 0.25));
  const boxes = ramp(t, W(1, 6), 0.25) * (1 - ramp(t, W(2, 2), 0.3));
  const slotPulse = 0.5 + Math.sin(t * 8) * 0.5;
  const topPick = W(6, 8) + 0.05; // Paris into the reply (cold)
  const tries = W(7, 1);
  const reset = LS(8);
  const diceLand = W(9, 2);
  const chunkTimes = [W(9, 3), W(9, 4), W(9, 5), W(9, 5) + 0.14, W(9, 5) + 0.28];
  const rest = REPLY_A.slice(3); // on, the, river, Seine.
  let body: React.ReactNode;
  if (t >= tries && t < reset) {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 4 }}>
        {[0, 1, 2].map((i) => {
          const k = pop(t, tries + i * 0.33, 12);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, k * 1.5), translate: `${(1 - Math.min(1, k)) * 60}px 0px` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim, width: 100 }}>try {i + 1}</div>
              <div style={{ flex: 1 }}><Reply size={36} toks={REPLY_A.map((s, j) => ({ s, color: j === 2 ? C.green : undefined }))} /></div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.green }}>=</div>
            </div>
          );
        })}
      </div>
    );
  } else {
    const cold = t >= topPick && t < tries;
    const warm = t >= diceLand + 0.05;
    const paris = cold ? pop(t, topPick, 10) : warm ? pop(t, diceLand + 0.05, 10) : 0;
    const toks: Tok[] = [
      { s: "It's", box: boxes }, { s: "in", box: boxes },
      ...(paris > 0 ? [{ s: "Paris,", k: paris, color: C.green, hi: 1 - ramp(t, (cold ? topPick : diceLand) + 0.6, 0.5) }] : []),
      ...(warm ? rest.map((s, i) => ({ s, k: pop(t, chunkTimes[i], 12) })) : []),
    ];
    body = (
      <>
        <UserBubble size={36} />
        <Reply toks={toks} slot={paris > 0 ? 0 : ramp(t, W(1, 5) - 0.1, 0.2)} slotPulse={slotPulse} />
      </>
    );
  }
  // score panel
  const panel = ramp(t, W(2, 2), 0.4);
  const scrollK = ramp(t, W(2, 3), 0.2) * (1 - ramp(t, W(2, 6) + 0.1, 0.3));
  const rowsK = ramp(t, W(2, 6) + 0.1, 0.3);
  const fills = [ramp(t, W(3, 3), 0.7, INOUT), ramp(t, W(4, 1), 0.4), ramp(t, W(4, 3), 0.5), ramp(t, W(4, 3) + 0.08, 0.5), ramp(t, W(4, 3) + 0.16, 0.5), ramp(t, W(4, 3) + 0.24, 0.5)];
  const temp = tempAt(t);
  const d = dist(temp);
  const example = pop(t, W(3, 0), 11);
  // picker: wobbles on "picks", points at the top row on "top", tracks the dice ball when warm
  const pickK = ramp(t, W(5, 7), 0.3) * (1 - ramp(t, W(7, 1), 0.3)) + ramp(t, W(9, 0), 0.2) * (1 - ramp(t, W(9, 3), 0.3));
  let pickRow = 0;
  if (t < W(6, 7)) pickRow = 1.2 + Math.sin(t * 7) * 1.2;
  else if (t < W(9, 0)) pickRow = 0;
  else if (t < diceLand) pickRow = 2.5 + Math.sin(t * 15) * 2.5;
  else pickRow = lerp(pickRow, 0, 1);
  const topGlow = (ramp(t, W(6, 7), 0.2) * (1 - ramp(t, W(7, 1), 0.4))) + (ramp(t, diceLand, 0.15) * (1 - ramp(t, diceLand + 0.7, 0.4)));
  // temperature slider (top area)
  const slider = pop(t, W(5, 3), 11);
  const knob = temp / 1.5; // 0..1 along the track
  const warmGlow = ramp(t, W(8, 3), 0.5);
  const sliderPulse = ramp(t, W(5, 4), 0.15) * (1 - ramp(t, W(5, 4) + 0.3, 0.4));
  const coldGlow = ramp(t, W(6, 1), 0.5) * (1 - warmGlow);
  const knobCol = warmGlow > 0.5 ? C.orange : coldGlow > 0.5 ? "#7DD3FC" : C.white;
  const dieK = pop(t, W(9, 0) - 0.1, 11);
  return (
    <Scene a={a} b={b}>
      <Tag k={purpose} text="on purpose ✓" y={300} />
      <Tag k={nextTag} text="next chunk = ?" color={C.white} size={56} y={300} />
      {/* temperature slider */}
      <div style={{ position: "absolute", left: 60, top: 205, width: dieK > 0 ? 680 : 960, height: 230, opacity: Math.min(1, slider * 1.5), scale: `${lerp(0.6, 1, Math.min(1, slider)) * (1 + sliderPulse * 0.04)}`, transformOrigin: "50% 50%" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 54, color: C.white, letterSpacing: 2 }}>temperature</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, height: 34, borderRadius: 17, background: "linear-gradient(90deg,#7DD3FC,#F5F1E8 50%,#FB923C)", opacity: 0.85 }} />
        <div style={{ position: "absolute", left: `calc(${knob * 100}% - 34px)`, top: 93, width: 68, height: 68, borderRadius: 34, background: C.navy, border: `8px solid ${knobCol}`, boxShadow: `0 0 ${30 + 30 * Math.max(warmGlow, coldGlow)}px ${knobCol}` }} />
        <div style={{ position: "absolute", left: 0, top: 172, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: coldGlow > 0.5 ? "#7DD3FC" : C.dim }}>near zero</div>
        <div style={{ position: "absolute", right: 0, top: 172, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: warmGlow > 0.5 ? C.orange : C.dim }}>warmer</div>
      </div>
      <Die x={900} y={320} s={160} t0={W(9, 0)} t1={diceLand} k={dieK} flips={chunkTimes} />
      {/* chat window */}
      <Window x={60} y={470} w={960} h={380} title="AI chat">{body}</Window>
      {/* score panel */}
      <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, borderRadius: 30, background: "rgba(13,22,48,.96)", border: `3px solid rgba(245,241,232,.18)`, overflow: "hidden", opacity: panel, translate: `0px ${(1 - panel) * 80}px` }}>
        <div style={{ position: "absolute", left: 30, top: 16, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim }}>scores for the next chunk</div>
        <div style={{ position: "absolute", right: 22, top: 12, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.orange, padding: "2px 14px", borderRadius: 12, border: `3px solid ${C.orange}`, opacity: Math.min(1, example * 1.5), scale: `${lerp(0.5, 1, example)}` }}>example</div>
        {/* fast scroll of every option */}
        {scrollK > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 64, bottom: 0, opacity: scrollK, overflow: "hidden" }}>
            {SCROLL.map((s, i) => {
              const y = ((i * 56 - (t - W(2, 3)) * 1300) % (SCROLL.length * 56) + SCROLL.length * 56) % (SCROLL.length * 56);
              const w = 40 + ((i * 37 + Math.floor(t * 20) * 13) % 200);
              return (
                <div key={s + i} style={{ position: "absolute", left: 30, top: y, display: "flex", alignItems: "center", gap: 20, height: 50 }}>
                  <div style={{ width: 210, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, opacity: 0.8 }}>{s}</div>
                  <div style={{ width: w, height: 22, borderRadius: 11, background: "rgba(245,241,232,.35)" }} />
                </div>
              );
            })}
          </div>
        )}
        {rowsK > 0 && ROWS.map((r, i) => {
          const p = d[i] * fills[i];
          const glow = i === 0 ? topGlow : 0;
          const col = i === 0 ? C.green : i === 1 ? C.orange : "rgba(245,241,232,.6)";
          return (
            <div key={r} style={{ position: "absolute", left: 20, right: 20, top: ROW0 - PY + i * RH, height: RH - 8, borderRadius: 14, background: glow ? `rgba(74,222,128,${0.18 * glow})` : undefined, border: glow ? `3px solid rgba(74,222,128,${glow})` : "3px solid transparent", opacity: rowsK }}>
              <div style={{ position: "absolute", left: 44, top: 4, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: i < 2 ? col : C.white }}>{r}</div>
              <div style={{ position: "absolute", left: BX - 20, top: 15, width: BW, height: 24, borderRadius: 12, background: "rgba(245,241,232,.07)" }} />
              <div style={{ position: "absolute", left: BX - 20, top: 15, width: Math.max(fills[i] > 0 ? 6 : 0, BW * p), height: 24, borderRadius: 12, background: col, boxShadow: i < 2 ? `0 0 18px ${col}88` : undefined }} />
              <div style={{ position: "absolute", right: 16, top: 4, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: i < 2 ? col : C.dim, opacity: fills[i] > 0.05 ? 1 : 0 }}>{fmt(i === 0 ? p : d[i])}</div>
            </div>
          );
        })}
        {/* picker arrow */}
        {pickK > 0 && <div style={{ position: "absolute", left: -4, top: ROW0 - PY + pickRow * RH + 2, fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.green, opacity: Math.min(1, pickK) }}>▶</div>}
      </div>
    </Scene>
  );
};

// ---------- scene 3: another path ----------
const Branch: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; p: number; w?: number; dash?: boolean; opacity?: number }> = ({ x1, y1, x2, y2, color, p, w = 8, dash, opacity = 1 }) => {
  const len = 520;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }} width={1080} height={1920}>
      <path d={`M${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"
        strokeDasharray={dash ? "18 16" : `${len}`} strokeDashoffset={dash ? 0 : len * (1 - p)} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
    </svg>
  );
};

const Paths: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const z = lerp(1, 1.06, ramp(t, W(11, 0), T.END - W(11, 0), INOUT));
  const rollLand = W(10, 2);
  const france = pop(t, rollLand, 10);
  const early = pop(t, W(10, 3), 11) * (1 - ramp(t, W(11, 2) - 0.2, 0.3));
  const whole = W(11, 2);
  const restB = REPLY_B.slice(3);
  const chunkT = restB.map((_, i) => whole + i * 0.17);
  const another = ramp(t, W(11, 5), 0.4);
  const take = pop(t, W(11, 6) + 0.15, 11);
  const leftDim = lerp(0.75, 0.35, another);
  const pulse = 0.8 + Math.sin(t * 6) * 0.2;
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", top: 175, left: 0, right: 0, textAlign: "center", opacity: Math.min(1, take * 1.5), scale: `${lerp(0.6, 1, take)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.white, lineHeight: 1.1 }}>Different roll.</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 116, color: C.orange, lineHeight: 1.15, textShadow: "0 0 40px rgba(251,146,60,.5)" }}>New answer.</div>
      </div>
      <Tag k={early} text="early roll" color={C.orange} size={54} y={330} />
      <div style={{ position: "absolute", inset: 0, scale: `${z}`, transformOrigin: "540px 900px" }}>
        {/* root */}
        <div style={{ position: "absolute", left: 340, top: 520, width: 400, height: 96, borderRadius: 24, background: "rgba(13,22,48,.96)", border: `3px solid rgba(245,241,232,.4)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.white }}>It's in …</div>
        <Branch x1={470} y1={616} x2={270} y2={760} color={C.green} p={1} dash={another > 0.5} opacity={leftDim + 0.2} />
        <Branch x1={610} y1={616} x2={810} y2={760} color={C.orange} p={ramp(t, rollLand, 0.35)} w={lerp(8, 14, another)} />
        {/* left: the first answer */}
        <div style={{ position: "absolute", left: 40, top: 760, width: 460, opacity: leftDim }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.green, padding: "6px 24px", borderRadius: 18, border: `4px solid ${C.green}`, background: "rgba(74,222,128,.14)" }}>Paris <span style={{ fontSize: 34 }}>90%</span></div>
          </div>
          <div style={{ marginTop: 30, padding: "20px 24px", borderRadius: 24, background: "rgba(245,241,232,.06)", border: `2px solid ${C.line}` }}>
            <Reply size={40} toks={REPLY_A.map((s, i) => ({ s, color: i === 2 ? C.green : undefined }))} />
          </div>
        </div>
        {/* right: the different roll */}
        <Die x={810} y={700} s={120} t0={W(10, 0)} t1={rollLand} k={pop(t, a - 0.05, 11) * (1 - ramp(t, rollLand + 0.25, 0.3))} color={C.orange} />
        <div style={{ position: "absolute", left: 580, top: 760, width: 460 }}>
          <div style={{ display: "flex", justifyContent: "center", opacity: Math.min(1, france * 1.5), scale: `${lerp(0.4, 1, france)}` }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.orange, padding: "6px 24px", borderRadius: 18, border: `4px solid ${C.orange}`, background: "rgba(251,146,60,.16)", boxShadow: `0 0 ${40 * pulse}px rgba(251,146,60,.6)` }}>France <span style={{ fontSize: 34 }}>5%</span></div>
          </div>
          <div style={{ marginTop: 30, padding: "20px 24px", borderRadius: 24, background: "rgba(245,241,232,.06)", border: `2px solid ${another > 0 ? `rgba(251,146,60,${0.3 + another * 0.6})` : C.line}`, boxShadow: another ? `0 0 ${40 * another}px rgba(251,146,60,.35)` : undefined, opacity: ramp(t, rollLand + 0.1, 0.3) }}>
            <Reply size={40} toks={[{ s: "It's" }, { s: "in" }, { s: "France,", color: C.orange, k: france }, ...restB.map((s, i) => ({ s, k: pop(t, chunkT[i], 12) }))]} />
          </div>
        </div>
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "pop", 0.7], [0.02, "whoosh", 0.35], [0.4, "tick", 0.4], [W(0, 2), "click", 0.6], [W(0, 5), "impact", 0.6], [W(0, 5) + 0.05, "error", 0.3],
  [LS(1) - 0.15, "whoosh", 0.5], [W(1, 2), "chime", 0.6], [W(1, 5), "pop", 0.6], [W(1, 6), "tick", 0.7], [W(1, 7), "tick", 0.6],
  [W(2, 2), "whoosh", 0.4], [W(2, 3), "riser", 0.35], ...[0, 1, 2, 3, 4, 5].map((i) => [W(2, 3) + i * 0.16, "tick", 0.35] as [number, string, number]), [W(2, 6) + 0.1, "stamp", 0.4],
  [W(3, 0), "pop", 0.5], [W(3, 3), "riser", 0.3], [W(3, 4), "chime", 0.5],
  [W(4, 1), "pop", 0.6], [W(4, 3), "tick", 0.5], [W(4, 3) + 0.08, "tick", 0.5], [W(4, 3) + 0.16, "tick", 0.5], [W(4, 3) + 0.24, "tick", 0.5],
  [W(5, 3), "pop", 0.7], [W(5, 4), "click", 0.5], [W(5, 7), "tick", 0.5],
  [W(6, 1), "zap", 0.35], [W(6, 1) + 0.1, "whoosh", 0.35], [W(6, 7), "chime", 0.5], [W(6, 8) + 0.05, "stamp", 0.5],
  [W(7, 1), "pop", 0.5], [W(7, 1) + 0.33, "pop", 0.5], [W(7, 1) + 0.66, "pop", 0.5],
  [LS(8), "rewind", 0.4], [W(8, 3), "whoosh", 0.4], [W(8, 3) + 0.1, "riser", 0.35],
  [W(9, 0) - 0.1, "pop", 0.5], ...[0, 1, 2, 3].map((i) => [W(9, 0) + i * 0.15, "tick", 0.55] as [number, string, number]), [W(9, 2), "impact", 0.55], [W(9, 2) + 0.05, "stamp", 0.4],
  [W(9, 3), "key", 0.6], [W(9, 4), "key", 0.6], [W(9, 5), "key", 0.6], [W(9, 5) + 0.14, "key", 0.6], [W(9, 5) + 0.28, "key", 0.6],
  [LS(10) - 0.15, "whoosh", 0.5], ...[0, 1, 2, 3].map((i) => [W(10, 0) + i * 0.15, "tick", 0.55] as [number, string, number]), [W(10, 2), "impact", 0.65], [W(10, 2) + 0.05, "error", 0.3], [W(10, 3), "pop", 0.5],
  ...REPLY_B.slice(3).map((_, i) => [W(11, 2) + i * 0.17, "key", 0.55] as [number, string, number]),
  [W(11, 5), "riser", 0.4], [W(11, 6) + 0.15, "impact", 0.5], [W(11, 6) + 0.2, "chime", 0.6],
];

export const AiTemperature: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Machine />
    <Paths />
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
