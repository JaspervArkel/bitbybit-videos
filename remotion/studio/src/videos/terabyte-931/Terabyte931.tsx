/*
 * STORYBOARD — "Your 1 TB drive shows 931 GB" (backlog n=5, ending: implication)
 * One world: the same drive's bytes, measured with two rulers (green = powers of ten, orange = powers of two).
 * L0  "You bought a one-terabyte drive."      HOOK (frame 0 complete): headline "Your 1 TB drive shows / 931 GB";
 *                                              a 1 TB drive box → cable → a generic disk tile reading 931 GB. LED blinks,
 *                                              cable pulse moves, "−69 GB?" chip pops at 0.3 s.
 * L1  "Windows says 931 gigabytes. Nothing's missing."  "931" → tile shakes; "Nothing's" → −69 GB? struck out, "missing: 0 bytes ✓".
 * L2  "Drive makers count in powers of ten:"   green unit chain B→KB→MB→GB→TB pops chip by chip, "×1,000" between.
 * L3  "a terabyte is one trillion bytes."      big green counter rolls to 1,000,000,000,000 on "trillion"; "bytes" tag.
 * L4  "Windows counts in powers of two:"       chain re-colours orange, labels flip to "×1,024".
 * L5  "its gigabyte is 1,073,741,824 bytes."   two GB bars: green 1,000,000,000 vs orange typing 1,073,741,824 digit by digit,
 *                                              orange bar grows 7.4 % longer; "= 2³⁰" chip on "bytes".
 * L6  "Divide a trillion by that, and you get 931."  the drive as one long bar; green ruler above (0…1,000 GB);
 *                                              orange blocks fill it, counter 0→931 lands on "931"; equation on top.
 * L7  "Same bytes, different ruler."           bar flashes white on "bytes"; both end labels slam in on "different ruler".
 * L8  "The binary unit even has its own name," big "931 GB" label, "binary unit" tag.
 * L9  "the gibibyte, but almost nobody uses it." an orange "i" drops in → "931 GiB" + definition; on "nobody" it falls out again.
 * L10 "So a two-terabyte drive shows 1,862."   END (implication): 1 TB → 931 GB row, 2 TB → 1,862 GB row,
 *                                              takeaway "Same bytes. Different ruler." holds to the end. No CTA.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cable, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 1.5);
const { W, WE, LS } = T;
export const TERABYTE_931_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/terabyte-931/${p}`);

// ---------- building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);

const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

/** physical drive: rounded box with label and blinking LED */
const DriveBox: React.FC<{ label: string; color?: string; w?: number; sub?: string }> = ({ label, color = C.green, w = 340, sub = "SSD" }) => {
  const t = useT();
  const h = w * 0.62;
  const led = 0.35 + 0.65 * (Math.sin(t * 11) > 0.2 ? 1 : 0);
  return (
    <div style={{ width: w, height: h, position: "relative", borderRadius: 30, background: "linear-gradient(160deg,#1B2D55,#0C1832)", border: `5px solid ${color}`, boxShadow: `0 0 60px ${color}44, 0 30px 80px rgba(0,0,0,.5)` }}>
      <div style={{ position: "absolute", left: 26, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: w * 0.075, color: C.dim, letterSpacing: 3 }}>{sub}</div>
      <div style={{ position: "absolute", right: 26, top: 28, width: 20, height: 20, borderRadius: 10, background: color, opacity: led, boxShadow: `0 0 ${20 * led}px ${color}` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: w * 0.25, color }}>{label}</div>
      <div style={{ position: "absolute", left: 26, right: 26, bottom: 20, height: 10, borderRadius: 5, background: `repeating-linear-gradient(90deg, ${color}66 0 14px, transparent 14px 24px)` }} />
    </div>
  );
};

/** generic file-manager disk tile */
const DiskTile: React.FC<{ value: string; w?: number }> = ({ value, w = 430 }) => {
  const t = useT();
  const shimmer = (t * 0.5) % 1;
  return (
    <div style={{ width: w, position: "relative", borderRadius: 30, background: "rgba(22,33,64,.97)", border: `3px solid ${C.line}`, padding: "24px 28px", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width={56} height={44} viewBox="0 0 56 44"><rect x={3} y={8} width={50} height={30} rx={7} fill="none" stroke={C.white} strokeWidth={4} /><circle cx={43} cy={23} r={4} fill={C.green} /><rect x={11} y={20} width={20} height={6} rx={3} fill={C.white} opacity={0.5} /></svg>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.white }}>Disk (D:)</div>
      </div>
      <div style={{ marginTop: 20, height: 26, borderRadius: 13, background: "rgba(245,241,232,.1)", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "12%", background: C.green, borderRadius: 13 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, width: 80, left: `${shimmer * 120 - 10}%`, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)" }} />
      </div>
      <div style={{ marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.dim }}>total size</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 82, color: C.orange, lineHeight: 1.1, textShadow: "0 0 40px rgba(251,146,60,.5)" }}>{value}</div>
    </div>
  );
};

const Check: React.FC<{ k: number; size?: number }> = ({ k, size = 70 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: C.green, color: C.navy, fontFamily: SANS, fontWeight: 900, fontSize: size * 0.62, display: "flex", alignItems: "center", justifyContent: "center", scale: `${lerp(0.2, 1, k)}`, opacity: Math.min(1, k * 2), boxShadow: `0 0 50px ${C.green}88`, flex: "none" }}>✓</div>
);

/** digits revealed left→right (k 0..1), unrevealed digits flicker dim */
const Typed: React.FC<{ text: string; k: number; color: string; size: number }> = ({ text, k, color, size }) => {
  const t = useT();
  const f = Math.floor(t * 30);
  const digits = text.replace(/[^0-9]/g, "").length;
  let seen = 0;
  return (
    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        if (!/[0-9]/.test(ch)) return <span key={i} style={{ color: seen / digits < k ? color : "rgba(245,241,232,.3)" }}>{ch}</span>;
        const idx = seen++;
        const done = idx / digits < k;
        return <span key={i} style={{ color: done ? color : "rgba(245,241,232,.3)" }}>{done ? ch : String((idx * 7 + f) % 10)}</span>;
      })}
    </span>
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const q = pop(t, 0.3, 12);
  const nothing = W(1, 4);
  const strike = ramp(t, nothing, 0.25);
  const ok = pop(t, nothing + 0.15, 10);
  const sh = shake(t, W(1, 2), 14, 0.5);
  const glow = pop(t, W(1, 2), 10);
  return (
    <Scene a={0} b={LS(2)} enter={false}>
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>Your 1 TB drive shows</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 156, lineHeight: 1.1, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", scale: `${1 + glow * 0.04 * (1 - ramp(t, W(1, 3), 0.4))}` }}>931 GB</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 690, translate: `0px ${Math.sin(t * 2.2) * 8}px` }}>
        <DriveBox label="1 TB" w={360} />
      </div>
      <Cable x1={430} y1={800} x2={580} y2={800} p={1} />
      <div style={{ position: "absolute", left: 590, top: 620, translate: `${sh}px 0px`, scale: `${lerp(0.97, 1, ramp(t, 0, 1.5, INOUT))}` }}>
        <DiskTile value="931 GB" w={420} />
      </div>
      <Center y={1100} style={{ gap: 26 }}>
        <div style={{ position: "relative", opacity: Math.min(1, q * 1.5) * (1 - ramp(t, nothing + 0.5, 0.3)), scale: `${lerp(0.4, 1, q)}` }}>
          <Pill text="−69 GB ?" color={C.orange} size={56} />
          <div style={{ position: "absolute", left: -10, top: "48%", height: 8, width: `${strike * 105}%`, background: C.white, borderRadius: 4 }} />
        </div>
        {ok > 0 && (
          <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 22, opacity: ok, scale: `${lerp(0.5, 1, ok)}` }}>
            <Check k={ok} size={84} />
            <Pill text="missing: 0 bytes" color={C.green} size={56} />
          </div>
        )}
      </Center>
    </Scene>
  );
};

const UNITS = ["B", "KB", "MB", "GB", "TB"];
const Chain: React.FC<{ y: number; times: number[]; color: string; mult: string; flip?: number }> = ({ y, times, color, mult, flip = 0 }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 0 }}>
      {UNITS.map((u, i) => {
        const k = pop(t, times[i] ?? 0, 12);
        const kx = i > 0 ? pop(t, (times[i] ?? 0) - 0.08, 13) : 0;
        return (
          <React.Fragment key={u}>
            {i > 0 && (
              <div style={{ width: 62, display: "flex", flexDirection: "column", alignItems: "center", opacity: kx }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color, whiteSpace: "nowrap", translate: "0px -62px", scale: `${1 + flip * 0.15}`, position: "absolute" }}>{mult}</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color }}>›</div>
              </div>
            )}
            <div style={{ width: 150, height: 112, borderRadius: 26, border: `5px solid ${color}`, background: "rgba(10,18,38,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 52, color, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.4, 1, k)}`, boxShadow: `0 0 40px ${color}44` }}>{u}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Decimal: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(4);
  const tag = pop(t, a, 12);
  const chainT = [W(2, 2), W(2, 3), W(2, 4), W(2, 5), W(2, 6)];
  const cnt = ramp(t, W(3, 1), W(3, 4) + 0.25 - W(3, 1), (x) => x);
  const n = Math.min(1e12, Math.pow(10, lerp(0, 12, cnt)));
  const done = t >= W(3, 4) + 0.25;
  const bytesK = pop(t, W(3, 5), 11);
  const tbK = pop(t, W(3, 0), 12);
  return (
    <Scene a={a} b={b}>
      <Center y={455}><Pill text="drive makers: powers of 10" color={C.green} size={44} style={{ opacity: tag, scale: `${lerp(0.6, 1, tag)}` }} /></Center>
      <Chain y={680} times={chainT} color={C.green} mult="×1,000" />
      <Center y={900} style={{ opacity: tbK, flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.white }}>1 terabyte =</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: done ? C.green : C.white, textShadow: done ? `0 0 40px ${C.green}88` : undefined, scale: `${done ? 1 + (1 - pop(t, W(3, 4) + 0.25, 9)) * 0.1 : 1}` }}>{fmt(done ? 1e12 : n)}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.green, opacity: bytesK, scale: `${lerp(0.5, 1, bytesK)}` }}>bytes</div>
      </Center>
    </Scene>
  );
};

const Binary: React.FC = () => {
  const t = useT();
  const a = LS(4), b = LS(6);
  const tag = pop(t, a, 12);
  const chainT = [a - 0.1, W(4, 2), W(4, 3), W(4, 4), W(4, 5)];
  const flip = pop(t, W(4, 5), 9);
  const bars = pop(t, W(5, 0), 12);
  const typeK = ramp(t, W(5, 3), WE(5, 3) - W(5, 3) - 0.2, (x) => x);
  const grow = ramp(t, W(5, 3), WE(5, 3) - W(5, 3), INOUT);
  const pow2 = pop(t, W(5, 4), 10);
  const BW = 760;
  const row = (label: string, col: string, len: number, value: React.ReactNode, k: number) => (
    <div style={{ opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * 60}px 0px` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 10 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: col, width: 340 }}>{label}</div>
        {value}
      </div>
      <div style={{ height: 50, width: len, borderRadius: 14, background: `linear-gradient(90deg, ${col}, ${col}cc)`, boxShadow: `0 0 30px ${col}55` }} />
    </div>
  );
  return (
    <Scene a={a} b={b}>
      <Center y={455}><Pill text="Windows: powers of 2" color={C.orange} size={44} style={{ opacity: tag, scale: `${lerp(0.6, 1, tag)}` }} /></Center>
      <Chain y={680} times={chainT} color={C.orange} mult="×1,024" flip={flip} />
      <div style={{ position: "absolute", left: 90, top: 880, display: "flex", flexDirection: "column", gap: 34, opacity: bars }}>
        {row("drive maker GB", C.green, BW * 0.931, <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green }}>1,000,000,000</span>, bars)}
        {row("Windows \"GB\"", C.orange, lerp(BW * 0.931, BW, grow), <Typed text="1,073,741,824" k={typeK} color={C.orange} size={34} />, pop(t, W(5, 1), 12))}
      </div>
      <div style={{ position: "absolute", right: 70, top: 1205, opacity: pow2, scale: `${lerp(0.4, 1, pow2)}` }}>
        <Pill text={<>= 2<sup style={{ fontSize: 30 }}>30</sup></>} color={C.orange} size={50} />
      </div>
    </Scene>
  );
};

const Divide: React.FC = () => {
  const t = useT();
  const a = LS(6), b = LS(8);
  const X = 90, BW = 900, Y = 800;
  const eq = pop(t, a, 12);
  const fill = ramp(t, W(6, 2), W(6, 8) + 0.1 - W(6, 2), INOUT);
  const landed = t >= W(6, 8) + 0.1;
  const same = pop(t, W(7, 1), 9);
  const flash = ramp(t, W(7, 1), 0.1) * (1 - ramp(t, W(7, 1) + 0.15, 0.5));
  const rul = pop(t, W(7, 2), 9);
  const res = pop(t, W(6, 8), 10);
  const ticks = (n: number, col: string, top: boolean, k: number) =>
    [...Array(n + 1)].map((_, i) => {
      const x = X + (BW * i * 100) / (top ? 1000 : 931.32);
      if (x > X + BW + 1) return null;
      return <div key={i} style={{ position: "absolute", left: x - 2, top: top ? Y - 44 : Y + 110, width: 4, height: i % 5 === 0 ? 40 : 26, background: col, opacity: k, borderRadius: 2 }} />;
    });
  return (
    <Scene a={a} b={b}>
      <Center y={450} style={{ opacity: eq, flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.green }}>1,000,000,000,000</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.white }}>÷ <span style={{ color: C.orange }}>1,073,741,824</span></div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 58, color: C.orange, opacity: res, scale: `${lerp(0.5, 1, res)}` }}>= 931.32…</div>
      </Center>
      {/* top ruler: decimal GB */}
      {ticks(10, C.green, true, ramp(t, a, 0.5))}
      <div style={{ position: "absolute", left: X, top: Y - 100, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green, opacity: ramp(t, a, 0.5) }}>0</div>
      <div style={{ position: "absolute", right: 1080 - X - BW - 40, top: Y - 100, fontFamily: MONO, fontWeight: 800, fontSize: 30 + rul * 14, color: C.green, opacity: ramp(t, a, 0.5), textShadow: rul ? `0 0 ${30 * rul}px ${C.green}` : undefined }}>1,000 GB</div>
      {/* the drive's bytes */}
      <div style={{ position: "absolute", left: X, top: Y, width: BW, height: 100, borderRadius: 18, border: `4px solid ${C.white}`, background: `rgba(245,241,232,${0.06 + flash * 0.5})`, overflow: "hidden", boxShadow: `0 0 ${20 + same * 40}px rgba(245,241,232,${0.15 + same * 0.25})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: BW * fill, background: `repeating-linear-gradient(90deg, ${C.orange} 0 ${BW / 93.132 - 2}px, #0A1226 ${BW / 93.132 - 2}px ${BW / 93.132}px)`, opacity: 0.92 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white, textShadow: "0 0 10px #000, 0 0 20px #000" }}>1 trillion bytes</div>
      </div>
      {/* bottom ruler: Windows GB */}
      {ticks(9, C.orange, false, ramp(t, W(6, 2), 0.4))}
      <Center y={Y + 180} style={{ flexDirection: "column", gap: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.dim, opacity: ramp(t, W(6, 2), 0.4) }}>Windows "GB" that fit</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120 + rul * 16, color: C.orange, textShadow: landed ? `0 0 50px ${C.orange}88` : undefined, opacity: ramp(t, W(6, 2), 0.3) }}>{landed ? "931" : fmt(fill * 931.32)}</div>
      </Center>
      <Center y={1268} style={{ opacity: same, scale: `${lerp(0.5, 1, same)}` }}>
        <Pill text="same bytes" color={C.white} size={36} />
        <Pill text="different ruler" color={C.orange} size={36} style={{ opacity: rul, scale: `${lerp(0.5, 1, rul)}` }} />
      </Center>
    </Scene>
  );
};

const Name: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(10);
  const lab = pop(t, a, 12);
  const tag = pop(t, W(8, 1), 11);
  const iIn = pop(t, W(9, 1), 10);
  const out = ramp(t, W(9, 4), 0.6, (x) => x * x);
  const iK = iIn * (1 - out);
  const def = pop(t, W(9, 1) + 0.25, 12);
  const nobody = pop(t, W(9, 4), 10);
  return (
    <Scene a={a} b={b}>
      <Center y={470} style={{ opacity: tag, scale: `${lerp(0.6, 1, tag)}` }}><Pill text="the binary unit's real name" color={C.green} size={40} /></Center>
      <Center y={640} style={{ opacity: lab, scale: `${lerp(0.7, 1, lab)}`, gap: 0 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 190, lineHeight: "230px", color: C.white, display: "flex", alignItems: "center" }}>
          <span>931 G</span>
          <span style={{ display: "inline-block", height: 230, width: 116 * iIn * (1 - ramp(t, W(9, 4) + 0.35, 0.3)), overflow: "visible", position: "relative" }}>
            <span style={{ position: "absolute", left: 0, top: 0, lineHeight: "230px", color: C.orange, opacity: iK > 0 ? 1 - out : 0, translate: `0px ${lerp(-260, 0, iIn) + out * 380}px`, rotate: `${out * 70}deg`, textShadow: "0 0 50px rgba(251,146,60,.7)" }}>i</span>
          </span>
          <span>B</span>
        </div>
      </Center>
      <Center y={900} style={{ opacity: def * (1 - ramp(t, W(9, 4), 0.3)), flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.orange }}>gibibyte</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white }}>= 1,073,741,824 bytes</div>
      </Center>
      <Center y={960} style={{ opacity: nobody, scale: `${lerp(0.5, 1, nobody)}`, gap: 18 }}>
        <Pill text="your screen still says GB" color={C.orange} size={42} />
      </Center>
    </Scene>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const r1 = pop(t, a, 12);
  const d2 = pop(t, W(10, 2), 11);
  const g2 = pop(t, W(10, 5), 9);
  const take = pop(t, WE(10, 5) + 0.15, 11);
  const row = (k: number, drive: React.ReactNode, val: React.ReactNode, kv: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, k * 1.5), translate: `${(1 - k) * 60}px 0px` }}>
      {drive}
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.white, opacity: kv }}>→</div>
      <div style={{ opacity: kv, scale: `${lerp(0.5, 1, kv)}`, rotate: `${shake(t, W(10, 5), 3, 0.5)}deg` }}>{val}</div>
    </div>
  );
  const Val: React.FC<{ v: string; big?: boolean }> = ({ v, big }) => (
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: big ? 92 : 70, color: C.orange, textShadow: big ? "0 0 40px rgba(251,146,60,.6)" : undefined, whiteSpace: "nowrap" }}>{v}</div>
  );
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", left: 80, top: 470, display: "flex", flexDirection: "column", gap: 44 }}>
        {row(r1, <DriveBox label="1 TB" w={260} />, <Val v="931 GB" />, r1)}
        {row(d2, <DriveBox label="2 TB" w={260} />, <Val v="1,862 GB" big />, g2)}
      </div>
      <Center y={1150} style={{ opacity: take, scale: `${lerp(0.6, 1, take)}`, flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, color: C.white }}>Same bytes.</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, color: C.green, textShadow: `0 0 40px ${C.green}66` }}>Different ruler.</div>
      </Center>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.3, "pop", 0.7],
  [W(1, 2), "error", 0.3], [W(1, 2), "impact", 0.4], [W(1, 4), "stamp", 0.6], [W(1, 4) + 0.15, "chime", 0.8],
  [LS(2) - 0.15, "whoosh", 0.6], [LS(2), "pop", 0.5],
  ...[2, 3, 4, 5, 6].map((w) => [W(2, w), "pop", 0.55] as [number, string, number]),
  [W(3, 0), "pop", 0.5], ...[...Array(10)].map((_, i) => [W(3, 1) + i * 0.12, "tick", 0.6] as [number, string, number]),
  [W(3, 4) + 0.25, "impact", 0.6], [W(3, 5), "pop", 0.6],
  [LS(4) - 0.15, "whoosh", 0.6], ...[2, 3, 4].map((w) => [W(4, w), "pop", 0.5] as [number, string, number]), [W(4, 5), "zap", 0.6],
  [W(5, 0), "pop", 0.5], [W(5, 1), "pop", 0.5],
  ...[...Array(10)].map((_, i) => [W(5, 3) + i * ((WE(5, 3) - W(5, 3) - 0.2) / 10), "key", 0.6] as [number, string, number]),
  [W(5, 4), "impact", 0.6],
  [LS(6) - 0.15, "whoosh", 0.6], [W(6, 2) - 0.1, "riser", 0.4],
  ...[...Array(9)].map((_, i) => [W(6, 2) + i * ((W(6, 8) - W(6, 2)) / 9), "tick", 0.6] as [number, string, number]),
  [W(6, 8) + 0.1, "impact", 0.8],
  [W(7, 1), "zap", 0.5], [W(7, 2), "stamp", 0.7],
  [LS(8) - 0.15, "whoosh", 0.6], [W(8, 1), "pop", 0.6], [W(9, 1), "pop", 0.8], [W(9, 1) + 0.25, "click", 0.6], [W(9, 4), "error", 0.3], [W(9, 4) + 0.3, "impact", 0.4],
  [LS(10) - 0.15, "whoosh", 0.6], [W(10, 2), "pop", 0.7], [W(10, 5), "impact", 0.7], [WE(10, 5) + 0.15, "chime", 0.8],
];

export const Terabyte931: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Background retro={0.3 * ramp(t, LS(4), 0.6) * (1 - ramp(t, LS(6), 0.5))} />
      <Hook />
      <Decimal />
      <Binary />
      <Divide />
      <Name />
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
