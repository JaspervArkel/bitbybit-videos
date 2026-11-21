/*
 * STORYBOARD — "Deleted files aren't (always) gone" (pillar D; ending: implication; posts 01:00+1, E7)
 * One world: a storage block map (8×5 blocks). photo.jpg lives in 12 green blocks that hold its real first bytes
 * (JPEG/JFIF header: FF D8 FF E0 00 10 4A 46 49 46 …). The same block map is freed, partly overwritten and
 * recovered on a hard drive, then wiped by TRIM on an SSD, and finally shown side by side.
 * L0 "When you delete a file, your computer usually doesn't erase it."  HOOK (frame 0 complete): "Delete doesn't" /
 *      "erase" (orange mono) + photo.jpg being dragged to the trash (cursor already moving) + the block map with the
 *      file's green blocks. File drops in the trash on "file"; on "erase" the blocks glow and a "still on the disk" chip pops.
 * L1 "It just marks the space as free."   headline out, FILE TABLE card in; photo.jpg row struck through on "marks";
 *      row becomes "FREE SPACE" on "free"; the blocks turn dashed (free) but keep their bytes.
 * L2 "On a spinning hard drive,"          a hard-drive platter spins in on "spinning"; "HARD DRIVE" chip on "hard".
 * L3 "the data stays until something new overwrites it."  freed blocks pulse on "stays"; a "new file" chip drops in on
 *      "new"; three blocks flip to orange new data on "overwrites".
 * L4 "That's why recovery tools work."    a magnifier sweeps the map on "recovery"; the 9 surviving blocks glow;
 *      "recovered 9/12 blocks" chip on "work".
 * L5 "SSDs are different. The computer sends a TRIM command,"  SSD card pops on "SSDs", shakes on "different"; a computer
 *      appears and a cable draws on "computer"; a "TRIM" packet travels to the SSD on "sends"→"command".
 * L6 "and the drive clears those blocks in the background, usually soon after."  the freed blocks wipe one by one from
 *      "clears"; "in the background" chip with spinner on "background".
 * L7 "So on a modern laptop, deleted often really means gone."  END part 1: split view. Left: laptop · SSD mini map,
 *      wipes on "deleted", "GONE" stamp on "gone".
 * L8 "On an old hard drive, it means "not yet"."  END part 2 (implication): right: old hard drive mini map, bytes still
 *      there; "NOT YET" stamp on "not". Both stay on screen to the end (takeaway visual, no CTA).
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Bug, C, Cable, Cursor, FPS, INOUT, Line, MONO, Monitor, SANS, Scene, lerp, makeTiming, pop, ramp, shake, useT } from "../../lib/ui";
import { Captions } from "../../lib/Captions";
import words from "./words.json";

const T = makeTiming(words as Line[], 2.2);
const { W, LS } = T;
export const DELETED_FILES_FRAMES = T.TOTAL_FRAMES;
const A = (p: string) => staticFile(`videos/deleted-files/${p}`);

// ---------- block map ----------
// first 24 bytes of a real JFIF (JPEG) file header, two bytes per block
const HEX = ["FF D8", "FF E0", "00 10", "4A 46", "49 46", "00 01", "01 01", "00 48", "00 48", "00 00", "FF DB", "00 43"];
const NEWHEX = ["6E 65", "77 20", "64 61"]; // "new da" in ASCII
const FILE = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const OTHER = new Set([0, 1, 2, 3, 5, 6, 24, 25, 30, 31, 32, 33, 37]);
const COLS = 8, ROWS = 5, CELL = 96, GAP = 10;
const GW = COLS * CELL + (COLS - 1) * GAP;
const GL = (1080 - GW) / 2, GT = 800;

type BS = {
  kind: "empty" | "other" | "file" | "new";
  hex?: string;
  freed?: number; // 0..1 dashed "free" look
  glow?: number; // 0..1
  wipe?: number; // 0..1 file data cleared
  dim?: number; // 0..1
  pop?: number; // 0..1 scale-in for new data
};
const Block: React.FC<{ s: BS; size: number }> = ({ s, size }) => {
  const freed = s.freed ?? 0, glow = s.glow ?? 0, wipe = s.wipe ?? 0, dim = s.dim ?? 0;
  const base: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: size * 0.15 };
  if (s.kind === "empty") return <div style={{ ...base, border: "3px solid rgba(245,241,232,.10)", background: "rgba(245,241,232,.03)" }} />;
  if (s.kind === "other") return <div style={{ ...base, background: "rgba(245,241,232,.16)", border: "3px solid rgba(245,241,232,.22)" }} />;
  const isNew = s.kind === "new";
  const col = isNew ? C.orange : C.green;
  const dataK = isNew ? 1 : 1 - wipe;
  const flash = wipe > 0 && wipe < 1 ? Math.sin(wipe * Math.PI) : 0;
  const pk = s.pop ?? 1;
  return (
    <>
      {/* the slot (visible once data is wiped or while freed) */}
      <div style={{ ...base, border: `4px dashed rgba(245,241,232,${0.12 + 0.3 * freed})`, background: "rgba(245,241,232,.03)" }} />
      {dataK > 0.01 && (
        <div style={{
          ...base, inset: freed * 7,
          background: isNew ? C.orange : `rgba(74,222,128,${(0.9 - 0.42 * freed) * (1 - dim * 0.6)})`,
          opacity: dataK, scale: `${isNew ? lerp(1.6, 1, pk) : 1}`,
          boxShadow: glow > 0.01 ? `0 0 ${46 * glow}px ${col}` : undefined,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: MONO, fontWeight: 800, fontSize: size * 0.24, color: isNew ? C.navy : `rgba(16,27,53,${0.95 - 0.25 * freed})`,
        }}>{s.hex}</div>
      )}
      {flash > 0.01 && <div style={{ ...base, background: C.white, opacity: flash * 0.9, boxShadow: `0 0 40px ${C.white}` }} />}
    </>
  );
};
const BlockMap: React.FC<{ state: (i: number) => BS; style?: React.CSSProperties }> = ({ state, style }) => (
  <div style={{ position: "absolute", left: GL, top: GT, width: GW, height: ROWS * CELL + (ROWS - 1) * GAP, ...style }}>
    {[...Array(COLS * ROWS)].map((_, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      return (
        <div key={i} style={{ position: "absolute", left: c * (CELL + GAP), top: r * (CELL + GAP), width: CELL, height: CELL }}>
          <Block s={state(i)} size={CELL} />
        </div>
      );
    })}
  </div>
);
const fileIdx = (i: number) => FILE.indexOf(i);
const baseState = (i: number): BS => (fileIdx(i) >= 0 ? { kind: "file", hex: HEX[fileIdx(i)] } : OTHER.has(i) ? { kind: "other" } : { kind: "empty" });

// ---------- icons ----------
const PhotoIcon: React.FC<{ w?: number }> = ({ w = 150 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <svg width={w} height={w} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,.5))" }}>
      <rect x={4} y={4} width={92} height={92} rx={14} fill="#3B6FB6" stroke="#F5F1E8" strokeWidth={5} />
      <circle cx={70} cy={30} r={11} fill="#FBBF24" />
      <path d="M8 84 L36 50 L54 70 L66 58 L92 84 Z" fill={C.green} />
    </svg>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.white, background: "rgba(16,27,53,.9)", padding: "4px 14px", borderRadius: 8 }}>photo.jpg</div>
  </div>
);
const Trash: React.FC<{ s?: number; lid?: number; full?: number }> = ({ s = 180, lid = 0, full = 0 }) => (
  <svg width={s} height={s * 1.15} viewBox="0 0 100 115" style={{ overflow: "visible", filter: "drop-shadow(0 0 14px rgba(245,241,232,.25))" }}>
    <g style={{ transformOrigin: "88px 22px", rotate: `${lid * 28}deg` }}>
      <rect x={8} y={14} width={84} height={10} rx={4} fill={C.white} />
      <rect x={38} y={6} width={24} height={10} rx={4} fill="none" stroke={C.white} strokeWidth={5} />
    </g>
    <path d="M16 30 H84 L78 110 H22 Z" fill="rgba(245,241,232,.08)" stroke={C.white} strokeWidth={6} strokeLinejoin="round" />
    {full > 0.01 && <rect x={30} y={44} width={40} height={40} rx={6} fill="#3B6FB6" opacity={full} />}
    {[36, 50, 64].map((x) => <line key={x} x1={x} y1={42} x2={x} y2={98} stroke={C.white} strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
  </svg>
);
const Platter: React.FC<{ s?: number; spin: number }> = ({ s = 300, spin }) => (
  <svg width={s} height={s} viewBox="0 0 200 200" style={{ overflow: "visible", filter: "drop-shadow(0 0 18px rgba(74,222,128,.35))" }}>
    <rect x={4} y={4} width={192} height={192} rx={22} fill="#0D1630" stroke={C.green} strokeWidth={5} />
    <g style={{ transformOrigin: "92px 100px", rotate: `${spin}deg` }}>
      <circle cx={92} cy={100} r={78} fill="#1E2C52" stroke="rgba(245,241,232,.35)" strokeWidth={3} />
      {[64, 50, 36].map((r) => <circle key={r} cx={92} cy={100} r={r} fill="none" stroke="rgba(245,241,232,.14)" strokeWidth={2} />)}
      <path d="M92 100 L92 22 A78 78 0 0 1 150 48 Z" fill="rgba(245,241,232,.14)" />
      <circle cx={92} cy={100} r={12} fill="#8A93A8" />
    </g>
    <path d="M178 176 L178 150 L118 70" fill="none" stroke={C.white} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={178} cy={176} r={10} fill={C.white} />
  </svg>
);
const SSDCard: React.FC<{ w?: number; glow?: number }> = ({ w = 300, glow = 0 }) => (
  <div style={{ width: w, height: w * 0.55, borderRadius: 20, background: "#0D1630", border: `5px solid ${C.green}`, boxShadow: `0 0 ${20 + 40 * glow}px rgba(74,222,128,${0.3 + 0.4 * glow})`, position: "relative" }}>
    {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: 24 + i * (w - 48) / 4, top: 26, width: (w - 48) / 4 - 14, height: w * 0.22, borderRadius: 8, background: "#22305A", border: "3px solid rgba(245,241,232,.3)" }} />)}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: w * 0.12, color: C.green, letterSpacing: 4 }}>SSD</div>
  </div>
);
const Magnifier: React.FC<{ s?: number }> = ({ s = 190 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible", filter: "drop-shadow(0 0 16px rgba(74,222,128,.7))" }}>
    <circle cx={40} cy={40} r={30} fill="rgba(74,222,128,.12)" stroke={C.green} strokeWidth={8} />
    <line x1={62} y1={62} x2={92} y2={92} stroke={C.green} strokeWidth={12} strokeLinecap="round" />
  </svg>
);
const Spinner: React.FC<{ s?: number; t: number }> = ({ s = 44, t }) => (
  <svg width={s} height={s} viewBox="0 0 40 40" style={{ rotate: `${t * 360}deg` }}>
    <circle cx={20} cy={20} r={15} fill="none" stroke="rgba(74,222,128,.25)" strokeWidth={6} />
    <path d="M20 5 A15 15 0 0 1 35 20" fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" />
  </svg>
);
const Pill: React.FC<{ k: number; color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, color = C.green, size = 44, children, style }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: size, color, padding: `${size * 0.2}px ${size * 0.5}px`, borderRadius: size * 0.4, background: "rgba(10,18,38,.94)", border: `4px solid ${color}`, boxShadow: `0 0 40px ${color}44`, whiteSpace: "nowrap", opacity: Math.min(1, k * 1.5), scale: `${lerp(0.5, 1, k)}`, ...style }}>{children}</div>
  );
const Stamp: React.FC<{ text: string; k: number; color: string; size?: number; rot?: number }> = ({ text, k, color, size = 92, rot = -7 }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, border: `8px solid ${color}`, borderRadius: 22, padding: "2px 30px", background: "rgba(10,18,38,.94)", rotate: `${rot}deg`, scale: `${lerp(2.2, 1, k)}`, opacity: Math.min(1, k * 2), boxShadow: `0 0 50px ${color}77`, whiteSpace: "nowrap" }}>{text}</div>
);
const centered = (cx: number): React.CSSProperties => ({ left: cx, translate: "-50% 0px" });

// ---------- scene 1: delete (L0–L1) ----------
const Delete: React.FC = () => {
  const t = useT();
  const drag = ramp(t, 0, 1.0, INOUT); // cursor already moving at frame 0
  const drop = ramp(t, 1.0, 0.25);
  const head = 1 - ramp(t, LS(1) - 0.2, 0.3);
  const binOut = 1 - ramp(t, LS(1) - 0.1, 0.35);
  const lid = Math.sin(Math.min(1, ramp(t, 0.75, 0.6)) * Math.PI);
  const still = pop(t, W(0, 9), 11);
  const glow = pop(t, W(0, 9), 9) * (1 - ramp(t, W(0, 9) + 0.6, 0.6)) + 0.25 * still;
  const table = pop(t, LS(1) - 0.05, 13);
  const strike = ramp(t, W(1, 2), 0.35, INOUT);
  const freeK = pop(t, W(1, 6), 12);
  const freed = ramp(t, W(1, 4), 0.5, INOUT);
  const fx = lerp(150, 690, drag), fy = lerp(520, 470, drag) - Math.sin(drag * Math.PI) * 40;
  return (
    <Scene a={0} b={LS(2)} enter={false}>
      {head > 0.01 && (
        <div style={{ position: "absolute", top: 165, left: 0, right: 0, textAlign: "center", opacity: head }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: C.white, letterSpacing: -2 }}>Delete doesn't</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 156, lineHeight: 1.12, color: C.orange, textShadow: "0 0 50px rgba(251,146,60,.55)", translate: `${shake(t, W(0, 9), 12, 0.45)}px 0px` }}>erase</div>
        </div>
      )}
      {binOut > 0.01 && (
        <div style={{ opacity: binOut }}>
          <div style={{ position: "absolute", left: 760, top: 500 }}><Trash s={170} lid={lid} full={drop} /></div>
          {drop < 1 && (
            <div style={{ position: "absolute", left: fx, top: fy, opacity: 1 - drop, scale: `${lerp(1, 0.3, drop)}`, transformOrigin: "50% 50%" }}>
              <PhotoIcon w={140} />
            </div>
          )}
          <Cursor x={fx + 95} y={fy + 80} down={drag < 1 ? 1 : 0} opacity={1 - ramp(t, 1.05, 0.3)} />
        </div>
      )}
      {/* file table */}
      {table > 0.01 && (
        <div style={{ position: "absolute", left: 130, right: 130, top: 470, height: 250, borderRadius: 26, background: "rgba(10,18,38,.95)", border: "4px solid rgba(245,241,232,.3)", opacity: Math.min(1, table * 1.5), scale: `${lerp(0.7, 1, table)}`, padding: "22px 36px" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.dim, letterSpacing: 3 }}>FILE TABLE</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "rgba(245,241,232,.55)" }}>notes.txt → blocks 0–3</div>
          <div style={{ position: "relative", marginTop: 12, height: 60 }}>
            <div style={{ position: "absolute", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white, opacity: 1 - freeK }}>photo.jpg → blocks 9–20</div>
            <div style={{ position: "absolute", left: -8, top: 26, height: 7, width: `${strike * 104}%`, background: C.orange, borderRadius: 4, boxShadow: "0 0 18px #FB923C", opacity: 1 - freeK }} />
            <div style={{ position: "absolute", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: freeK, translate: `${(1 - freeK) * 30}px 0px` }}>FREE SPACE → blocks 9–20</div>
          </div>
        </div>
      )}
      <Pill k={still * (1 - ramp(t, LS(1) - 0.2, 0.25))} style={{ ...centered(540), top: 712 }} size={38}>still on the disk</Pill>
      <BlockMap state={(i) => {
        const s = baseState(i);
        return s.kind === "file" ? { ...s, glow, freed } : s;
      }} />
    </Scene>
  );
};

// ---------- scene 2: hard drive (L2–L4) ----------
const HardDrive: React.FC = () => {
  const t = useT();
  const a = LS(2), b = LS(5);
  const plat = pop(t, W(2, 2) - 0.1, 12);
  const spin = (t - a) * 520;
  const hdd = pop(t, W(2, 3), 12);
  const stays = (i: number) => { const d = t - W(3, 2) - fileIdx(i) * 0.04; return d > 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI) : 0; };
  const newK = pop(t, W(3, 5), 12) * (1 - ramp(t, LS(4) - 0.2, 0.3));
  const ow = (j: number) => pop(t, W(3, 6) + j * 0.13, 12);
  const mag = ramp(t, W(4, 2) - 0.1, 1.0, INOUT);
  const magK = ramp(t, W(4, 2) - 0.2, 0.2) * (1 - ramp(t, W(4, 4) + 0.1, 0.3));
  const found = (i: number) => (mag * 12 > fileIdx(i) ? 1 : 0);
  const rec = pop(t, W(4, 4), 11);
  const mx = lerp(GL - 40, GL + GW - 120, mag), my = GT + (CELL + GAP) * 1 - 40 + Math.sin(mag * Math.PI * 2) * 60;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: 120, top: 470, opacity: Math.min(1, plat * 1.5), scale: `${lerp(0.5, 1, plat)}` }}><Platter s={280} spin={spin} /></div>
      <Pill k={hdd * (1 - rec)} style={{ left: 450, top: 520 }} size={46}>HARD DRIVE</Pill>
      <Pill k={newK} color={C.orange} style={{ left: 450, top: 620 }} size={40}>+ new file</Pill>
      <Pill k={rec} style={{ left: 450, top: 560 }} size={40}>recovered 9/12 ✓</Pill>
      <BlockMap state={(i) => {
        const s = baseState(i);
        if (s.kind !== "file") return s;
        const j = fileIdx(i);
        if (j < 3 && ow(j) > 0.01) return { kind: "new", hex: NEWHEX[j], pop: ow(j) };
        const g = Math.max(stays(i), found(i) * (0.5 + 0.5 * rec));
        return { ...s, freed: 1 - found(i) * 0.6, glow: g };
      }} />
      {magK > 0.01 && <div style={{ position: "absolute", left: mx, top: my, opacity: magK }}><Magnifier s={200} /></div>}
    </Scene>
  );
};

// ---------- scene 3: SSD + TRIM (L5–L6) ----------
const Ssd: React.FC = () => {
  const t = useT();
  const a = LS(5), b = LS(7);
  const ssd = pop(t, W(5, 0), 11);
  const pc = pop(t, W(5, 4) - 0.1, 12);
  const cable = ramp(t, W(5, 4), 0.45, INOUT);
  const pk = ramp(t, W(5, 5), W(5, 8) + 0.25 - W(5, 5), INOUT);
  const pkK = ramp(t, W(5, 5), 0.15) * (1 - ramp(t, W(5, 8) + 0.25, 0.2));
  const hit = pop(t, W(5, 8) + 0.3, 9) * (1 - ramp(t, W(6, 3), 0.5));
  const wipe = (i: number) => ramp(t, W(6, 3) + fileIdx(i) * 0.1, 0.35);
  const bg = pop(t, W(6, 8), 12);
  const x1 = 290, y1 = 590, x2 = 650, y2 = 590;
  return (
    <Scene a={a} b={b}>
      <div style={{ position: "absolute", left: 90, top: 470, opacity: Math.min(1, pc * 1.5), scale: `${lerp(0.5, 1, pc)}` }}><Monitor size={210} /></div>
      <Cable x1={x1} y1={y1} x2={x2} y2={y2} p={cable} pulse={false} />
      <div style={{ position: "absolute", left: 650, top: 500, opacity: Math.min(1, ssd * 1.5), scale: `${lerp(0.4, 1, ssd)}`, translate: `${shake(t, W(5, 2), 14, 0.5)}px 0px` }}><SSDCard w={330} glow={hit} /></div>
      {pkK > 0.01 && (
        <div style={{ position: "absolute", left: lerp(x1 - 40, x2 - 130, pk), top: y1 - 40, opacity: pkK }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.navy, background: C.green, padding: "6px 20px", borderRadius: 14, boxShadow: "0 0 40px #4ADE80" }}>TRIM</div>
        </div>
      )}
      <Pill k={bg} style={{ ...centered(540), top: 710 }} size={36}><Spinner t={t} s={40} />in the background</Pill>
      <BlockMap state={(i) => {
        const s = baseState(i);
        if (s.kind !== "file") return s;
        return { ...s, freed: 1, wipe: wipe(i), glow: hit * 0.8 };
      }} />
    </Scene>
  );
};

// ---------- scene 4: verdict (L7–L8) ----------
const MC = 100, MG = 10, MW = 3 * MC + 2 * MG, MT = 735;
const MiniMap: React.FC<{ cx: number; state: (j: number) => BS }> = ({ cx, state }) => (
  <div style={{ position: "absolute", left: cx - MW / 2, top: MT, width: MW, height: 4 * MC + 3 * MG }}>
    {HEX.map((_, j) => (
      <div key={j} style={{ position: "absolute", left: (j % 3) * (MC + MG), top: Math.floor(j / 3) * (MC + MG), width: MC, height: MC }}>
        <Block s={state(j)} size={MC} />
      </div>
    ))}
  </div>
);
const Verdict: React.FC = () => {
  const t = useT();
  const a = LS(7);
  const left = pop(t, W(7, 3) - 0.1, 12);
  const wipe = (j: number) => ramp(t, W(7, 5) + j * 0.07, 0.3);
  const gone = pop(t, W(7, 9), 9, 220);
  const right = pop(t, W(8, 2) - 0.15, 12);
  const pulse = (j: number) => { const d = t - W(8, 4) - j * 0.04; return d > 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI) : 0; };
  const notyet = pop(t, W(8, 7), 9, 220);
  const LX = 280, RX = 800;
  return (
    <Scene a={a} b={T.END + 1} exit={false}>
      <div style={{ position: "absolute", left: LX - 85, top: 470, opacity: Math.min(1, left * 1.5), scale: `${lerp(0.5, 1, left)}` }}><Monitor size={170} /></div>
      <div style={{ position: "absolute", ...centered(LX), top: 652, opacity: Math.min(1, left * 1.5), fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, whiteSpace: "nowrap" }}>laptop · SSD</div>
      <div style={{ opacity: Math.min(1, left * 1.5) }}>
        <MiniMap cx={LX} state={(j) => ({ kind: "file", hex: HEX[j], freed: 1, wipe: wipe(j) })} />
      </div>
      <div style={{ position: "absolute", ...centered(LX), top: 1195, rotate: "0deg" }}>{gone > 0.01 && <Stamp text="GONE" k={gone} color={C.green} size={84} rot={-6} />}</div>

      <div style={{ position: "absolute", left: RX - 80, top: 480, opacity: Math.min(1, right * 1.5), scale: `${lerp(0.5, 1, right)}` }}><Platter s={160} spin={(t - a) * 520} /></div>
      <div style={{ position: "absolute", ...centered(RX), top: 652, opacity: Math.min(1, right * 1.5), fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, whiteSpace: "nowrap" }}>old hard drive</div>
      <div style={{ opacity: Math.min(1, right * 1.5), translate: `${(1 - right) * 60}px 0px` }}>
        <MiniMap cx={RX} state={(j) => ({ kind: "file", hex: HEX[j], freed: 1, glow: pulse(j) + 0.3 * notyet })} />
      </div>
      <div style={{ position: "absolute", ...centered(RX), top: 1195 }}>{notyet > 0.01 && <Stamp text="NOT YET" k={notyet} color={C.orange} size={78} rot={-6} />}</div>
      <div style={{ position: "absolute", left: 540 - 2, top: 500, width: 4, height: 780 * ramp(t, W(8, 1), 0.5, INOUT), background: "rgba(245,241,232,.18)", borderRadius: 2 }} />
    </Scene>
  );
};

// ---------- sound cues ----------
const SFX: [number, string, number][] = [
  [0, "whoosh", 0.4], [0.02, "click", 0.6], [0.95, "pop", 0.6], [1.15, "impact", 0.45],
  [W(0, 9), "error", 0.5], [W(0, 9) + 0.05, "pop", 0.45],
  [LS(1) - 0.1, "whoosh", 0.45], [W(1, 2), "zap", 0.5], [W(1, 4), "riser", 0.3], [W(1, 6), "chime", 0.55],
  [LS(2) - 0.15, "whoosh", 0.6], [W(2, 2), "vortex", 0.35], [W(2, 3), "pop", 0.55],
  [W(3, 2), "riser", 0.3], [W(3, 5), "pop", 0.55], [W(3, 6), "stamp", 0.6], [W(3, 6) + 0.13, "stamp", 0.5], [W(3, 6) + 0.26, "stamp", 0.5],
  [W(4, 2), "whoosh", 0.4], ...[...Array(6)].map((_, i) => [W(4, 2) + i * 0.15, "tick", 0.35] as [number, string, number]), [W(4, 4), "chime", 0.6],
  [LS(5) - 0.15, "whoosh", 0.6], [W(5, 0), "impact", 0.5], [W(5, 2), "error", 0.45], [W(5, 4), "click", 0.55],
  [W(5, 5), "zap", 0.5], [W(5, 8) + 0.3, "impact", 0.5],
  ...[...Array(12)].map((_, i) => [W(6, 3) + i * 0.1, "key", 0.32] as [number, string, number]), [W(6, 8), "pop", 0.5], [W(6, 10), "tick", 0.4],
  [LS(7) - 0.15, "whoosh", 0.6], [W(7, 3), "pop", 0.55], ...[...Array(6)].map((_, i) => [W(7, 5) + i * 0.14, "key", 0.3] as [number, string, number]),
  [W(7, 9), "stamp", 1],
  [W(8, 2) - 0.1, "pop", 0.55], [W(8, 4), "riser", 0.3], [W(8, 7), "stamp", 1], [W(8, 7) + 0.05, "impact", 0.5],
];

export const DeletedFiles: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Background retro={0} />
    <Delete />
    <HardDrive />
    <Ssd />
    <Verdict />
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
