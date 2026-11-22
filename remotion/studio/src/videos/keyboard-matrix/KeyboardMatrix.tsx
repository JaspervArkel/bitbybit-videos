/*
 * STORYBOARD — "Pressing a key doesn't send a letter" (pillar E; ending: comment_prompt, E6; posts 01:00+1, E7)
 * One world: an 18-key keyboard block (QWERTY rows Q-Y / A-H / Z-N). The same block is x-rayed into its wire matrix,
 * scanned by its controller chip, pressed, shrunk into the operating system, and finally re-labelled as AZERTY.
 * The code shown, 0x04, is the real USB HID usage ID of the key in the "A" position (HID Usage Tables, Keyboard page).
 * L0  "Pressing a key doesn't send a letter."   HOOK (frame 0 complete): "Pressing a key / doesn't send a" + "letter"
 *                                              (orange mono) + the keyboard with A already pressing (bounces from frame 0)
 *                                              and a struck-out "A" bubble; strike pulses on "letter".
 * L1  "Under your keys is a grid of wires:"    headline out; keycaps turn x-ray on "Under"; wires draw on "grid".
 * L2  "rows and columns."                      row wires flash + R1-R3 labels on "rows"; column wires + C1-C6 on "columns".
 * L3  "A small chip scans it hundreds of times a second,"  controller chip pops under the grid on "chip"; rows strobe fast
 *                                              on "scans"; "hundreds × / second" pill on "hundreds".
 * L4  "powering one row at a time"             strobe slows to one visible row at a time; "ROW ON" tag follows it.
 * L5  "and checking which columns respond."    sense LEDs on the chip sweep left→right on "checking"; all stay dark.
 * L6  "Press A, and its row and column connect."  A key x-ray cap presses on "A"; row 2 holds on "row";
 *                                              column 1 lights on "column"; spark at the crossing + "R2 × C1" on "connect".
 * L7  "The chip sends a scan code,"            chip display switches to "send 0x04" on "sends"; LED blinks.
 * L8  "a number for that physical key."        big "0x04" pill pops above the grid on "number"; dashed link to the A key
 *                                              outline on "physical".
 * L9  "Your operating system turns that number into a letter"  keyboard shrinks up; OS panel slides in below; 0x04 flies
 *                                              into its input on "number"; output "a" pops on "letter".
 * L10 "using your layout."                     the layout card "QWERTY" between them glows on "layout".
 * L11 "That's why switching to AZERTY moves letters"  layout card flips to "AZERTY" on "AZERTY"; key labels A↔Q and Z↔W fly
 *                                              to their AZERTY spots on "moves"; output becomes "q" (orange).
 * L12 "without touching the keyboard."         keyboard outline glows green, "same keys · same wires · same 0x04" pill.
 * L13 "Which keyboard layout do you type on?"  END (comment_prompt): the question big on screen, layout chips
 *                                              QWERTY / AZERTY / QWERTZ pop below; a mini keyboard cycles through the three layouts.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, LS } = T;
export const KEYBOARD_MATRIX_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/keyboard-matrix/${p}`);

// ---------- layout data ----------
const QWERTY = ["QWERTY", "ASDFGH", "ZXCVBN"];
const AZERTY = ["AZERTY", "QSDFGH", "WXCVBN"];
const posOf = (grid: string[], ch: string): [number, number] => {
  for (let r = 0; r < grid.length; r++) { const c = grid[r].indexOf(ch); if (c >= 0) return [r, c]; }
  return [0, 0];
};
const CELL = 130, KEY = 112, COLS = 6, ROWS = 3;
const GW = COLS * CELL - (CELL - KEY); // 762
const kc = (i: number) => i * CELL + KEY / 2; // key centre within the world
const CHIP_Y = 470, CHIP_H = 110;
const AR = 1, AC = 0; // physical position of the "A" key (row 2, column 1)

// ---------- timing logic ----------
const activeRow = (t: number) => {
  if (t < W(3, 3)) return -1;
  if (t < LS(4)) return Math.floor((t - W(3, 3)) / 0.11) % 3;
  if (t < W(6, 4)) return Math.floor((t - LS(4)) / 0.42) % 3;
  if (t < LS(9)) return AR;
  return -1;
};
const pressA = (t: number) => {
  if (t < LS(1)) return 0.5 + 0.5 * Math.cos(t * 6.5); // hook: bouncing from frame 0
  if (t < LS(1) + 0.3) return 0.5 + 0.5 * Math.cos(LS(1) * 6.5) * (1 - ramp(t, LS(1), 0.3));
  if (t >= W(6, 1) && t < LS(9)) return pop(t, W(6, 1), 12, 260);
  return 0;
};

// ---------- keyboard world ----------
const Keycap: React.FC<{ x: number; y: number; press: number; xray: number; glow?: number }> = ({ x, y, press, xray, glow = 0 }) => (
  <div style={{
    position: "absolute", left: x, top: y + press * 9, width: KEY, height: KEY, borderRadius: 22,
    background: `linear-gradient(rgba(36,52,92,${1 - xray * 0.8}), rgba(22,34,66,${1 - xray * 0.8}))`,
    border: `3px solid rgba(245,241,232,${0.22 + glow * 0.6})`,
    boxShadow: `0 ${12 - press * 9}px 0 rgba(4,8,20,${0.9 * (1 - xray * 0.8)})${glow ? `, 0 0 ${40 * glow}px rgba(74,222,128,.7)` : ""}`,
  }} />
);

const World: React.FC = () => {
  const t = useT();
  // world placement: hook → matrix → OS (shrunk)
  const toMatrix = ramp(t, LS(1) - 0.1, 0.6, INOUT);
  const toOS = ramp(t, LS(9) - 0.1, 0.7, INOUT);
  const scale = lerp(1, 0.6, toOS);
  const top = lerp(lerp(610, 600, toMatrix), 455, toOS);
  const left = (1080 - GW) / 2; // transformOrigin is the top centre
  const out = ramp(t, LS(13) - 0.2, 0.35);
  if (out >= 1) return null;

  const xray = ramp(t, W(1, 0), 0.5) * (1 - ramp(t, LS(9), 0.5));
  const wires = ramp(t, W(1, 5) - 0.05, 0.7, INOUT) * (1 - ramp(t, LS(9) + 0.2, 0.5) * 0.85);
  const rowsK = pop(t, W(2, 0), 10) * (1 - ramp(t, W(2, 2), 0.3));
  const colsK = pop(t, W(2, 2), 10) * (1 - ramp(t, W(3, 2), 0.3));
  const rowLbl = pop(t, W(2, 0), 12) * (1 - ramp(t, LS(9), 0.3));
  const colLbl = pop(t, W(2, 2), 12) * (1 - ramp(t, LS(9), 0.3));
  const chip = pop(t, W(3, 2), 11);
  const ar = activeRow(t);
  const p = pressA(t);
  const colLit = t >= W(6, 6) && t < LS(9) + 0.3 ? pop(t, W(6, 6), 10) : 0;
  const spark = pop(t, W(6, 7), 9, 220) * (1 - ramp(t, LS(8), 0.4));
  const send = t >= W(7, 2);
  const swap = ramp(t, W(11, 5) - 0.05, 0.75, INOUT);
  const same = pop(t, W(12, 1), 11);
  const outlineA = pop(t, W(8, 4), 12) * (1 - ramp(t, LS(9), 0.3));
  // sense LED sweep (L5)
  const sweep = t >= W(5, 1) && t < LS(6) ? Math.floor((t - W(5, 1)) / 0.12) % COLS : -1;

  const letters = QWERTY.join("").split("");
  return (
    <div style={{ position: "absolute", left, top, width: GW, scale: `${scale * lerp(1, 0.9, out)}`, transformOrigin: "50% 0", opacity: 1 - out }}>
      {/* wires */}
      <svg width={GW + 200} height={CHIP_Y + 200} style={{ position: "absolute", left: -100, top: -60, overflow: "visible" }}>
        <g transform="translate(100,60)">
          {[...Array(ROWS)].map((_, r) => {
            const on = ar === r;
            const lx = -30 - r * 20;
            const d = `M${GW + 30} ${kc(r)} H${lx} V${CHIP_Y}`;
            const col = on ? C.green : `rgba(74,222,128,${0.4 + 0.6 * rowsK})`;
            return (
              <path key={`r${r}`} d={d} pathLength={1} fill="none" stroke={col} strokeWidth={on ? 10 : 6 + 4 * rowsK} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={1} strokeDashoffset={1 - wires} style={{ filter: on || rowsK > 0.1 ? `drop-shadow(0 0 12px ${C.green})` : undefined }} />
            );
          })}
          {[...Array(COLS)].map((_, c) => {
            const lit = c === AC ? colLit : 0;
            const sw = sweep === c ? 1 : 0;
            const base = 0.4 + 0.6 * colsK;
            return (
              <path key={`c${c}`} d={`M${kc(c)} -30 V${CHIP_Y}`} pathLength={1} fill="none"
                stroke={lit > 0.05 ? C.green : sw ? "rgba(245,241,232,.8)" : `rgba(245,241,232,${base * 0.7})`}
                strokeWidth={lit > 0.05 ? 10 : 5 + 4 * colsK} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - wires}
                style={{ filter: lit > 0.05 ? `drop-shadow(0 0 14px ${C.green})` : undefined }} />
            );
          })}
          {/* switch contacts at crossings */}
          {wires > 0.6 && [...Array(ROWS)].map((_, r) => [...Array(COLS)].map((_, c) => {
            const isA = r === AR && c === AC;
            const closed = isA && p > 0.5 && t >= W(6, 1);
            return <circle key={`j${r}${c}`} cx={kc(c)} cy={kc(r)} r={closed ? 18 : 11} fill={closed ? C.green : "#0A1226"} stroke={closed ? "#fff" : "rgba(245,241,232,.6)"} strokeWidth={4} opacity={(wires - 0.6) / 0.4} />;
          }))}
          {spark > 0.01 && (
            <g transform={`translate(${kc(AC)},${kc(AR)})`} opacity={Math.min(1, spark * 1.5)}>
              {[...Array(8)].map((_, i) => (
                <rect key={i} x={-4} y={-30 - 40 * spark} width={8} height={26} rx={4} fill="#fff" transform={`rotate(${i * 45})`} />
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* keycaps + legends */}
      {[...Array(ROWS)].map((_, r) => [...Array(COLS)].map((_, c) => {
        const isA = r === AR && c === AC;
        return <Keycap key={`k${r}${c}`} x={c * CELL} y={r * CELL} press={isA ? p : 0} xray={xray} glow={isA ? Math.max(outlineA, t < LS(1) ? 0.4 * p : 0) : same * 0.25} />;
      }))}
      {letters.map((ch) => {
        const [r0, c0] = posOf(QWERTY, ch);
        const [r1, c1] = posOf(AZERTY, ch);
        const moves = r0 !== r1 || c0 !== c1;
        const x = lerp(c0, c1, swap) * CELL, y = lerp(r0, r1, swap) * CELL;
        const arc = moves ? -Math.sin(swap * Math.PI) * 90 : 0;
        const onA = r0 === AR && c0 === AC && swap < 0.5;
        return (
          <div key={ch} style={{
            position: "absolute", left: x + (moves ? Math.sin(swap * Math.PI) * 40 : 0), top: y + arc + (onA ? p * 9 : 0), width: KEY, height: KEY,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 56,
            color: moves && swap > 0.02 ? C.orange : C.white, opacity: 1 - xray * 0.55, scale: `${moves ? 1 + 0.35 * Math.sin(swap * Math.PI) : 1}`,
            textShadow: moves && swap > 0.02 ? "0 0 30px rgba(251,146,60,.8)" : undefined, zIndex: moves ? 2 : 1,
          }}>{ch}</div>
        );
      })}
      {/* A key outline (L8) */}
      {outlineA > 0.01 && (
        <div style={{ position: "absolute", left: AC * CELL - 12, top: AR * CELL - 12 + p * 9, width: KEY + 24, height: KEY + 24, borderRadius: 30, border: `6px dashed ${C.green}`, opacity: outlineA, scale: `${lerp(1.6, 1, outlineA)}` }} />
      )}
      {/* row / column labels */}
      {rowLbl > 0.01 && [...Array(ROWS)].map((_, r) => (
        <div key={`rl${r}`} style={{ position: "absolute", left: GW + 40, top: kc(r) - 26, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: ar === r && t >= LS(4) ? C.navy : ar === r ? C.green : C.white, background: ar === r && t >= LS(4) ? C.green : undefined, borderRadius: 10, padding: "0 8px", marginLeft: -8, boxShadow: ar === r && t >= LS(4) ? "0 0 30px rgba(74,222,128,.7)" : undefined, opacity: rowLbl, translate: `${(1 - rowLbl) * 30}px 0px` }}>R{r + 1}</div>
      ))}
      {colLbl > 0.01 && [...Array(COLS)].map((_, c) => (
        <div key={`cl${c}`} style={{ position: "absolute", left: kc(c) - 40, width: 80, textAlign: "center", top: -96, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: c === AC && colLit > 0.05 ? C.green : C.white, opacity: colLbl, translate: `0px ${(1 - colLbl) * -20}px` }}>C{c + 1}</div>
      ))}
      {/* controller chip */}
      {chip > 0.01 && (
        <div style={{ position: "absolute", left: -70, top: CHIP_Y, width: GW + 140, height: CHIP_H, borderRadius: 24, background: "#0A1226", border: `5px solid ${send ? C.green : "rgba(245,241,232,.45)"}`, boxShadow: send ? "0 0 50px rgba(74,222,128,.4)" : "0 18px 50px rgba(0,0,0,.5)", opacity: Math.min(1, chip * 1.5) * (1 - ramp(t, LS(9) + 0.1, 0.5) * 0.3), scale: `${lerp(0.6, 1, chip)}`, translate: `${shake(t, W(7, 2), 6, 0.3)}px 0px` }}>
          {/* sense LEDs */}
          {[...Array(COLS)].map((_, c) => {
            const on = (c === AC && colLit > 0.05) || sweep === c;
            return <div key={c} style={{ position: "absolute", left: 70 + kc(c) - 11, top: -11, width: 22, height: 22, borderRadius: 11, background: c === AC && colLit > 0.05 ? C.green : sweep === c ? C.white : "#1E2A48", boxShadow: on ? `0 0 20px ${c === AC && colLit > 0.05 ? C.green : "#fff"}` : undefined }} />;
          })}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: send ? C.green : C.white }}>
            {send ? <>send <span style={{ color: C.navy, background: C.green, borderRadius: 10, padding: "0 14px" }}>0x04</span></> : t >= W(3, 3) ? <>scanning{".".repeat(1 + (Math.floor(t * 4) % 3))}</> : "keyboard chip"}
          </div>
        </div>
      )}
      {/* "same keyboard" pill (L12) */}
      {same > 0.01 && (
        <div style={{ position: "absolute", left: -200, right: -200, top: CHIP_Y + 10, display: "flex", justifyContent: "center", opacity: Math.min(1, same * 1.5), scale: `${lerp(0.6, 1, same)}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.navy, background: C.green, borderRadius: 26, padding: "10px 40px", whiteSpace: "nowrap", boxShadow: "0 0 60px rgba(74,222,128,.5)" }}>same keys · same 0x04</div>
        </div>
      )}
    </div>
  );
};

// ---------- hook headline + struck-out letter bubble ----------
const Hook: React.FC = () => {
  const t = useT();
  const k = 1 - ramp(t, LS(1) - 0.15, 0.3);
  if (k <= 0.001) return null;
  const strike = 1;
  return (
    <>
      <div style={{ position: "absolute", top: 165, left: 0, right: 0, textAlign: "center", opacity: k }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 88, lineHeight: 1.04, color: C.white, letterSpacing: -2 }}>Pressing a key<br />doesn't send a</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 140, lineHeight: 1.12, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 6), 10, 0.4)}px 0px` }}>letter</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080 + Math.sin(t * 3) * 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: k }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.dim }}>sends</div>
        <div style={{ position: "relative", width: 150, height: 150, borderRadius: 30, background: "rgba(10,18,38,.95)", border: `5px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 100, color: C.white, boxShadow: "0 0 40px rgba(251,146,60,.4)", scale: `${1 + 0.15 * pop(t, W(0, 6), 8) * (1 - ramp(t, W(0, 6) + 0.3, 0.3))}` }}>
          A
          <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 14, marginTop: -7, background: C.orange, borderRadius: 7, rotate: "-35deg", scale: `${strike} 1`, boxShadow: "0 0 24px rgba(251,146,60,.9)" }} />
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.orange }}>?</div>
      </div>
    </>
  );
};

// ---------- floating overlays: hundreds pill, R2 × C1, big 0x04 → OS panel ----------
const Overlays: React.FC = () => {
  const t = useT();
  const hund = pop(t, W(3, 5), 10) * (1 - ramp(t, LS(5) - 0.2, 0.3));
  const rc = pop(t, W(6, 7), 11) * (1 - ramp(t, LS(7) + 0.4, 0.3));
  const big = pop(t, W(8, 1), 10);
  const fly = ramp(t, W(9, 4), 0.7, INOUT);
  const osIn = pop(t, LS(9), 12) * (1 - ramp(t, LS(13) - 0.2, 0.35));
  const outA = pop(t, W(9, 8), 10);
  const lay = pop(t, W(10, 2), 10);
  const flip = ramp(t, W(11, 4) - 0.05, 0.45, INOUT);
  const outQ = pop(t, W(11, 5), 9, 220);
  const azerty = flip > 0.5;
  const bigOut = ramp(t, LS(13) - 0.2, 0.3);
  // big code pill: above the grid (y 420) → OS input slot
  const toOS = ramp(t, LS(9) - 0.1, 0.7, INOUT);
  const bx = lerp(540, 215, fly), by = lerp(lerp(320, 285, toOS), 1082, fly), bs = lerp(1, 0.62, fly);
  return (
    <>
      {hund > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 335, display: "flex", justifyContent: "center", opacity: Math.min(1, hund * 1.5), scale: `${lerp(0.5, 1, hund)}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.navy, background: C.green, borderRadius: 20, padding: "8px 30px", boxShadow: "0 0 50px rgba(74,222,128,.5)" }}>hundreds × / second</div>
        </div>
      )}
      {rc > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 335, display: "flex", justifyContent: "center", opacity: Math.min(1, rc * 1.5), scale: `${lerp(0.5, 1, rc)}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.white, background: "rgba(10,18,38,.95)", border: `5px solid ${C.green}`, borderRadius: 22, padding: "6px 30px", boxShadow: "0 0 50px rgba(74,222,128,.4)" }}>
            <span style={{ color: C.green }}>R2</span> × <span style={{ color: C.green }}>C1</span> = A key
          </div>
        </div>
      )}
      {/* OS panel */}
      {osIn > 0.01 && (
        <div style={{ position: "absolute", left: 70, top: 900, width: 940, height: 400, borderRadius: 34, background: "rgba(10,18,38,.95)", border: "4px solid rgba(245,241,232,.3)", opacity: Math.min(1, osIn * 1.5), translate: `0px ${(1 - osIn) * 120}px` }}>
          <div style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.dim, letterSpacing: 2 }}>OPERATING SYSTEM</div>
          {/* layout card */}
          <div style={{ position: "absolute", left: 330, top: 140, width: 280, height: 170, perspective: 800 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 24, background: lay > 0.01 ? (azerty ? "rgba(251,146,60,.15)" : "rgba(74,222,128,.15)") : "rgba(245,241,232,.06)", border: `5px solid ${azerty ? C.orange : lay > 0.01 ? C.green : "rgba(245,241,232,.3)"}`, boxShadow: lay > 0.01 ? `0 0 ${30 + 20 * lay}px ${azerty ? "rgba(251,146,60,.5)" : "rgba(74,222,128,.45)"}` : undefined, rotate: `x ${Math.sin(flip * Math.PI) * 85}deg`, scale: `${1 + 0.1 * lay * (1 - ramp(t, W(10, 2) + 0.3, 0.4))}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.dim }}>layout</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 54, color: azerty ? C.orange : C.green }}>{azerty ? "AZERTY" : "QWERTY"}</div>
            </div>
          </div>
          {/* arrows */}
          {[260, 640].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 192, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.dim }}>→</div>)}
          {/* output letter */}
          <div style={{ position: "absolute", left: 730, top: 140, width: 170, height: 170, borderRadius: 26, border: `5px solid ${outQ > 0.01 ? C.orange : outA > 0.01 ? C.green : "rgba(245,241,232,.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,241,232,.05)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, color: outQ > 0.01 ? C.orange : C.white, scale: `${outQ > 0.01 ? lerp(0.3, 1, outQ) : lerp(0.3, 1, outA)}`, opacity: outA > 0.01 ? 1 : 0, translate: `${shake(t, W(11, 5), 10, 0.35)}px 0px` }}>{outQ > 0.01 ? "q" : "a"}</div>
          </div>
          <div style={{ position: "absolute", left: 40, top: 140, width: 210, height: 170, borderRadius: 26, border: "4px dashed rgba(245,241,232,.3)" }} />
        </div>
      )}
      {/* the big scan code */}
      {big > 0.01 && bigOut < 1 && (
        <div style={{ position: "absolute", left: bx, top: by, translate: "-50% 0%", opacity: Math.min(1, big * 1.5) * (1 - bigOut), scale: `${lerp(0.4, 1, big) * bs}`, transformOrigin: "50% 0" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.navy, background: C.green, borderRadius: 30, padding: "4px 36px", boxShadow: "0 0 70px rgba(74,222,128,.6)", whiteSpace: "nowrap" }}>0x04</div>
        </div>
      )}
    </>
  );
};

// ---------- ending: the question ----------
const Question: React.FC = () => {
  const t = useT();
  const a = LS(13);
  const q1 = pop(t, W(13, 0), 12);
  const q2 = pop(t, W(13, 2), 10);
  const q3 = pop(t, W(13, 5), 11);
  const chips: [string, string][] = [["QWERTY", C.green], ["AZERTY", C.orange], ["QWERTZ", "#60A5FA"]];
  const GRIDS = [QWERTY, AZERTY, ["QWERTZ", "ASDFGH", "YXCVBN"]];
  const cur = t < a + 1.0 ? -1 : Math.floor((t - a - 1.0) / 0.9) % 3;
  const grid = GRIDS[Math.max(0, cur)];
  const kb = pop(t, a + 0.5, 12);
  const ch = cur >= 0 ? pop(t, a + 1.0 + Math.floor((t - a - 1.0) / 0.9) * 0.9, 12, 220) : 1;
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", top: 330, left: 40, right: 40, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.06, color: C.white, letterSpacing: -2, opacity: Math.min(1, q1 * 1.5), translate: `0px ${(1 - q1) * 30}px` }}>Which keyboard</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", opacity: Math.min(1, q2 * 1.5), scale: `${lerp(0.6, 1, q2)}` }}>layout</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.06, color: C.white, letterSpacing: -2, opacity: Math.min(1, q3 * 1.5), translate: `0px ${(1 - q3) * 30}px` }}>do you type on?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 28 }}>
        {chips.map(([txt, col], i) => {
          const k = pop(t, a + 0.25 + i * 0.22, 11);
          const tap = cur === i ? 1 : 0;
          return (
            <div key={txt} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: col, border: `5px solid ${col}`, borderRadius: 22, padding: "14px 26px", background: "rgba(10,18,38,.92)", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, k) * (1 + 0.08 * tap)}`, translate: `0px ${tap * 8}px`, boxShadow: `0 ${10 - tap * 8}px 0 rgba(4,8,20,.9)` }}>{txt}</div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: (1080 - 6 * 120 + 16) / 2, top: 1040, opacity: Math.min(1, kb * 1.5), scale: `${lerp(0.7, 1, kb)}` }}>
        {grid.map((row, r) => row.split("").map((L, c) => {
          const changed = cur > 0 && GRIDS[0][r][c] !== L;
          return (
            <div key={`${r}${c}`} style={{ position: "absolute", left: c * 120, top: r * 112, width: 104, height: 96, borderRadius: 18, background: "linear-gradient(#24345C,#162242)", border: `3px solid ${changed ? chips[cur][1] : "rgba(245,241,232,.22)"}`, boxShadow: "0 9px 0 rgba(4,8,20,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: changed ? chips[cur][1] : C.white, scale: `${changed ? lerp(1.3, 1, ch) : 1}` }}>{L}</div>
          );
        }))}
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.02, "key", 0.7],
  ...[...Array(3)].map((_, i) => [((2 * Math.PI) / 6.5) * (i + 0.5), "key", 0.55] as [number, string, number]),
  [W(0, 6), "error", 0.5],
  [LS(1) - 0.15, "whoosh", 0.6], [W(1, 0), "zap", 0.35], [W(1, 5), "riser", 0.35],
  [W(2, 0), "click", 0.6], [W(2, 2), "click", 0.6],
  [W(3, 2), "pop", 0.6], [W(3, 3), "zap", 0.45], ...[...Array(6)].map((_, i) => [W(3, 3) + 0.1 + i * 0.22, "tick", 0.3] as [number, string, number]), [W(3, 5), "pop", 0.55],
  ...[...Array(4)].map((_, i) => [LS(4) + i * 0.42, "tick", 0.5] as [number, string, number]),
  ...[...Array(6)].map((_, i) => [W(5, 1) + i * 0.12, "tick", 0.3] as [number, string, number]),
  [W(6, 1), "key", 0.9], [W(6, 4), "click", 0.5], [W(6, 6), "zap", 0.6], [W(6, 7), "chime", 0.6], [W(6, 7), "pop", 0.5],
  [W(7, 2), "enter", 0.6], [W(7, 4), "click", 0.5],
  [W(8, 1), "impact", 0.6], [W(8, 4), "pop", 0.5],
  [LS(9) - 0.1, "whoosh", 0.6], [W(9, 4), "whoosh", 0.45], [W(9, 8), "pop", 0.7],
  [W(10, 2), "chime", 0.5],
  [W(11, 4), "rewind", 0.45], [W(11, 5), "whoosh", 0.55], [W(11, 5) + 0.1, "error", 0.45], [W(11, 6) + 0.2, "pop", 0.5],
  [W(12, 1), "chime", 0.55],
  [LS(13) - 0.15, "whoosh", 0.6], [W(13, 0), "pop", 0.5], [W(13, 2), "stamp", 0.9], [W(13, 5), "pop", 0.5],
  ...[...Array(3)].map((_, i) => [LS(13) + 0.25 + i * 0.22, "key", 0.45] as [number, string, number]),
  ...[...Array(3)].map((_, i) => [LS(13) + 1.0 + i * 0.9, "click", 0.45] as [number, string, number]),
];

export const KeyboardMatrix: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <World />
    <Hook />
    <Overlays />
    <Question />
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
