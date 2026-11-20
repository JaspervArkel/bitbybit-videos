/*
 * STORYBOARD — "AI sees images as numbers" (pillar B; ending: comment_prompt, E6; posts 01:00+1, E7)
 * One world: a 16×16 pixel-art cat (drawn here, real RGB values shown are this image's own values).
 * The same image is scanned into numbers, zoomed into one pixel, cut into 4×4-pixel patches, flattened, compared,
 * learned from labelled examples, and finally stripped of "eyes" and "light".
 * L0  "AI doesn't see a picture."            HOOK (frame 0 complete): "AI doesn't see a" / "picture" (orange mono) + the cat,
 *                                            a green scan bar already sweeping, turning pixels into their R/G/B numbers.
 * L1  "It sees a grid of numbers."           whole image is numbers; grid lines flash on "grid", number pulse on "numbers".
 * L2  "Every pixel is three values: red, green and blue."  image shrinks up; one fur pixel boxed on "pixel";
 *                                            card "1 pixel = 3 numbers" on "three"; R 240 / G 150 / B 60 bars on each colour word.
 * L3  "Many modern vision models cut the image into small square patches,"  image back in colour; orange cut lines draw on "cut";
 *                                            the image splits into 16 patches on "patches" (+ "16 patches" chip).
 * L4  "turn each patch into a list of numbers,"  patch (row 2, col 0) glows on "patch"; its 48 numbers type out as a list on "list".
 * L5  "and compare every patch with every other."  lines from that patch to all others on "every patch"; all-pairs web on "every other".
 * L6  "From millions of labelled examples,"   9 labelled thumbnails (cats / wheels) drop in; "× millions" chip on "millions".
 * L7  "they learn which number patterns mean "cat ears" or "wheel"."  cat + wheel side by side, patch grids on "patterns";
 *                                            ear patches glow + "cat ears" tag on "cat"; wheel patches glow + "wheel" tag on "wheel".
 * L8  "No eyes, no light."                    eye icon slashed on "eyes", sun icon slashed on "light"; image = numbers only.
 * L9  "Just patterns in numbers."             patches pulse in a wave, image glows green.
 * L10 "What's the weirdest thing your photo app mislabelled?"  END (comment_prompt): the question big on screen, the cat below
 *                                            with a wrong "wheel?" label stamped on "mislabelled".
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, FPS, INOUT, Line, MONO, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.4);
const { W, LS } = T;
export const AI_IMAGE_NUMBERS_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/ai-image-numbers/${p}`);

// ---------- images ----------
type RGB = [number, number, number];
const PAL: Record<string, RGB> = {
  ".": [58, 96, 168], K: [34, 28, 46], O: [240, 150, 60], P: [236, 140, 172], G: [74, 222, 128], W: [245, 241, 232],
};
const CAT_ART = [
  "................",
  ".K............K.",
  ".KK..........KK.",
  ".KPK........KPK.",
  ".KOOKKKKKKKKOOK.",
  ".KOOOOOOOOOOOOK.",
  "KOOOOOOOOOOOOOOK",
  "KOOGGOOOOOOGGOOK",
  "KOOGKOOOOOOKGOOK",
  "KOOOOOOOOOOOOOOK",
  "KWWOOOOPPOOOOWWK",
  "KWWWOOOKKOOOWWWK",
  ".KWWWOOOOOOWWWK.",
  "..KKOOOOOOOOKK..",
  "....KKKKKKKK....",
  "................",
];
const recolor = (art: string[], map: Partial<Record<string, RGB>>) => art.map((row) => row.split("").map((ch) => map[ch] ?? PAL[ch]));
const CAT = recolor(CAT_ART, {});
const CAT_GRAY = recolor(CAT_ART, { O: [150, 150, 162], ".": [92, 70, 140] });
const CAT_DARK = recolor(CAT_ART, { O: [70, 64, 80], K: [20, 18, 26], ".": [40, 120, 110] });
const wheel = (bg: RGB, tire: RGB): RGB[][] =>
  [...Array(16)].map((_, r) => [...Array(16)].map((_, c) => {
    const dx = c - 7.5, dy = r - 7.5, d = Math.hypot(dx, dy);
    if (d > 7.6) return bg;
    if (d > 5.6) return tire;
    if (d > 4.6) return [200, 204, 214];
    if (d < 1.8) return [150, 154, 166];
    if (Math.abs(dx) < 0.8 || Math.abs(dy) < 0.8 || Math.abs(Math.abs(dx) - Math.abs(dy)) < 0.8) return [170, 174, 186];
    return [24, 26, 34];
  }));
const WHEEL = wheel([70, 140, 90], [40, 40, 48]);
const WHEEL_B = wheel([58, 96, 168], [52, 46, 44]);
const WHEEL_C = wheel([150, 120, 80], [30, 30, 36]);
const rgb = (p: RGB, a = 1) => `rgba(${p[0]},${p[1]},${p[2]},${a})`;

// ---------- the pixel image ----------
type PicProps = {
  img: RGB[][]; cell: number; gap?: number;
  num?: (r: number, c: number) => number; // 0..1 how much the cell shows numbers instead of colour
  glow?: (pr: number, pc: number) => { k: number; color: string } | null; // per-patch highlight
  dim?: (pr: number, pc: number) => number; // 0..1 dim per patch
  gridK?: number; patchLines?: number; frame?: string;
};
const Pic: React.FC<PicProps> = ({ img, cell, gap = 0, num = () => 0, glow = () => null, dim = () => 0, gridK = 0, patchLines = 0, frame }) => {
  const size = 16 * cell + 3 * gap;
  const pos = (i: number) => i * cell + Math.floor(i / 4) * gap;
  const fs = cell * 0.29;
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: gap > 0 ? 0 : 14, boxShadow: frame ? `0 0 70px ${frame}66` : "0 20px 60px rgba(0,0,0,.45)", outline: frame ? `5px solid ${frame}` : undefined, outlineOffset: 8 }}>
      {img.map((row, r) => row.map((p, c) => {
        const n = num(r, c);
        const pr = Math.floor(r / 4), pc = Math.floor(c / 4);
        const dm = dim(pr, pc);
        return (
          <div key={`${r}-${c}`} style={{
            position: "absolute", left: pos(c), top: pos(r), width: cell, height: cell,
            background: n > 0 ? `linear-gradient(${rgb(p, 1 - 0.5 * n)}, ${rgb(p, 1 - 0.5 * n)}), #0A1226` : rgb(p),
            opacity: 1 - dm * 0.7,
            boxShadow: gridK > 0 ? `inset 0 0 0 ${Math.max(1, cell * 0.03)}px rgba(245,241,232,${0.35 * gridK})` : undefined,
          }}>
            {n > 0.02 && cell >= 24 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: fs, lineHeight: 1.08, color: C.white, opacity: n, letterSpacing: -0.5 }}>
                <span>{p[0]}</span><span>{p[1]}</span><span>{p[2]}</span>
              </div>
            )}
          </div>
        );
      }))}
      {/* patch highlights */}
      {[0, 1, 2, 3].map((pr) => [0, 1, 2, 3].map((pc) => {
        const g = glow(pr, pc);
        if (!g || g.k < 0.01) return null;
        return <div key={`g${pr}${pc}`} style={{ position: "absolute", left: pos(pc * 4) - 4, top: pos(pr * 4) - 4, width: 4 * cell + 8, height: 4 * cell + 8, borderRadius: 10, border: `6px solid ${g.color}`, boxShadow: `0 0 ${40 * g.k}px ${g.color}, inset 0 0 30px ${g.color}55`, opacity: g.k }} />;
      }))}
      {/* patch outlines (no gap) */}
      {patchLines > 0.01 && [1, 2, 3].map((i) => (
        <React.Fragment key={`pl${i}`}>
          <div style={{ position: "absolute", left: i * 4 * cell - 2, top: 0, width: 4, height: 16 * cell * patchLines, background: C.white, opacity: 0.85 }} />
          <div style={{ position: "absolute", top: i * 4 * cell - 2, left: 0, height: 4, width: 16 * cell * patchLines, background: C.white, opacity: 0.85 }} />
        </React.Fragment>
      ))}
    </div>
  );
};

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
const Slash: React.FC<{ k: number; size: number }> = ({ k, size }) => (
  <div style={{ position: "absolute", left: "50%", top: "50%", width: size * 1.2 * k, height: 14, marginLeft: -(size * 1.2 * k) / 2, marginTop: -7, background: C.orange, borderRadius: 7, rotate: "-35deg", boxShadow: "0 0 30px rgba(251,146,60,.8)" }} />
);

// ---------- scenes ----------
const HOOK_IMG_TOP = 520;
const Hook: React.FC = () => {
  const t = useT();
  const a = 0, b = LS(3);
  // scan bar sweeps from column 3.5 (already moving at frame 0) to the end by ~1.7 s
  const sx = lerp(3.5, 17, ramp(t, 0, 1.75, INOUT));
  const head = 1 - ramp(t, LS(1) - 0.15, 0.3);
  const lift = ramp(t, LS(1) - 0.1, 0.5, INOUT);
  const z = ramp(t, W(2, 1) - 0.1, 0.55, INOUT); // shrink for the pixel zoom
  const cell = 50;
  const top = lerp(lerp(HOOK_IMG_TOP, 470, lift), 450, z);
  const scale = lerp(1, 0.6, z);
  const gridK = pop(t, W(1, 3), 10) * (1 - ramp(t, W(1, 5) + 0.5, 0.4));
  const pulse = (r: number, c: number) => {
    const d = t - W(1, 5) - (r + c) * 0.02;
    return d > 0 && d < 0.35 ? Math.sin((d / 0.35) * Math.PI) : 0;
  };
  const num = (r: number, c: number) => Math.min(1, Math.max(0, sx - c));
  const hiR = 6, hiC = 6; // fur pixel (240,150,60)
  const box = pop(t, W(2, 1), 12);
  const card = pop(t, W(2, 3), 11);
  const bars: [string, number, string, number][] = [["R", 240, "#F87171", W(2, 5)], ["G", 150, C.green, W(2, 6)], ["B", 60, "#60A5FA", W(2, 8)]];
  const left = (1080 - 16 * cell * scale) / 2;
  return (
    <Scene a={a} b={b} enter={false}>
      {head > 0.01 && (
        <div style={{ position: "absolute", top: 165, left: 0, right: 0, textAlign: "center", opacity: head }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: C.white, letterSpacing: -2 }}>AI doesn't see a</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, lineHeight: 1.12, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 4), 10, 0.4)}px 0px` }}>picture</div>
        </div>
      )}
      <div style={{ position: "absolute", left, top, scale: `${scale}`, transformOrigin: "0 0" }}>
        <div style={{ scale: `${1 + 0.02 * Math.sin(t * 1.3)}` }}>
          <Pic img={CAT} cell={cell} num={(r, c) => num(r, c)} gridK={gridK} />
          {/* number pulse overlay */}
          {t > W(1, 5) && t < W(1, 5) + 1.2 && (
            <div style={{ position: "absolute", inset: 0 }}>
              {CAT.map((row, r) => row.map((_, c) => {
                const p = pulse(r, c);
                return p > 0.02 ? <div key={`${r}-${c}`} style={{ position: "absolute", left: c * cell, top: r * cell, width: cell, height: cell, background: `rgba(74,222,128,${0.35 * p})` }} /> : null;
              }))}
            </div>
          )}
          {/* scan bar */}
          {sx < 16.6 && <div style={{ position: "absolute", left: sx * cell - 5, top: -16, width: 10, height: 16 * cell + 32, borderRadius: 5, background: C.green, boxShadow: "0 0 40px #4ADE80, 0 0 90px rgba(74,222,128,.6)" }} />}
          {box > 0.01 && <div style={{ position: "absolute", left: hiC * cell - 6, top: hiR * cell - 6, width: cell + 12, height: cell + 12, borderRadius: 8, border: `7px solid ${C.green}`, boxShadow: "0 0 40px #4ADE80", opacity: box, scale: `${lerp(2, 1, box)}` }} />}
        </div>
      </div>
      {card > 0.01 && (
        <div style={{ position: "absolute", left: 90, top: 990, width: 900, height: 330, borderRadius: 30, background: "rgba(10,18,38,.95)", border: "4px solid rgba(245,241,232,.3)", opacity: Math.min(1, card * 1.5), scale: `${lerp(0.6, 1, card)}`, translate: `0px ${(1 - card) * 40}px` }}>
          <div style={{ position: "absolute", left: 40, top: 34, width: 190, height: 190, borderRadius: 18, background: rgb(CAT[hiR][hiC]), boxShadow: `0 0 50px ${rgb(CAT[hiR][hiC], 0.5)}` }} />
          <div style={{ position: "absolute", left: 40, top: 250, width: 190, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim }}>1 pixel</div>
          {bars.map(([lbl, v, col, at], i) => {
            const k = pop(t, at, 12);
            const fill = ramp(t, at, 0.5);
            return (
              <div key={lbl} style={{ position: "absolute", left: 270, top: 42 + i * 92, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, k * 1.6), translate: `${(1 - k) * 40}px 0px` }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: col, width: 44 }}>{lbl}</div>
                <div style={{ width: 380, height: 42, borderRadius: 21, background: "rgba(245,241,232,.1)", overflow: "hidden" }}>
                  <div style={{ width: `${(v / 255) * 100 * fill}%`, height: "100%", borderRadius: 21, background: col, boxShadow: `0 0 20px ${col}` }} />
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.white, width: 120, textAlign: "right" }}>{Math.round(v * fill)}</div>
              </div>
            );
          })}
        </div>
      )}
    </Scene>
  );
};

// patch geometry for the patch scene
const PC = 40, PG = 20, PSIZE = 16 * PC + 3 * PG, PLEFT = (1080 - PSIZE) / 2, PTOP = 460;
const pCenter = (pr: number, pc: number): [number, number] => [PLEFT + pc * (4 * PC + PG) + 2 * PC, PTOP + pr * (4 * PC + PG) + 2 * PC];
const SEL = [2, 0] as const;
const selNumbers = (() => {
  const out: number[] = [];
  for (let r = SEL[0] * 4; r < SEL[0] * 4 + 4; r++) for (let c = SEL[1] * 4; c < SEL[1] * 4 + 4; c++) out.push(...CAT[r][c]);
  return out;
})();

const Patches: React.FC = () => {
  const t = useT();
  const a = LS(3), b = LS(6);
  const cut = ramp(t, W(3, 4) - 0.05, 0.6, INOUT);
  const split = ramp(t, W(3, 10) - 0.1, 0.5, INOUT);
  const chip = pop(t, W(3, 10) + 0.1, 11) * (1 - ramp(t, W(4, 5) - 0.2, 0.25));
  const sel = pop(t, W(4, 2), 11);
  const list = ramp(t, W(4, 5) - 0.05, 0.9);
  const isSel = (pr: number, pc: number) => pr === SEL[0] && pc === SEL[1];
  const fan = ramp(t, W(5, 2), 0.6, INOUT);
  const web = ramp(t, W(5, 5), 0.8, INOUT);
  const shown = Math.floor(list * 9);
  const gap = PG * split;
  const size = 16 * PC + 3 * gap;
  const left = (1080 - size) / 2;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left, top: PTOP + (PSIZE - size) / 2 }}>
        <Pic img={CAT} cell={PC} gap={gap}
          num={(r, c) => (isSel(Math.floor(r / 4), Math.floor(c / 4)) ? list : web * 0.9)}
          dim={(pr, pc) => (isSel(pr, pc) ? 0 : sel * (1 - web) * 0.7)}
          glow={(pr, pc) => (isSel(pr, pc) ? { k: sel, color: C.green } : null)} />
        {/* cut lines */}
        {cut > 0 && split < 0.5 && [1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: i * 4 * PC - 4, top: -20, width: 8, height: (16 * PC + 40) * cut, background: C.orange, borderRadius: 4, boxShadow: "0 0 24px #FB923C" }} />
            <div style={{ position: "absolute", top: i * 4 * PC - 4, left: -20, height: 8, width: (16 * PC + 40) * cut, background: C.orange, borderRadius: 4, boxShadow: "0 0 24px #FB923C" }} />
          </React.Fragment>
        ))}
      </div>
      {/* comparison lines */}
      {(fan > 0 || web > 0) && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2, 3].flatMap((pr) => [0, 1, 2, 3].map((pc) => [pr, pc] as const)).flatMap(([pr, pc], i, all) =>
            all.slice(i + 1).map(([qr, qc]) => {
              const fromSel = isSel(pr, pc) || isSel(qr, qc);
              const k = fromSel ? fan : web;
              if (k <= 0) return null;
              const [x1, y1] = pCenter(pr, pc), [x2, y2] = pCenter(qr, qc);
              return <line key={`${pr}${pc}${qr}${qc}`} x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={fromSel ? C.green : "rgba(74,222,128,.45)"} strokeWidth={fromSel ? 5 : 3} strokeLinecap="round" style={{ filter: fromSel ? "drop-shadow(0 0 8px #4ADE80)" : undefined }} />;
            })
          )}
          {[0, 1, 2, 3].flatMap((pr) => [0, 1, 2, 3].map((pc) => {
            const [x, y] = pCenter(pr, pc);
            return <circle key={`d${pr}${pc}`} cx={x} cy={y} r={isSel(pr, pc) ? 14 : 9} fill={C.green} opacity={Math.max(fan, web)} />;
          }))}
        </svg>
      )}
      {chip > 0.01 && <Center y={1215} style={{ opacity: chip, scale: `${lerp(0.5, 1, chip)}` }}><Pill text="16 patches" color={C.orange} size={50} /></Center>}
      {list > 0.01 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1200, opacity: Math.min(1, list * 3) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green, background: "rgba(10,18,38,.95)", border: `4px solid ${C.green}`, borderRadius: 22, padding: "14px 22px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden" }}>
            [{selNumbers.slice(0, shown).join(", ")}{shown >= 9 ? ", …" : ""}]
          </div>
          <div style={{ marginTop: 10, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.white, opacity: ramp(t, W(4, 7), 0.3) }}>one patch = 48 numbers</div>
        </div>
      )}
    </Scene>
  );
};

const EXAMPLES: [RGB[][], string][] = [
  [CAT, "cat"], [WHEEL, "wheel"], [CAT_GRAY, "cat"],
  [WHEEL_B, "wheel"], [CAT_DARK, "cat"], [WHEEL_C, "wheel"],
  [CAT_GRAY, "cat"], [WHEEL, "wheel"], [CAT, "cat"],
];
const Learn: React.FC = () => {
  const t = useT();
  const a = LS(6), b = LS(8);
  const out = ramp(t, LS(7) - 0.2, 0.4, INOUT);
  const mil = pop(t, W(6, 1), 9, 200) * (1 - out);
  const pairK = pop(t, LS(7) + 0.05, 12);
  const pat = ramp(t, W(7, 4), 0.5, INOUT);
  const ears = pop(t, W(7, 6), 11);
  const wh = pop(t, W(7, 9), 11);
  const isEar = (pr: number, pc: number) => pr === 0 && (pc === 0 || pc === 3);
  return (
    <Scene a={a} b={b}>
      {out < 1 && EXAMPLES.map(([img, lbl], i) => {
        const k = pop(t, W(6, 0) + i * 0.11, 12);
        const col = i % 3, row = Math.floor(i / 3);
        return (
          <div key={i} style={{ position: "absolute", left: 120 + col * 290, top: 470 + row * 268, width: 260, height: 244, borderRadius: 22, background: "rgba(10,18,38,.92)", border: "4px solid rgba(245,241,232,.25)", opacity: Math.min(1, k * 1.5) * (1 - out), scale: `${lerp(0.4, 1, k) * lerp(1, 0.6, out)}`, translate: `0px ${(1 - k) * -80}px`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 }}>
            <Pic img={img} cell={10} />
            <div style={{ marginTop: 12, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.navy, background: C.green, padding: "0px 16px", borderRadius: 10 }}>{lbl}</div>
          </div>
        );
      })}
      {mil > 0.01 && <Center y={790}><Stamp text="× millions" k={mil} color={C.orange} size={96} rot={-5} /></Center>}
      {pairK > 0.01 && (
        <>
          {[[CAT, 90, ears, "\"cat ears\"", isEar] as const, [WHEEL, 606, wh, "\"wheel\"", (pr: number, pc: number) => !((pr === 1 || pr === 2) && (pc === 1 || pc === 2))] as const].map(([img, x, k, tag, hit], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: 600, opacity: Math.min(1, pairK * 1.5), scale: `${lerp(0.6, 1, pairK)}` }}>
              <Pic img={img} cell={24} patchLines={pat} glow={(pr, pc) => (hit(pr, pc) ? { k, color: C.green } : null)} dim={(pr, pc) => (hit(pr, pc) ? 0 : k * 0.6)} />
              <div style={{ position: "absolute", left: 0, width: 384, top: 420, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, k)}` }}>
                <Pill text={tag} color={C.green} size={44} />
              </div>
            </div>
          ))}
          <Center y={490} style={{ opacity: pat }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.white }}>number patterns <span style={{ color: C.green }}>→</span> labels</div>
          </Center>
        </>
      )}
    </Scene>
  );
};

const Eye: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 0.6} viewBox="0 0 150 90"><path d="M8 45 Q75 -12 142 45 Q75 102 8 45 Z" fill="rgba(10,18,38,.95)" stroke={C.white} strokeWidth={6} /><circle cx={75} cy={45} r={22} fill={C.green} /><circle cx={75} cy={45} r={9} fill={C.navy} /></svg>
);
const Sun: React.FC<{ s: number; spin: number }> = ({ s, spin }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ rotate: `${spin}deg` }}>
    {[...Array(8)].map((_, i) => <rect key={i} x={46} y={2} width={8} height={18} rx={4} fill="#FBBF24" style={{ transformOrigin: "50px 50px", rotate: `${i * 45}deg` }} />)}
    <circle cx={50} cy={50} r={24} fill="#FBBF24" />
  </svg>
);
const Numbers: React.FC = () => {
  const t = useT();
  const a = LS(8), b = LS(10);
  const k = ramp(t, a, 0.3);
  const eye = pop(t, W(8, 0), 12), eyeX = ramp(t, W(8, 1), 0.3);
  const sun = pop(t, W(8, 2), 12), sunX = ramp(t, W(8, 3), 0.3);
  const icons = 1 - ramp(t, LS(9) - 0.1, 0.35);
  const wave = (pr: number, pc: number) => {
    const d = t - W(9, 1) - (pr + pc) * 0.09;
    return d > 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI) : 0;
  };
  const glowOn = ramp(t, W(9, 3), 0.4);
  const cell = 42, size = 16 * cell;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: (1080 - size) / 2, top: 640, scale: `${1 + 0.03 * ramp(t, a, 2.5)}` }}>
        <Pic img={CAT} cell={cell} num={() => k} frame={glowOn > 0.01 ? C.green : undefined} glow={(pr, pc) => { const w = wave(pr, pc); return w > 0.02 ? { k: w, color: C.green } : null; }} />
      </div>
      {icons > 0.01 && (
        <>
          <div style={{ position: "absolute", left: 210, top: 440, width: 220, height: 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, eye * 1.5) * icons, scale: `${lerp(0.4, 1, eye)}`, translate: `${shake(t, W(8, 1), 10)}px 0px` }}>
            <Eye s={200} /><Slash k={eyeX} size={200} />
          </div>
          <div style={{ position: "absolute", left: 650, top: 440, width: 220, height: 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, sun * 1.5) * icons, scale: `${lerp(0.4, 1, sun)}`, translate: `${shake(t, W(8, 3), 10)}px 0px` }}>
            <Sun s={140} spin={t * 30} /><Slash k={sunX} size={170} />
          </div>
        </>
      )}
      {glowOn > 0.01 && <Center y={490} style={{ opacity: glowOn, scale: `${lerp(0.7, 1, glowOn)}` }}><Pill text="patterns in numbers" color={C.green} size={56} /></Center>}
    </Scene>
  );
};

const Question: React.FC = () => {
  const t = useT();
  const a = LS(10);
  const q1 = pop(t, W(10, 0), 12);
  const q2 = pop(t, W(10, 5), 11);
  const img = pop(t, a + 0.1, 12);
  const tag = pop(t, W(10, 7), 9, 220);
  const lines = ["What's the weirdest", "thing your photo app"];
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", top: 400, left: 40, right: 40, textAlign: "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.08, color: C.white, letterSpacing: -2, opacity: Math.min(1, (i ? q2 : q1) * 1.5), translate: `0px ${(1 - (i ? q2 : q1)) * 30}px` }}>{l}</div>
        ))}
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 108, lineHeight: 1.2, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", opacity: Math.min(1, tag * 1.5), scale: `${lerp(0.6, 1, tag)}`, translate: `${shake(t, W(10, 7) + 0.1, 10, 0.4)}px 0px` }}>mislabelled?</div>
      </div>
      <div style={{ position: "absolute", left: (1080 - 480) / 2, top: 790, opacity: Math.min(1, img * 1.5), scale: `${lerp(0.6, 1, img) * (1 + 0.02 * Math.sin(t * 2))}`, rotate: `${Math.sin(t * 1.4) * 1.5}deg` }}>
        <Pic img={CAT} cell={30} />
        {tag > 0.01 && (
          <div style={{ position: "absolute", right: -70, top: 330 }}>
            <Stamp text="wheel?" k={tag} color={C.orange} size={64} rot={-8} />
          </div>
        )}
      </div>
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "impact", 0.5], [0.02, "zap", 0.35],
  ...[...Array(6)].map((_, i) => [0.1 + i * 0.28, "tick", 0.3] as [number, string, number]),
  [W(0, 4), "error", 0.45],
  [W(1, 3), "click", 0.6], [W(1, 5), "riser", 0.3], [W(1, 5), "pop", 0.5],
  [W(2, 1), "pop", 0.6], [W(2, 3), "whoosh", 0.5], [W(2, 5), "key", 0.6], [W(2, 6), "key", 0.6], [W(2, 8), "key", 0.6],
  [LS(3) - 0.15, "whoosh", 0.6], [W(3, 4), "zap", 0.6], [W(3, 10), "impact", 0.6], [W(3, 10) + 0.1, "pop", 0.5],
  [W(4, 2), "click", 0.6], ...[...Array(8)].map((_, i) => [W(4, 5) + i * 0.1, "key", 0.35] as [number, string, number]),
  [W(5, 2), "zap", 0.5], [W(5, 5), "riser", 0.35], [W(5, 5), "chime", 0.4],
  [LS(6) - 0.15, "whoosh", 0.6], ...[...Array(9)].map((_, i) => [W(6, 0) + i * 0.11, "tick", 0.35] as [number, string, number]), [W(6, 1), "stamp", 0.9],
  [LS(7) - 0.15, "whoosh", 0.6], [W(7, 4), "click", 0.5], [W(7, 6), "chime", 0.6], [W(7, 9), "chime", 0.6],
  [LS(8) - 0.15, "whoosh", 0.5], [W(8, 1), "error", 0.6], [W(8, 3), "error", 0.6],
  [W(9, 1), "riser", 0.35], [W(9, 3), "pop", 0.6],
  [LS(10) - 0.15, "whoosh", 0.6], [W(10, 0), "pop", 0.5], [W(10, 5), "pop", 0.5], [W(10, 7), "stamp", 1], [W(10, 7) + 0.05, "impact", 0.5],
];

export const AiImageNumbers: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Hook />
    <Patches />
    <Learn />
    <Numbers />
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
