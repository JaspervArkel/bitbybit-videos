/*
 * STORYBOARD — "0.1 + 0.2 isn't 0.3" (pillar A; ending: comment_prompt, E6; posts 01:00+1, E7)
 * One world: the number 0.1 on its way into the computer. It is written out in binary on an endless tape, squeezed into
 * a 52-cell register (rounded at the end), read back slightly off, added to 0.2, and finally shown as the famous result.
 * Real values (computed in Python): 0.1 in binary = 0.000110011001100…; the 52 stored fraction bits of 0.1 are
 * 1001 ×13 rounded up to …1010; the double nearest 0.1 is 0.1000000000000000055511…; 0.1 + 0.2 prints 0.30000000000000004.
 * L0  "Ask a computer for 0.1 plus 0.2."    HOOK (frame 0 complete): "0.1 + 0.2 =" + "0.30000000000000004" (orange mono)
 *                                           + a zoomed number line: green pin "0.3", orange pin "computer" just past it,
 *                                           pulse rings on the orange pin and the final "4" glowing from frame 0.
 * L1  "It says 0.30000000000000004."        the 15 zeros light up one by one ("15 zeros" counter); the "4" pops on "four".
 * L2  "Computers store decimals in binary." headline out; big "0.1" pops on "Computers" ("decimal" tag on "decimals");
 *                                           bit cells cascade under it on "binary".
 * L3  "And in binary, 0.1 is like one-third in decimal:"  "0.1" shrinks into card A "0.1 in binary" (empty tape + cursor);
 *                                           card B "1/3 in decimal" pops on "one-third"; its tape starts streaming 3s.
 * L4  "it never ends."                      tape B accelerates, "∞ never ends" chip slams on "never".
 * L5  "0.000110011… forever."               tape A types each binary digit as it is spoken; on "forever" it streams 0011
 *                                           endlessly and gets its own ∞ chip.
 * L6  "The computer has to round it off after 52 bits,"  card B out; tape A pours into a 2×26-cell register; on "round" a cut
 *                                           line + the overflowing tail; on "off" the tail falls and the last two cells
 *                                           flip 01→10 (orange); "52 bits" chip on "52".
 * L7  "so it stores a number very slightly off."  read-back value "0.1000000000000000055511…" types under the register;
 *                                           "555…" turns orange + shakes on "very slightly off"; "≠ 0.1" chip.
 * L8  "Add two slightly-off numbers"        scene: block "0.1" (+ tiny) pops on "Add"; block "0.2" (+ tiny) on "two"; "+" sign.
 * L9  "and the error shows."                the two tiny errors fly together and the result "0.30000000000000004" stamps in
 *                                           with the "4" orange on "error"; shake on "shows".
 * L10 "That's why programmers don't compare decimals with equals,"  code window types "0.1 + 0.2 == 0.3"; "==" glows
 *                                           orange on "with"; "false" stamps on "equals".
 * L11 "and why money is usually stored as whole cents."  receipt "$0.10 + $0.20" on "money"; turns into "10¢ + 20¢"
 *                                           on "whole"; "= 30¢ ✓" green on "cents".
 * L12 "What does your calculator say for 0.1 + 0.2?"  END (comment_prompt): question big on screen; a generic calculator
 *                                           whose display types "0.1+0.2=" and blinks "?".
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, LS, LE } = T;
export const FLOAT_POINT_THREE_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/float-point-three/${p}`);

const RESULT = "0.30000000000000004";
const MANT = "1001100110011001100110011001100110011001100110011010"; // real 52 fraction bits of 0.1 (rounded)
const MANT_TRUE = "1001".repeat(13); // before rounding
const STORED = "0.1000000000000000055511";

// ---------- hook ----------
const Hook: React.FC = () => {
  const t = useT();
  const k = 1 - ramp(t, LS(2) - 0.2, 0.3);
  if (k <= 0.001) return null;
  const zStart = W(1, 2) + 1.15; // "fifteen zeros" part of the spoken number
  const zLit = t < zStart ? 0 : Math.min(15, Math.floor((t - zStart) / 0.07) + 1);
  const four = pop(t, LE(1) - 0.45, 8, 240);
  const zc = pop(t, zStart, 12) * (1 - ramp(t, LS(2) - 0.4, 0.3));
  const glow = 0.6 + 0.4 * Math.sin(t * 7);
  // number line
  const breathe = 1 + 0.025 * Math.sin(t * 2.2);
  const ring = (t * 1.4) % 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <div style={{ position: "absolute", top: 175, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 124, lineHeight: 1.05, color: C.white, letterSpacing: -2 }}>
          <span style={{ color: C.green }}>0.1</span> + <span style={{ color: C.green }}>0.2</span> =
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 82, lineHeight: 1.5, color: C.orange, textShadow: "0 0 40px rgba(251,146,60,.5)", whiteSpace: "nowrap" }}>
          {RESULT.split("").map((ch, i) => {
            const isZero = i >= 3 && i < 18;
            const lit = isZero && i - 3 < zLit;
            const isFour = i === 18;
            return (
              <span key={i} style={{
                display: "inline-block",
                color: lit ? C.white : C.orange,
                translate: lit ? `0px ${-10 * (1 - ramp(t, zStart + (i - 3) * 0.07, 0.25))}px` : undefined,
                scale: isFour ? `${1 + 0.12 * glow * (t < LS(2) ? 1 : 0) + 0.28 * four * (1 - ramp(t, LE(1) - 0.2, 0.5))}` : undefined,
                textShadow: isFour ? `0 0 ${30 + 30 * glow}px rgba(251,146,60,.9)` : undefined,
              }}>{ch}</span>
            );
          })}
        </div>
        {zc > 0.01 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4, opacity: Math.min(1, zc * 1.5), scale: `${lerp(0.6, 1, zc)}` }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.navy, background: C.white, borderRadius: 14, padding: "2px 22px" }}>{zLit} zero{zLit === 1 ? "" : "s"}</div>
          </div>
        )}
      </div>
      {/* zoomed number line */}
      <div style={{ position: "absolute", left: 60, width: 960, top: 760, height: 470, borderRadius: 36, background: "rgba(10,18,38,.85)", border: "4px solid rgba(245,241,232,.18)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 32, color: C.dim, letterSpacing: 2 }}>ZOOMED IN ×10¹⁶</div>
        <div style={{ position: "absolute", inset: 0, scale: `${breathe}` }}>
          <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 6, borderRadius: 3, background: "rgba(245,241,232,.5)" }} />
          {[...Array(17)].map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 60 + i * 52, top: i % 4 === 0 ? 278 : 288, width: 4, height: i % 4 === 0 ? 50 : 30, background: "rgba(245,241,232,.4)" }} />
          ))}
          {/* green pin 0.3 */}
          <div style={{ position: "absolute", left: 268, top: 150, width: 120, textAlign: "center", translate: "-50% 0" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 58, color: C.green }}>0.3</div>
          </div>
          <div style={{ position: "absolute", left: 260, top: 228, width: 16, height: 90, borderRadius: 8, background: C.green, boxShadow: "0 0 30px rgba(74,222,128,.7)" }} />
          {/* orange pin */}
          <div style={{ position: "absolute", left: 690, top: 140, width: 300, textAlign: "center", translate: "-50% 0" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.orange }}>computer</div>
          </div>
          <div style={{ position: "absolute", left: 682, top: 300 - 48 - 0, width: 16, height: 66, translate: `0px ${Math.sin(t * 5) * 6}px`, borderRadius: 8, background: C.orange, boxShadow: "0 0 30px rgba(251,146,60,.8)" }} />
          <div style={{ position: "absolute", left: 690 - 60, top: 300 - 60, width: 120, height: 120, borderRadius: 60, border: `4px solid ${C.orange}`, opacity: 1 - ring, scale: `${0.3 + ring * 1.2}` }} />
          {/* gap bracket */}
          <div style={{ position: "absolute", left: 275, width: 408, top: 360, height: 26, borderLeft: `4px solid ${C.dim}`, borderRight: `4px solid ${C.dim}`, borderBottom: `4px solid ${C.dim}` }} />
          <div style={{ position: "absolute", left: 275, width: 408, top: 396, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.white }}>+0.00000000000000004</div>
        </div>
      </div>
    </div>
  );
};

// ---------- tapes (L2–L5) ----------
const Tape: React.FC<{ text: string; color: string; cursor?: boolean; width?: number; size?: number }> = ({ text, color, cursor = false, width = 860, size = 66 }) => {
  const t = useT();
  const cw = size * 0.6;
  const maxChars = Math.floor(width / cw) - 1;
  const shown = text.length > maxChars ? text.slice(text.length - maxChars) : text;
  const overflow = text.length > maxChars;
  return (
    <div style={{ position: "relative", width, height: size * 1.3, overflow: "hidden", WebkitMaskImage: overflow ? "linear-gradient(90deg, transparent 0, #000 140px)" : undefined }}>
      <div style={{ position: "absolute", left: 0, top: 0, fontFamily: MONO, fontWeight: 800, fontSize: size, lineHeight: 1.3, color, whiteSpace: "pre" }}>
        {shown}
        {cursor && <span style={{ opacity: Math.floor(t * 3) % 2 ? 0 : 1, color: C.white }}>▌</span>}
      </div>
    </div>
  );
};

const binarySpokenAt = (i: number) => W(5, 0) + 0.12 + i * ((W(5, 1) - W(5, 0) - 0.55) / 11); // 11 chars of "0.000110011"
const BIN = "0.000110011";
const binText = (t: number) => {
  if (t < W(5, 0)) return "0.";
  if (t < W(5, 1)) {
    let n = 0;
    for (let i = 0; i < BIN.length; i++) if (t >= binarySpokenAt(i)) n = i + 1;
    return BIN.slice(0, Math.max(2, n));
  }
  const extra = Math.floor((t - W(5, 1)) * 16);
  return BIN + "0011".repeat(Math.ceil((extra + 4) / 4)).slice(0, extra);
};
const thirdText = (t: number) => {
  if (t < W(3, 6)) return "0.";
  const rate = t < W(4, 1) ? 6 : 18;
  const base = Math.min(t, W(4, 1)) - W(3, 6);
  const n = Math.floor(base * 6 + Math.max(0, t - W(4, 1)) * rate) + 1;
  return "0." + "3".repeat(n);
};

const InfChip: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const t = useT();
  const k = pop(t, at, 9, 240);
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", right: -80, top: -86, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.navy, background: C.orange, borderRadius: 14, padding: "4px 18px", scale: `${lerp(2, 1, k)}`, opacity: Math.min(1, k * 1.5), translate: `${shake(t, at, 8, 0.35)}px 0px`, boxShadow: "0 0 40px rgba(251,146,60,.6)" }}>{text}</div>
  );
};

const Card: React.FC<{ title: React.ReactNode; k: number; top: number; children: React.ReactNode; border?: string }> = ({ title, k, top, children, border = "rgba(245,241,232,.25)" }) => (
  <div style={{ position: "absolute", left: 60, width: 960, top, height: 250, borderRadius: 32, background: "rgba(10,18,38,.92)", border: `4px solid ${border}`, opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - k) * 60}px`, scale: `${lerp(0.9, 1, k)}` }}>
    <div style={{ position: "absolute", left: 40, top: 26, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white }}>{title}</div>
    <div style={{ position: "absolute", left: 40, top: 110 }}>{children}</div>
  </div>
);

const BinaryWorld: React.FC = () => {
  const t = useT();
  const a = LS(2) - 0.1, b = LS(8);
  if (t < a - 0.2 || t > b + 0.2) return null;
  // L2: big 0.1 + bit cascade
  const big = pop(t, W(2, 0), 11);
  const dec = pop(t, W(2, 2), 12);
  const bits = ramp(t, W(2, 4) - 0.05, 0.4);
  const toCard = ramp(t, LS(3) - 0.05, 0.5, INOUT);
  const l2 = 1 - toCard;
  // L3: cards
  const cardA = ramp(t, LS(3) + 0.05, 0.45) * (1 - ramp(t, LS(6) + 0.2, 0.35));
  const cardB = pop(t, W(3, 6), 12) * (1 - ramp(t, LS(6) - 0.05, 0.35));
  // L6: register
  const reg = pop(t, LS(6), 12);
  const fill = ramp(t, LS(6) + 0.1, 1.0);
  const cut = pop(t, W(6, 4), 10);
  const fall = ramp(t, W(6, 6), 0.7);
  const flip = ramp(t, W(6, 6), 0.3);
  const c52 = pop(t, W(6, 8), 10);
  const tapeOut = ramp(t, LS(6) - 0.05, 0.4);
  // L7: read-back
  const readT = Math.max(0, t - LS(7) - 0.05);
  const readN = Math.min(STORED.length, Math.floor(readT * 28));
  const off = pop(t, W(7, 5), 9);
  const neq = pop(t, W(7, 7), 10);
  const exit = ramp(t, b - 0.2, 0.3);
  const flicker = (i: number) => (Math.floor(t * 14 + i * 7.3) % 2 ? "1" : "0");
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, scale: `${lerp(1, 1.1, exit)}`, filter: exit > 0 ? `blur(${exit * 12}px)` : undefined }}>
      {/* L2 big decimal */}
      {l2 > 0.01 && big > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", opacity: l2 * Math.min(1, big * 1.5) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 260, color: C.green, lineHeight: 1, scale: `${lerp(0.5, 1, big)}`, textShadow: "0 0 60px rgba(74,222,128,.45)" }}>0.1</div>
          <div style={{ display: "inline-block", marginTop: 20, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.navy, background: C.white, borderRadius: 14, padding: "2px 22px", opacity: Math.min(1, dec * 1.5), scale: `${lerp(0.6, 1, dec)}` }}>decimal</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 70 }}>
            {[...Array(10)].map((_, i) => {
              const k = ramp(t, W(2, 4) + i * 0.04, 0.25);
              return <div key={i} style={{ width: 76, height: 96, borderRadius: 16, border: `4px solid ${C.green}`, background: "rgba(74,222,128,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.white, opacity: bits * k, translate: `0px ${(1 - k) * 40}px` }}>{flicker(i)}</div>;
            })}
          </div>
          <div style={{ display: "inline-block", marginTop: 22, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.navy, background: C.green, borderRadius: 14, padding: "2px 22px", opacity: bits }}>binary</div>
        </div>
      )}
      {/* L3–L5 card A (0.1 in binary) */}
      {cardA > 0.01 && (
        <Card k={cardA} top={500} title={<><span style={{ fontFamily: MONO, color: C.green }}>0.1</span> in binary</>} border={t >= W(5, 0) && t < LS(6) ? C.green : "rgba(245,241,232,.25)"}>
          <div style={{ opacity: 1 - tapeOut, translate: `0px ${tapeOut * 160}px` }}>
            <Tape text={binText(t)} color={C.green} cursor={t < W(5, 1)} />
          </div>
          {t < LS(6) && <InfChip at={W(5, 1)} text="∞ forever" />}
        </Card>
      )}
      {/* card B (1/3 in decimal) */}
      {cardB > 0.01 && (
        <Card k={cardB} top={830} title={<><span style={{ fontFamily: MONO, color: C.orange }}>1/3</span> in decimal</>}>
          <Tape text={thirdText(t)} color={C.white} />
          <InfChip at={W(4, 1)} text="∞ never ends" />
        </Card>
      )}
      {/* L6 register */}
      {reg > 0.01 && (
        <div style={{ position: "absolute", left: 40, width: 1000, top: lerp(830, 600, ramp(t, LS(6) + 0.2, 0.5, INOUT)), opacity: Math.min(1, reg * 1.5), scale: `${lerp(0.8, 1, reg)}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.dim, letterSpacing: 2 }}>MEMORY</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 48, color: C.navy, background: C.green, borderRadius: 14, padding: "0 20px", opacity: Math.min(1, c52 * 1.5), scale: `${lerp(0.5, 1, c52)}`, boxShadow: "0 0 40px rgba(74,222,128,.5)" }}>52 bits</div>
          </div>
          {[0, 1].map((row) => (
            <div key={row} style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {[...Array(26)].map((_, c) => {
                const i = row * 26 + c;
                const k = ramp(t, LS(6) + 0.1 + i * 0.018, 0.15);
                const last = i >= 50;
                const ch = last && flip > 0.5 ? MANT[i] : MANT_TRUE[i];
                const hot = last && flip > 0.01;
                return (
                  <div key={c} style={{ width: 34.5, height: 54, borderRadius: 8, background: hot ? "rgba(251,146,60,.25)" : "rgba(74,222,128,.1)", border: `3px solid ${hot ? C.orange : "rgba(74,222,128,.6)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: hot ? C.orange : C.white, opacity: fill > 0 ? k : 0, rotate: hot ? `x ${Math.sin(flip * Math.PI) * 80}deg` : undefined }}>{ch}</div>
                );
              })}
            </div>
          ))}
          {/* overflow tail + cut */}
          {cut > 0.01 && fall < 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 4, opacity: Math.min(1, cut * 1.5) * (1 - fall), translate: `0px ${fall * fall * 260}px`, rotate: `${fall * 8}deg` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.orange }}>✂ 10011001100…</div>
            </div>
          )}
          {/* L7 read-back */}
          {t >= LS(7) && (
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.dim, letterSpacing: 2, marginBottom: 6 }}>READ BACK</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 54, whiteSpace: "nowrap", translate: `${shake(t, W(7, 5), 8, 0.4)}px 0px` }}>
                {STORED.slice(0, readN).split("").map((ch, i) => (
                  <span key={i} style={{ color: i >= 18 && off > 0.01 ? C.orange : C.white, textShadow: i >= 18 && off > 0.01 ? "0 0 30px rgba(251,146,60,.8)" : undefined }}>{ch}</span>
                ))}
                {readN >= STORED.length && <span style={{ color: off > 0.01 ? C.orange : C.white }}>…</span>}
              </div>
              <div style={{ display: "inline-block", marginTop: 20, fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.navy, background: C.orange, borderRadius: 16, padding: "2px 26px", opacity: Math.min(1, neq * 1.5), scale: `${lerp(1.8, 1, neq)}` }}>≠ 0.1</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- L8–L9: the sum ----------
const NumBlock: React.FC<{ v: string; k: number; top: number }> = ({ v, k, top }) => (
  <div style={{ position: "absolute", left: 240, width: 600, top, height: 150, borderRadius: 30, background: "rgba(10,18,38,.92)", border: "4px solid rgba(74,222,128,.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 26, opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * -200}px 0px` }}>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.green }}>{v}</div>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.navy, background: C.orange, borderRadius: 12, padding: "2px 14px" }}>+ tiny</div>
  </div>
);
const Sum: React.FC = () => {
  const t = useT();
  const b1 = pop(t, W(8, 0), 12);
  const b2 = pop(t, W(8, 1), 12);
  const plus = pop(t, W(8, 1) + 0.15, 10);
  const line = ramp(t, W(8, 3), 0.4);
  const res = pop(t, W(9, 2), 9, 220);
  const fly = ramp(t, W(9, 0), 0.5, INOUT);
  return (
    <Scene a={LS(8)} b={LS(10)}>
      <NumBlock v="0.1" k={b1} top={520} />
      <div style={{ position: "absolute", left: 120, top: 690, fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.white, opacity: Math.min(1, plus * 1.5), scale: `${lerp(0.4, 1, plus)}` }}>+</div>
      <NumBlock v="0.2" k={b2} top={700} />
      <div style={{ position: "absolute", left: 120, width: 840, top: 880, height: 8, borderRadius: 4, background: C.white, scale: `${line} 1`, transformOrigin: "0 50%" }} />
      {/* tiny errors fly down into the result */}
      {fly > 0.01 && fly < 1 && [0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: lerp(770, 860, fly), top: lerp(i ? 760 : 580, 960, fly), width: 30, height: 30, borderRadius: 15, background: C.orange, boxShadow: "0 0 30px rgba(251,146,60,.9)" }} />
      ))}
      {res > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", opacity: Math.min(1, res * 1.5), scale: `${lerp(1.6, 1, res)}`, translate: `${shake(t, W(9, 3), 12, 0.45)}px 0px` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 86, color: C.white, whiteSpace: "nowrap" }}>
            0.3<span style={{ color: C.dim }}>000000000000000</span><span style={{ color: C.orange, textShadow: "0 0 40px rgba(251,146,60,.9)" }}>4</span>
          </div>
          <div style={{ display: "inline-block", marginTop: 26, fontFamily: MONO, fontWeight: 800, fontSize: 50, color: C.navy, background: C.orange, borderRadius: 16, padding: "2px 26px" }}>error shows</div>
        </div>
      )}
    </Scene>
  );
};

// ---------- L10: code ----------
const Code: React.FC = () => {
  const t = useT();
  const code = "0.1 + 0.2 == 0.3";
  const n = Math.min(code.length, Math.max(0, Math.floor((t - W(10, 3)) * 18)));
  const eq = pop(t, W(10, 6), 10);
  const fal = pop(t, W(10, 7), 9, 240);
  const win = pop(t, LS(10), 13);
  return (
    <Scene a={LS(10)} b={LS(11)}>
      <div style={{ position: "absolute", left: 70, width: 940, top: 560, height: 560, borderRadius: 32, background: "#0A1226", border: "4px solid rgba(245,241,232,.25)", overflow: "hidden", opacity: Math.min(1, win * 1.5), scale: `${lerp(0.85, 1, win)}` }}>
        <div style={{ height: 70, background: "rgba(245,241,232,.08)", display: "flex", alignItems: "center", gap: 14, paddingLeft: 30 }}>
          {[C.orange, "#FACC15", C.green].map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}
          <div style={{ marginLeft: 20, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.dim }}>program</div>
        </div>
        <div style={{ position: "absolute", left: 50, top: 150, fontFamily: MONO, fontWeight: 800, fontSize: 72, color: C.white, whiteSpace: "pre" }}>
          <span style={{ color: C.dim }}>{"> "}</span>
          {code.slice(0, n).split("").map((ch, i) => {
            const isEq = i === 10 || i === 11;
            return <span key={i} style={{ color: isEq && eq > 0.01 ? C.orange : C.white, textShadow: isEq && eq > 0.01 ? "0 0 30px rgba(251,146,60,.9)" : undefined, display: "inline-block", scale: isEq ? `${1 + 0.3 * eq * (1 - ramp(t, W(10, 6) + 0.25, 0.3))}` : undefined }}>{ch}</span>;
          })}
          {n < code.length && <span style={{ opacity: Math.floor(t * 3) % 2 ? 0 : 1 }}>▌</span>}
        </div>
        {fal > 0.01 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 130, color: C.orange, border: `8px solid ${C.orange}`, borderRadius: 26, padding: "0 40px", rotate: "-6deg", scale: `${lerp(2.2, 1, fal)}`, opacity: Math.min(1, fal * 1.5), boxShadow: "0 0 60px rgba(251,146,60,.5)" }}>false</div>
          </div>
        )}
      </div>
    </Scene>
  );
};

// ---------- L11: money in cents ----------
const Money: React.FC = () => {
  const t = useT();
  const card = pop(t, W(11, 2), 12);
  const morph = ramp(t, W(11, 7), 0.4, INOUT);
  const ok = pop(t, W(11, 8), 9, 220);
  return (
    <Scene a={LS(11)} b={LS(12)}>
      <div style={{ position: "absolute", left: 140, width: 800, top: 540, height: 600, borderRadius: 30, background: C.white, opacity: Math.min(1, card * 1.5), translate: `0px ${(1 - card) * 120}px`, rotate: `${(1 - card) * -6}deg`, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "#5B6478", letterSpacing: 4 }}>RECEIPT</div>
        <div style={{ position: "absolute", top: 100, left: 60, right: 60, borderTop: "4px dashed #B8BECC" }} />
        <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 86, color: C.navy }}>
          <div style={{ opacity: 1 - morph, translate: `0px ${-morph * 40}px`, position: "absolute", left: 0, right: 0 }}>$0.10 + $0.20</div>
          <div style={{ opacity: morph, translate: `0px ${(1 - morph) * 40}px`, position: "absolute", left: 0, right: 0, color: "#15803D" }}>10¢ + 20¢</div>
        </div>
        <div style={{ position: "absolute", top: 320, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 110, color: "#15803D", opacity: Math.min(1, ok * 1.5), scale: `${lerp(1.8, 1, ok)}` }}>= 30¢ ✓</div>
        <div style={{ position: "absolute", top: 480, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 36, color: "#5B6478", opacity: ok }}>whole numbers, exact</div>
      </div>
    </Scene>
  );
};

// ---------- L12: the question ----------
const Question: React.FC = () => {
  const t = useT();
  const a = LS(12);
  const q1 = pop(t, W(12, 0), 12);
  const q2 = pop(t, W(12, 3), 10);
  const q3 = pop(t, W(12, 6), 10);
  const calc = pop(t, a + 0.4, 12);
  const disp = "0.1+0.2=";
  const n = Math.min(disp.length, Math.max(0, Math.floor((t - a - 0.8) * 9)));
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", top: 230, left: 40, right: 40, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.06, color: C.white, letterSpacing: -2, opacity: Math.min(1, q1 * 1.5), translate: `0px ${(1 - q1) * 30}px` }}>What does your</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.1, color: C.green, letterSpacing: -2, opacity: Math.min(1, q2 * 1.5), scale: `${lerp(0.6, 1, q2)}` }}>calculator say?</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, lineHeight: 1.25, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", opacity: Math.min(1, q3 * 1.5), scale: `${lerp(0.6, 1, q3)}` }}>0.1 + 0.2</div>
      </div>
      <div style={{ position: "absolute", left: 300, width: 480, top: 760, height: 560, borderRadius: 50, background: "linear-gradient(#24345C,#162242)", border: "4px solid rgba(245,241,232,.25)", boxShadow: "0 20px 0 rgba(4,8,20,.9)", opacity: Math.min(1, calc * 1.5), scale: `${lerp(0.7, 1, calc)}`, translate: `0px ${Math.sin(t * 2.4) * 6}px` }}>
        <div style={{ position: "absolute", left: 36, right: 36, top: 36, height: 130, borderRadius: 22, background: "#0E2A1C", border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, fontFamily: MONO, fontWeight: 800, fontSize: 62, color: C.green }}>
          {disp.slice(0, n)}<span style={{ color: C.orange, opacity: n >= disp.length && Math.floor(t * 3) % 2 ? 0 : 1 }}>{n >= disp.length ? "?" : "▌"}</span>
        </div>
        {[...Array(12)].map((_, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          const lbl = ["7", "8", "9", "+", "4", "5", "6", "−", "1", "2", "0", "="][i];
          const pressed = (lbl === "1" && n === 3) || (lbl === "+" && n === 4) || (lbl === "2" && n === 7) || (lbl === "=" && n === 8 && t - a - 0.8 < 8 / 9 + 0.3);
          return <div key={i} style={{ position: "absolute", left: 36 + c * 104, top: 200 + r * 112, width: 92, height: 96, borderRadius: 20, background: lbl === "=" ? C.orange : "rgba(245,241,232,.1)", border: "3px solid rgba(245,241,232,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: lbl === "=" ? C.navy : C.white, translate: `0px ${pressed ? 6 : 0}px` }}>{lbl}</div>;
        })}
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
const tick = (at: number, n: number, gap: number, name = "tick", vol = 0.35) => [...Array(n)].map((_, i) => [at + i * gap, name, vol] as [number, string, number]);
const SFX: [number, string, number][] = [
  [0, "impact", 0.55], [0.05, "error", 0.35], ...tick(0.3, 3, 0.72, "pop", 0.25),
  [W(1, 1), "click", 0.5], ...tick(W(1, 2) + 1.15, 15, 0.07, "tick", 0.3), [LE(1) - 0.45, "error", 0.6],
  [LS(2) - 0.2, "whoosh", 0.6], [W(2, 0), "pop", 0.6], [W(2, 2), "click", 0.5], ...tick(W(2, 4), 10, 0.04, "key", 0.3),
  [LS(3) - 0.05, "whoosh", 0.45], [W(3, 3), "click", 0.5], [W(3, 6), "pop", 0.6], ...tick(W(3, 6) + 0.2, 5, 0.17, "tick", 0.25),
  [W(4, 1), "stamp", 0.7], [W(4, 2), "riser", 0.3],
  ...[...Array(11)].map((_, i) => [binarySpokenAt(i), "key", 0.45] as [number, string, number]),
  [W(5, 1), "stamp", 0.7], [W(5, 1) + 0.1, "vortex", 0.3],
  [LS(6) - 0.05, "whoosh", 0.55], ...tick(LS(6) + 0.1, 8, 0.12, "tick", 0.3), [W(6, 4), "zap", 0.5], [W(6, 6), "rewind", 0.4], [W(6, 6) + 0.2, "error", 0.4], [W(6, 8), "pop", 0.6],
  ...tick(LS(7) + 0.05, 6, 0.14, "key", 0.3), [W(7, 5), "error", 0.5], [W(7, 7), "stamp", 0.6],
  [LS(8) - 0.15, "whoosh", 0.6], [W(8, 0), "pop", 0.6], [W(8, 1), "pop", 0.6], [W(8, 3), "click", 0.5],
  [W(9, 0), "whoosh", 0.4], [W(9, 2), "impact", 0.7], [W(9, 3), "error", 0.5],
  [LS(10) - 0.15, "whoosh", 0.6], ...tick(W(10, 3), 8, 0.11, "key", 0.35), [W(10, 6), "zap", 0.5], [W(10, 7), "stamp", 0.85],
  [LS(11) - 0.15, "whoosh", 0.6], [W(11, 2), "printer", 0.4], [W(11, 7), "click", 0.5], [W(11, 8), "chime", 0.6],
  [LS(12) - 0.15, "whoosh", 0.6], [W(12, 0), "pop", 0.5], [W(12, 3), "pop", 0.55], [W(12, 6), "stamp", 0.8],
  ...[...Array(8)].map((_, i) => [LS(12) + 0.8 + i / 9, "key", 0.4] as [number, string, number]), [LS(12) + 0.8 + 8 / 9 + 0.1, "chime", 0.45],
];

export const FloatPointThree: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <BinaryWorld />
    <Sum />
    <Code />
    <Money />
    <Question />
    <Captions lines={T.LINES} skip={[0, 1]} />
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
