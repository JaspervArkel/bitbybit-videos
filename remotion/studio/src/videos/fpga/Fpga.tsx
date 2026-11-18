/*
 * STORYBOARD — "This chip can become any circuit" (FPGA; replaces ariane-5 on 18 Nov at the user's request; ending: follow_cta, E5)
 * One world: an FPGA die = a 6x6 grid of lookup-table tiles with switch dots between them. Lit tiles + traces = "a circuit".
 * L0  "This chip can become any circuit you want."   HOOK (frame 0 complete): headline "This chip can become / any circuit",
 *                                                    the FPGA grid with a lit circuit that morphs into a new shape every ~0.6 s.
 * L1  "It's called an FPGA."                         "FPGA" label on the chip on "FPGA" + "Field-Programmable Gate Array" pill.
 * L2  "A normal processor's wiring is fixed forever." a CPU chip with etched traces; padlock + "FIXED" stamp on "fixed".
 * L3  "An FPGA is a sea of tiny lookup tables,"      grid tiles pop in a wave on "sea"; "LUT" appears on each on "lookup".
 * L4  "each able to act like any small logic gate,"  one tile zooms out into a truth-table card; on "any" it cycles AND → OR → XOR.
 * L5  "joined by switches you can flip."             switch dots pop between tiles on "switches"; they flip green/off on "flip".
 * L6  "Load a file, and those switches turn the chip into your circuit,"  a "circuit.bit" file flies in on "file";
 *                                                    a wave of switches flips on "switches"; your circuit lights up on "circuit".
 * L7  "running many tasks at once, in hardware."     4 pulses race through 4 lanes at the same time on "at once"; "all at once" pill.
 * L8  "Engineers test new chips on them,"            a blueprint "new chip design" card → arrow → FPGA → "test ✓".
 * L9  "and fans rebuild old game consoles as real circuits."  a pixel gamepad assembles from tiles on "game consoles".
 * L10 "Turn most of them off, and they forget what they were."  power button on "Turn", tiles go dark on "off", "?" on "forget".
 * L11 "Follow: tomorrow, 60 FPS that still stutters." END (follow_cta): "One chip, any circuit", Follow → Following ✓,
 *                                                    "Tomorrow:" + a stuttering 60 FPS counter.
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cursor, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 1.6);
const { W, LS } = T;
export const FPGA_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/fpga/${p}`);

// ---------- building blocks ----------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...style }}>{children}</div>
);
const Pill: React.FC<{ text: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.white, size = 60, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.9)", border: `4px solid ${color === C.white ? "rgba(245,241,232,.35)" : color}`, boxShadow: `0 0 40px ${color}33`, whiteSpace: "nowrap", ...style }}>{text}</div>
);

const N = 6;
const P1 = [0, 1, 2, 8, 14, 15, 16, 22, 28, 29];
const P2 = [30, 24, 18, 19, 20, 14, 8, 9, 10, 11];
const P3 = [5, 4, 10, 16, 22, 21, 20, 26, 32, 33, 34, 35];
const MINE = [6, 7, 13, 19, 25, 26, 27, 21, 15, 9, 10, 16, 22, 28, 34, 35];
const rc = (i: number) => [Math.floor(i / N), i % N];

/** FPGA die. size = px of the grid. path = lit tiles (in order, orthogonal neighbours). */
const Grid: React.FC<{
  size: number; path?: number[]; litK?: number; tileK?: (i: number) => number; lut?: number; sw?: number;
  swOn?: (j: number) => boolean; dark?: number; label?: number; pulses?: number[][]; bare?: boolean;
}> = ({ size, path = [], litK = 1, tileK = () => 1, lut = 0, sw = 0, swOn = () => false, dark = 0, label = 0, pulses = [], bare = false }) => {
  const t = useT();
  const pad = size * 0.06;
  const cell = (size - pad * 2) / N;
  const g = cell * 0.14;
  const cx = (i: number) => pad + rc(i)[1] * cell + cell / 2;
  const cy = (i: number) => pad + rc(i)[0] * cell + cell / 2;
  const lit = new Set(path);
  const d = path.map((p, k) => `${k ? "L" : "M"}${cx(p)} ${cy(p)}`).join(" ");
  const pulsePos = (pp: number[], k: number) => {
    const f = k * (pp.length - 1);
    const a = Math.floor(f), b = Math.min(pp.length - 1, a + 1), u = f - a;
    return [lerp(cx(pp[a]), cx(pp[b]), u), lerp(cy(pp[a]), cy(pp[b]), u)];
  };
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* package */}
      {!bare && <div style={{ position: "absolute", inset: -size * 0.04, borderRadius: size * 0.06, background: "linear-gradient(150deg,#1A2C55,#0B142C)", border: `5px solid ${C.green}`, boxShadow: `0 0 ${60 * (1 - dark)}px rgba(74,222,128,.3)` }} />}
      {[...Array(N * N)].map((_, i) => {
        const k = tileK(i);
        const on = lit.has(i) ? litK * (1 - dark) : 0;
        return (
          <div key={i} style={{
            position: "absolute", left: pad + rc(i)[1] * cell + g / 2, top: pad + rc(i)[0] * cell + g / 2, width: cell - g, height: cell - g, borderRadius: cell * 0.14,
            background: on > 0.01 ? `rgba(74,222,128,${0.15 + 0.7 * on})` : "rgba(245,241,232,.06)", border: `3px solid ${on > 0.5 ? C.green : "rgba(74,222,128,.35)"}`,
            opacity: Math.min(1, k * 1.5), scale: `${lerp(0.3, 1, k)}`, boxShadow: on > 0.5 ? `0 0 ${30 * on}px rgba(74,222,128,.7)` : undefined,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: cell * 0.24, color: on > 0.5 ? C.navy : "rgba(74,222,128,.7)",
          }}>{lut > 0.01 ? <span style={{ opacity: lut }}>LUT</span> : null}</div>
        );
      })}
      <svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {path.length > 1 && <path d={d} fill="none" stroke="#EFFFF4" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" opacity={0.85 * litK * (1 - dark)} style={{ filter: "drop-shadow(0 0 8px #4ADE80)" }} />}
        {/* switch dots at the inner corners */}
        {sw > 0.01 && [...Array((N - 1) * (N - 1))].map((_, j) => {
          const r = Math.floor(j / (N - 1)), c = j % (N - 1);
          const on = swOn(j) && dark < 0.5;
          return <circle key={j} cx={pad + (c + 1) * cell} cy={pad + (r + 1) * cell} r={cell * 0.09 * sw * (on ? 1.15 : 1)} fill={on ? C.green : C.navyDeep} stroke={on ? "#EFFFF4" : C.orange} strokeWidth={3} style={{ filter: on ? "drop-shadow(0 0 8px #4ADE80)" : undefined }} />;
        })}
        {pulses.map((pp, k) => {
          const [x, y] = pulsePos(pp, (t * 0.9 + k * 0.0) % 1);
          return <circle key={k} cx={x} cy={y} r={13} fill="#fff" style={{ filter: "drop-shadow(0 0 12px #4ADE80)" }} />;
        })}
      </svg>
      {label > 0.01 && (
        <div style={{ position: "absolute", left: "50%", bottom: -size * 0.04 - 34, translate: "-50% 0", opacity: label, scale: `${lerp(0.5, 1, label)}`, fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.navy, background: C.green, padding: "4px 30px", borderRadius: 16 }}>FPGA</div>
      )}
    </div>
  );
};

/** placement helper: grid centred horizontally at top y */
const GridAt: React.FC<{ y: number; size: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, size, style, children }) => (
  <div style={{ position: "absolute", left: 540 - size / 2, top: y, width: size, height: size, ...style }}>{children}</div>
);

// ---------- scenes ----------
const Hook: React.FC = () => {
  const t = useT();
  const pats = [P1, P2, P3];
  const idx = Math.floor(t / 0.62) % 3;
  const local = (t % 0.62) / 0.62;
  const litK = (t < 0.62 ? 1 : Math.min(1, local * 5)) * (1 - Math.max(0, (local - 0.85) * 6));
  const lab = pop(t, W(1, 3), 11);
  const full = pop(t, W(1, 3) + 0.15, 12);
  const lift = ramp(t, LS(1) - 0.1, 0.4, INOUT);
  return (
    <Scene a={0} b={LS(2)} enter={false}>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center", scale: `${lerp(1, 0.88, lift)}`, transformOrigin: "50% 0" }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>This chip can become</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 124, lineHeight: 1.15, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)" }}>any circuit</div>
      </div>
      <GridAt y={560} size={640}>
        <Grid size={640} path={pats[idx]} litK={litK} label={lab} pulses={[pats[idx]]} />
      </GridAt>
      <Center y={1300} style={{ opacity: full, scale: `${lerp(0.6, 1, full)}` }}>
        <Pill text="Field-Programmable Gate Array" color={C.green} size={40} />
      </Center>
    </Scene>
  );
};

const Cpu: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(3);
  const k = pop(t, W(2, 1), 12);
  const lock = pop(t, W(2, 5), 9, 220);
  const sh = shake(t, W(2, 5), 14, 0.4);
  const traces = ["M60 120 H200 V260 H340", "M60 220 H140 V400 H420", "M60 340 H260 V180 H440", "M120 60 V160 H300 V60", "M440 300 H360 V440", "M200 440 V320 H300"];
  return (
    <Scene a={a} b={b}>
      <Center y={470} style={{ opacity: k }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.white }}>normal processor</div>
      </Center>
      <div style={{ position: "absolute", left: 540 - 260, top: 580, width: 520, height: 520, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.6, 1, k)}`, translate: `${sh}px 0px` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "linear-gradient(150deg,#1D3460,#0C1832)", border: `6px solid ${lock > 0.5 ? C.orange : C.white}` }} />
        <svg width={520} height={520} viewBox="0 0 500 500" style={{ position: "absolute", inset: 0 }}>
          {traces.map((p, i) => <path key={i} d={p} fill="none" stroke="#C9A86A" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={900} strokeDashoffset={900 * (1 - ramp(t, W(2, 3) - 0.1 + i * 0.05, 0.4))} opacity={0.9} />)}
          <rect x={170} y={205} width={160} height={84} rx={14} fill="#0C1832" stroke={C.white} strokeWidth={4} />
          <text x={250} y={270} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={64} fill={C.white}>CPU</text>
        </svg>
      </div>
      {lock > 0.01 && (
        <Center y={1010}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 76, color: C.orange, border: `7px solid ${C.orange}`, borderRadius: 20, padding: "4px 30px", background: "rgba(10,18,38,.92)", rotate: "-7deg", scale: `${lerp(2.2, 1, lock)}`, opacity: Math.min(1, lock * 2), boxShadow: "0 0 50px rgba(251,146,60,.5)" }}>FIXED</div>
        </Center>
      )}
    </Scene>
  );
};

const TT: Record<string, string> = { AND: "0001", OR: "0111", XOR: "0110" };
const Sea: React.FC = () => {
  const t = useT();
  const a = LS(3), b = LS(6);
  const seaAt = W(3, 4);
  const tileK = (i: number) => pop(t, seaAt - 0.25 + (rc(i)[0] + rc(i)[1]) * 0.04, 13);
  const lut = ramp(t, W(3, 7), 0.3);
  const card = pop(t, W(4, 0), 12);
  const gates = ["AND", "OR", "XOR"];
  const gi = t < W(4, 5) ? 0 : Math.floor((t - W(4, 5)) / 0.4) % 3;
  const gk = pop(t, t < W(4, 5) ? W(4, 0) : W(4, 5) + Math.floor((t - W(4, 5)) / 0.4) * 0.4, 13);
  const sw = pop(t, W(5, 2), 12);
  const flipAt = W(5, 5);
  const swOn = (j: number) => t >= flipAt && ((j * 7 + Math.floor((t - flipAt) / 0.25)) % 3 === 0);
  const sel = 14;
  const shrink = ramp(t, W(4, 0) - 0.1, 0.5, INOUT) * (1 - ramp(t, LS(5) - 0.1, 0.5, INOUT));
  const gs = lerp(720, 520, shrink);
  return (
    <Scene a={a} b={b}>
      <GridAt y={lerp(520, 470, shrink)} size={gs} style={{ left: lerp(540 - 360, 50, shrink) }}>
        <Grid size={gs} tileK={tileK} lut={lut} path={shrink > 0.05 ? [sel] : []} litK={shrink} sw={sw} swOn={swOn} />
      </GridAt>
      {/* truth table card */}
      <div style={{ position: "absolute", left: 610, top: 500, width: 420, opacity: Math.min(1, card * 1.5) * (1 - ramp(t, LS(5) - 0.15, 0.3)), scale: `${lerp(0.5, 1, card)}`, transformOrigin: "0 50%" }}>
        <div style={{ borderRadius: 30, border: `4px solid ${C.green}`, background: "rgba(10,18,38,.95)", padding: "22px 28px", boxShadow: "0 0 50px rgba(74,222,128,.25)" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim }}>1 lookup table =</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 72, color: C.green, scale: `${lerp(0.7, 1, gk)}`, transformOrigin: "left center" }}>{gates[gi]}</div>
          {["00", "01", "10", "11"].map((inp, r) => (
            <div key={inp} style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.white, marginTop: 6 }}>
              <span>{inp[0]} {inp[1]}</span><span style={{ color: C.dim }}>→</span>
              <span style={{ color: TT[gates[gi]][r] === "1" ? C.green : C.dim }}>{TT[gates[gi]][r]}</span>
            </div>
          ))}
        </div>
      </div>
      <Center y={1300} style={{ opacity: ramp(t, W(5, 2), 0.3) }}>
        <Pill text={<><span style={{ color: C.green }}>●</span> on  <span style={{ color: C.orange }}>○</span> off  switches</>} size={38} />
      </Center>
    </Scene>
  );
};

const Load: React.FC = () => {
  const t = useT();
  const a = LS(6), b = LS(8);
  const fileAt = W(6, 2);
  const fk = pop(t, W(6, 0), 12);
  const fly = ramp(t, fileAt, 0.6, INOUT);
  const waveAt = W(6, 5);
  const swOn = (j: number) => {
    const r = Math.floor(j / 5), c = j % 5;
    const on = (r * 3 + c * 5 + 1) % 4 !== 0;
    return on && t >= waveAt + (r + c) * 0.06;
  };
  const litK = ramp(t, W(6, 11) - 0.1, 0.35);
  const once = t >= W(7, 3);
  const lanes = [[0, 1, 2, 3, 4, 5], [12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23], [30, 31, 32, 33, 34, 35]];
  const onceK = pop(t, W(7, 3), 11);
  return (
    <Scene a={a} b={b}>
      <GridAt y={560} size={640}>
        <Grid size={640} sw={1} swOn={swOn} path={once ? [] : MINE} litK={once ? 0 : litK} pulses={once ? [] : litK > 0.9 ? [MINE] : []} />
        {once && lanes.map((ln, k) => (
          <div key={k} style={{ position: "absolute", inset: 0 }}><Grid size={640} path={ln} litK={1} pulses={[ln]} sw={0} bare tileK={(i) => (ln.includes(i) ? 1 : 0)} /></div>
        ))}
      </GridAt>
      {/* config file */}
      <div style={{ position: "absolute", left: lerp(700, 540, fly), top: lerp(440, 880, fly), translate: "-50% 0", opacity: Math.min(1, fk * 1.5) * (1 - ramp(t, fileAt + 0.55, 0.15)), scale: `${lerp(0.5, 1, fk) * lerp(1, 0.4, fly)}` }}>
        <Pill text="circuit.bit" color={C.green} size={50} />
      </div>
      <Center y={470} style={{ opacity: ramp(t, waveAt, 0.3) * (once ? 0 : 1) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white }}>switches set → <span style={{ color: C.green }}>your circuit</span></div>
      </Center>
      <Center y={470} style={{ opacity: onceK, scale: `${lerp(0.5, 1, onceK)}` }}>
        <Pill text="4 jobs, all at once" color={C.green} size={46} />
      </Center>
    </Scene>
  );
};

const PIX = [
  "..XXXXXXXXXX..",
  ".XXXXXXXXXXXX.",
  "XX.XXXXXXXX.XX",
  "X...XXXXXX.X.X",
  "XX.XXXXXXXX.XX",
  "XXXXX....XXXXX",
  ".XXX......XXX.",
];
const Uses: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(10);
  const bp = pop(t, W(8, 2), 12);
  const ar = ramp(t, W(8, 3), 0.4);
  const ok = pop(t, W(8, 5), 10);
  const out = ramp(t, LS(9) - 0.15, 0.4, INOUT);
  const padAt = W(9, 4);
  const cells: [number, number][] = [];
  PIX.forEach((row, r) => [...row].forEach((ch, c) => ch === "X" && cells.push([r, c])));
  const real = pop(t, W(9, 7), 11);
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
        <div style={{ position: "absolute", left: 60, top: 600, width: 400, height: 400, borderRadius: 26, border: `4px dashed #60A5FA`, background: "repeating-linear-gradient(0deg, rgba(96,165,250,.08) 0 2px, transparent 2px 40px), repeating-linear-gradient(90deg, rgba(96,165,250,.08) 0 2px, transparent 2px 40px), rgba(10,18,38,.9)", opacity: Math.min(1, bp * 1.5), scale: `${lerp(0.5, 1, bp)}` }}>
          <svg width={400} height={400} viewBox="0 0 400 400">
            <path d="M60 100 H200 V200 H320 M80 300 H160 V200 M240 320 V260 H340" fill="none" stroke="#60A5FA" strokeWidth={8} strokeLinecap="round" />
            <rect x={150} y={150} width={100} height={100} rx={12} fill="none" stroke="#60A5FA" strokeWidth={8} />
          </svg>
          <div style={{ position: "absolute", bottom: -70, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 36, color: "#93C5FD" }}>new chip design</div>
        </div>
        <div style={{ position: "absolute", left: 480, top: 770, fontFamily: MONO, fontWeight: 800, fontSize: 80, color: C.white, opacity: ar, translate: `${lerp(-30, 0, ar)}px 0px` }}>→</div>
        <div style={{ position: "absolute", left: 600, top: 620 }}><Grid size={380} path={MINE} litK={ar} pulses={ar > 0.9 ? [MINE] : []} /></div>
        <div style={{ position: "absolute", left: 600, width: 380, top: 1060, textAlign: "center", opacity: ok, scale: `${lerp(0.5, 1, ok)}` }}><Pill text="test ✓" color={C.green} size={50} style={{ display: "inline-block" }} /></div>
      </div>
      {/* pixel gamepad assembling from tiles */}
      <div style={{ position: "absolute", left: 540 - 14 * 29, top: 660, opacity: out }}>
        {cells.map(([r, c], i) => {
          const k = pop(t, padAt - 0.3 + i * 0.008, 13);
          return <div key={i} style={{ position: "absolute", left: c * 58, top: r * 58, width: 52, height: 52, borderRadius: 10, background: C.green, opacity: Math.min(1, k * 1.5), scale: `${lerp(0.2, 1, k)}`, boxShadow: "0 0 16px rgba(74,222,128,.5)" }} />;
        })}
      </div>
      <Center y={540} style={{ opacity: out * ramp(t, W(9, 1), 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.white }}>old console, rebuilt</div>
      </Center>
      <Center y={1180} style={{ opacity: real, scale: `${lerp(0.5, 1, real)}` }}>
        <Pill text="as hardware, not software" color={C.green} size={44} />
      </Center>
    </Scene>
  );
};

const PowerOff: React.FC = () => {
  const t = useT();
  const a = LS(10), b = LS(11);
  const pw = pop(t, W(10, 0), 11);
  const offAt = W(10, 4);
  const press = t >= offAt - 0.05 && t < offAt + 0.12;
  const dark = ramp(t, offAt, 0.5);
  const q = pop(t, W(10, 7), 10);
  const fk = pop(t, W(10, 1), 12);
  return (
    <Scene a={a} b={b}>
      <GridAt y={520} size={600}>
        <Grid size={600} path={MINE} litK={1} dark={dark} sw={1} swOn={(j) => (j * 3) % 4 !== 0} pulses={dark < 0.2 ? [MINE] : []} />
        {q > 0.01 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 300, color: C.orange, opacity: q, scale: `${lerp(0.4, 1, q)}`, textShadow: "0 0 60px rgba(251,146,60,.7)" }}>?</div>}
      </GridAt>
      <div style={{ position: "absolute", left: 840, top: 1150, width: 150, height: 150, borderRadius: 75, border: `6px solid ${dark > 0.5 ? C.orange : C.green}`, background: "rgba(10,18,38,.95)", display: "flex", alignItems: "center", justifyContent: "center", opacity: pw, scale: `${lerp(0.4, 1, pw) * (press ? 0.88 : 1)}` }}>
        <svg width={80} height={80} viewBox="0 0 40 40"><path d="M13 10 A12 12 0 1 0 27 10" fill="none" stroke={dark > 0.5 ? C.orange : C.green} strokeWidth={4} strokeLinecap="round" /><path d="M20 4 V20" stroke={dark > 0.5 ? C.orange : C.green} strokeWidth={4} strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1185, opacity: fk }}><Pill text="most FPGAs" size={40} /></div>
      <Center y={440} style={{ opacity: q }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.orange }}>configuration: gone</div>
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
  const ph = (t * 3) % 1;
  const hitch = ph > 0.72 && ph < 0.86;
  const frame = Math.floor(t * 60);
  const stK = ramp(t, W(11, 4), 0.2);
  const st = stK > 0.5 && hitch;
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <Center y={450} style={{ opacity: ramp(t, a, 0.3) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.white }}>One chip, <span style={{ color: C.green }}>any circuit</span></div>
      </Center>
      <Center y={590} style={{ opacity: fol, scale: `${lerp(0.5, 1, fol) * (1 - press * 0.06)}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, color: followed ? C.green : C.navy, background: followed ? "rgba(74,222,128,.12)" : C.green, border: `5px solid ${C.green}`, padding: "18px 70px", borderRadius: 999, boxShadow: "0 0 70px rgba(74,222,128,.45)" }}>{followed ? "Following ✓" : "Follow"}</div>
      </Center>
      <Cursor x={lerp(820, 640, ramp(t, a, 0.4, INOUT))} y={lerp(820, 650, ramp(t, a, 0.4, INOUT))} down={press} opacity={ramp(t, a, 0.2) * (1 - ramp(t, W(11, 1) + 0.2, 0.3))} />
      <Center y={820} style={{ opacity: tm }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white }}>Tomorrow:</div>
      </Center>
      <Center y={930} style={{ opacity: fps, scale: `${lerp(0.6, 1, fps)}` }}>
        <div style={{ width: 640, height: 230, borderRadius: 30, border: `4px solid ${st ? C.orange : C.green}`, background: "rgba(10,18,38,.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", translate: `${st ? 10 : 0}px 0px` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.green }}>60 FPS</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: st ? C.orange : C.dim }}>{st ? "frame … stuck" : `frame ${frame}`}</div>
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
  [0, "impact", 0.5], [0.05, "zap", 0.4],
  ...[...Array(4)].map((_, i) => [0.62 * (i + 1), "zap", 0.35] as [number, string, number]),
  [W(1, 3), "pop", 0.7], [W(1, 3) + 0.15, "chime", 0.5],
  [LS(2) - 0.15, "whoosh", 0.6], [W(2, 1), "pop", 0.5], [W(2, 3), "printer", 0.35], [W(2, 5), "stamp", 1], [W(2, 5) + 0.05, "impact", 0.5],
  [LS(3) - 0.15, "whoosh", 0.6], ...[...Array(8)].map((_, i) => [W(3, 4) - 0.25 + i * 0.05, "tick", 0.35] as [number, string, number]), [W(3, 7), "chime", 0.5],
  [W(4, 0), "pop", 0.6], [W(4, 5), "click", 0.6], [W(4, 5) + 0.4, "click", 0.6], [W(4, 5) + 0.8, "click", 0.6], [W(4, 5) + 1.2, "click", 0.5],
  [W(5, 2), "pop", 0.6], [W(5, 5), "click", 0.8], [W(5, 5) + 0.25, "click", 0.6], [W(5, 5) + 0.5, "click", 0.5],
  [LS(6) - 0.15, "whoosh", 0.5], [W(6, 0), "pop", 0.6], [W(6, 2), "whoosh", 0.5], [W(6, 2) + 0.6, "enter", 0.7],
  ...[...Array(8)].map((_, i) => [W(6, 5) + i * 0.07, "key", 0.4] as [number, string, number]), [W(6, 11), "chime", 0.8],
  [W(7, 3), "zap", 0.7], [W(7, 3) + 0.05, "pop", 0.6], [W(7, 6), "riser", 0.3],
  [LS(8) - 0.15, "whoosh", 0.6], [W(8, 2), "pop", 0.6], [W(8, 3), "whoosh", 0.4], [W(8, 5), "chime", 0.7],
  [LS(9) - 0.15, "whoosh", 0.5], ...[...Array(10)].map((_, i) => [W(9, 4) - 0.3 + i * 0.06, "tick", 0.4] as [number, string, number]), [W(9, 7), "pop", 0.7],
  [LS(10) - 0.15, "whoosh", 0.5], [W(10, 0), "pop", 0.6], [W(10, 1), "pop", 0.4], [W(10, 4), "click", 1], [W(10, 4) + 0.05, "error", 0.4], [W(10, 7), "impact", 0.7],
  [LS(11) - 0.15, "whoosh", 0.5], [W(11, 0) + 0.4, "click", 0.9], [W(11, 0) + 0.45, "chime", 0.6], [W(11, 2), "pop", 0.6], [W(11, 4), "tick", 0.6], [W(11, 5), "tick", 0.6],
];

export const Fpga: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Cpu />
    <Sea />
    <Load />
    <Uses />
    <PowerOff />
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
